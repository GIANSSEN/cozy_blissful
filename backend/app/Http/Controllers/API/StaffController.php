<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\TherapistAvailability;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingApprovedMail;
use Illuminate\Support\Facades\Log;

class StaffController extends Controller
{
    /**
     * Staff dashboard — summary of today's therapist workload.
     */
    public function index()
    {
        $today = Carbon::today()->toDateString();

        $therapists = User::role('therapist')->with([
            'availabilities' => fn($q) => $q->where('date', $today)
        ])->get();

        $todayAppointments = Appointment::with(['client', 'therapist', 'service'])
            ->whereDate('datetime', $today)
            ->orderBy('datetime')
            ->get();

        $pendingCount   = $todayAppointments->where('status', 'Pending')->count();
        $confirmedCount = $todayAppointments->where('status', 'Confirmed')->count();
        $totalTherapists = $therapists->count();
        $availableToday  = TherapistAvailability::where('date', $today)->count();

        return response()->json([
            'stats' => [
                'total_therapists'    => $totalTherapists,
                'available_today'     => $availableToday,
                'pending_bookings'    => $pendingCount,
                'confirmed_bookings'  => $confirmedCount,
            ],
            'therapists' => $therapists->map(fn($t) => [
                'id'             => $t->id,
                'name'           => $t->name,
                'email'          => $t->email,
                'available_today' => $t->availabilities->isNotEmpty(),
            ]),
            'appointments' => $todayAppointments->map(fn($a) => [
                'id'           => $a->id,
                'client'       => $a->client?->name ?? 'Unknown',
                'therapist'    => $a->therapist?->name ?? 'Unassigned',
                'therapist_id' => $a->therapist_id,
                'service'      => $a->service?->name ?? 'Unknown',
                'datetime'     => $a->datetime,
                'status'       => $a->status,
                'notes'        => $a->notes,
            ]),
        ]);
    }

    /**
     * Get all therapists with their availability.
     */
    public function getTherapists()
    {
        $therapists = User::role('therapist')->get()->map(function ($t) {
            $avail = TherapistAvailability::where('therapist_id', $t->id)
                ->where('date', '>=', Carbon::today())
                ->orderBy('date')
                ->pluck('date')
                ->map(fn($d) => Carbon::parse($d)->toDateString())
                ->values();

            return [
                'id'             => $t->id,
                'name'           => $t->name,
                'email'          => $t->email,
                'specialty'      => 'General Wellness',
                'availabilities' => $avail,
            ];
        });

        return response()->json(['therapists' => $therapists]);
    }

    /**
     * Toggle therapist availability for a date (staff can manage schedules).
     */
    public function toggleAvailability(Request $request)
    {
        $request->validate([
            'therapist_id' => 'required|exists:users,id',
            'date'         => 'required|date',
        ]);

        $existing = TherapistAvailability::where('therapist_id', $request->therapist_id)
            ->where('date', $request->date)
            ->first();

        if ($existing) {
            $existing->delete();
            $available = false;
        } else {
            TherapistAvailability::create([
                'therapist_id' => $request->therapist_id,
                'date'         => $request->date,
            ]);
            $available = true;
        }

        return response()->json([
            'available' => $available,
            'message'   => $available ? 'Therapist marked available.' : 'Therapist marked unavailable.',
        ]);
    }

    /**
     * Get appointments with filter support (today, upcoming, or all).
     */
    public function getAppointments(Request $request)
    {
        $query = Appointment::with(['client', 'therapist', 'service']);
        $filter = $request->query('filter');

        if ($filter === 'today') {
            $query->whereDate('datetime', Carbon::today());
        } elseif ($filter === 'upcoming') {
            $query->whereDate('datetime', '>', Carbon::today());
        } else {
            $query->where('datetime', '>=', Carbon::today());
        }

        $appointments = $query->orderBy('datetime')
            ->limit(100)
            ->get()
            ->map(fn($a) => [
                'id'               => $a->id,
                'client'           => $a->client?->name ?? 'Unknown',
                'therapist'        => $a->therapist?->name ?? 'Unassigned',
                'therapist_id'     => $a->therapist_id,
                'service'          => $a->service?->name ?? 'Unknown',
                'service_id'       => $a->service_id,
                'service_price'    => $a->service ? (float)$a->service->price : null,
                'service_duration' => $a->service ? (int)$a->service->duration : null,
                'datetime'         => $a->datetime,
                'status'           => $a->status,
                'notes'            => $a->notes,
            ]);

        return response()->json(['appointments' => $appointments]);
    }

    /**
     * Assign therapist to appointment.
     */
    public function assignTherapist(Request $request, $id)
    {
        $request->validate([
            'therapist_id' => 'nullable|exists:users,id',
        ]);

        $appt = Appointment::findOrFail($id);
        $oldStatus = $appt->status;
        $appt->therapist_id = $request->therapist_id;

        if ($request->therapist_id && $appt->status === 'Pending') {
            $appt->status = 'Confirmed';
        }

        $appt->save();
        $appt->load(['client', 'therapist', 'service']);

        if ($oldStatus !== 'Confirmed' && $appt->status === 'Confirmed' && $appt->client && $appt->client->email) {
            try {
                Mail::to($appt->client->email)->send(new BookingApprovedMail($appt));
            } catch (\Exception $e) {
                Log::error('Failed to send booking approved email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Therapist assigned successfully',
            'appointment' => [
                'id'           => $appt->id,
                'client'       => $appt->client?->name ?? 'Client',
                'therapist'    => $appt->therapist?->name ?? 'Unassigned',
                'therapist_id' => $appt->therapist_id,
                'service'      => $appt->service?->name ?? 'Service',
                'datetime'     => $appt->datetime,
                'status'       => $appt->status,
                'notes'        => $appt->notes,
            ]
        ]);
    }

    /**
     * Update appointment status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Pending,Confirmed,In Progress,Completed,Cancelled',
            'reason' => 'nullable|string',
        ]);

        $appt = Appointment::findOrFail($id);
        $oldStatus = $appt->status;
        $appt->status = $request->status;

        if ($request->filled('reason')) {
            $reasonText = 'Rejection Reason: ' . trim($request->reason);
            $appt->notes = $appt->notes ? $appt->notes . ' | ' . $reasonText : $reasonText;
        }

        $appt->save();

        $appt->load(['client', 'therapist', 'service']);

        if ($oldStatus !== 'Confirmed' && $request->status === 'Confirmed' && $appt->client && $appt->client->email) {
            try {
                Mail::to($appt->client->email)->send(new BookingApprovedMail($appt));
            } catch (\Exception $e) {
                Log::error('Failed to send booking approved email: ' . $e->getMessage());
            }
        }

        if ($oldStatus !== 'In Progress' && $appt->status === 'In Progress') {
            Notification::create([
                'type'           => 'in_progress',
                'title'          => 'Session In Progress',
                'description'    => ($appt->client->name ?? 'Client') . ' — ' . ($appt->service->name ?? 'Service'),
                'appointment_id' => $appt->id,
            ]);
        }

        if ($oldStatus !== 'Completed' && $appt->status === 'Completed') {
            Notification::create([
                'type'           => 'completed',
                'title'          => 'Session Completed',
                'description'    => ($appt->client->name ?? 'Client') . ' — ' . ($appt->service->name ?? 'Service'),
                'appointment_id' => $appt->id,
            ]);
        }

        return response()->json([
            'message' => 'Appointment status updated to ' . $request->status,
            'appointment' => [
                'id'           => $appt->id,
                'client'       => $appt->client?->name ?? 'Client',
                'therapist'    => $appt->therapist?->name ?? 'Unassigned',
                'therapist_id' => $appt->therapist_id,
                'service'      => $appt->service?->name ?? 'Service',
                'datetime'     => $appt->datetime,
                'status'       => $appt->status,
                'notes'        => $appt->notes,
            ]
        ]);
    }

    /**
     * Reschedule appointment (Staff).
     */
    public function reschedule(Request $request, $id)
    {
        $request->validate([
            'datetime' => 'required|date|after:now',
            'notes'    => 'nullable|string|max:500',
        ]);

        $appt = Appointment::findOrFail($id);

        try {
            $parsedDatetime = \Carbon\Carbon::parse($request->datetime);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid datetime format.'], 422);
        }

        $oldDatetime = $appt->datetime->format('Y-m-d H:i:s');
        $appt->datetime = $parsedDatetime;
        if ($request->filled('notes')) {
            $noteText = 'Rescheduled: ' . trim($request->notes);
            $appt->notes = $appt->notes ? $appt->notes . ' | ' . $noteText : $noteText;
        }

        $appt->reminder_24h_sent_at = null;
        $appt->reminder_2h_sent_at = null;
        $appt->save();

        $appt->load(['client', 'therapist', 'service']);

        return response()->json([
            'message' => 'Appointment rescheduled successfully',
            'appointment' => [
                'id'           => $appt->id,
                'client'       => $appt->client?->name ?? 'Client',
                'therapist'    => $appt->therapist?->name ?? 'Unassigned',
                'therapist_id' => $appt->therapist_id,
                'service'      => $appt->service?->name ?? 'Service',
                'datetime'     => $appt->datetime,
                'status'       => $appt->status,
                'notes'        => $appt->notes,
            ]
        ]);
    }
}
