<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\Notification;
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
                'id'             => $a->id,
                'client'         => $a->client?->name ?? 'Unknown',
                'therapist'      => $a->therapist?->name ?? 'Unassigned',
                'therapist_id'   => $a->therapist_id,
                'service'        => $a->service?->name ?? 'Unknown',
                'datetime'       => $a->datetime,
                'status'         => $a->status,
                'notes'          => $a->notes,
                'payment_status' => $a->payment_status ?? 'unpaid',
                'payment_method' => $a->payment_method ?? 'cash',
                'amount_paid'    => $a->amount_paid ? (float)$a->amount_paid : null,
                'paid_at'        => $a->paid_at ? $a->paid_at->format('Y-m-d H:i:s') : null,
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
                'payment_status'   => $a->payment_status ?? 'unpaid',
                'payment_method'   => $a->payment_method ?? 'cash',
                'amount_paid'      => $a->amount_paid ? (float)$a->amount_paid : null,
                'paid_at'          => $a->paid_at ? $a->paid_at->format('Y-m-d H:i:s') : null,
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
            'status' => 'required|in:Pending,Confirmed,In Progress,Completed by Therapist,Completed,Cancelled',
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
            if ($appt->payment_status !== 'paid') {
                $appt->payment_status = 'paid';
                $appt->payment_method = $request->payment_method ?? 'cash';
                $appt->amount_paid = $request->amount_paid ?? ($appt->service ? (float)$appt->service->price : 0.00);
                $appt->paid_at = now();
                $appt->save();
            }

            Notification::create([
                'type'           => 'completed',
                'title'          => 'Session Completed & Cash Settled',
                'description'    => ($appt->client->name ?? 'Client') . ' — ' . ($appt->service->name ?? 'Service'),
                'appointment_id' => $appt->id,
            ]);
        }

        return response()->json([
            'message' => 'Appointment status updated to ' . $request->status,
            'appointment' => [
                'id'             => $appt->id,
                'client'         => $appt->client?->name ?? 'Client',
                'therapist'      => $appt->therapist?->name ?? 'Unassigned',
                'therapist_id'   => $appt->therapist_id,
                'service'        => $appt->service?->name ?? 'Service',
                'datetime'       => $appt->datetime,
                'status'         => $appt->status,
                'notes'          => $appt->notes,
                'payment_status' => $appt->payment_status,
                'payment_method' => $appt->payment_method ?? 'cash',
                'amount_paid'    => $appt->amount_paid ? (float)$appt->amount_paid : null,
                'paid_at'        => $appt->paid_at ? $appt->paid_at->format('Y-m-d H:i:s') : null,
            ]
        ]);
    }

    /**
     * Settle cash payment after treatment session is completed (Staff).
     */
    public function settleCashPayment(Request $request, $id)
    {
        $request->validate([
            'amount_paid'   => 'required|numeric|min:0',
            'cash_tendered' => 'nullable|numeric|min:0',
            'change'        => 'nullable|numeric|min:0',
            'notes'         => 'nullable|string|max:500',
        ]);

        $appt = Appointment::with(['client', 'service', 'therapist'])->findOrFail($id);

        $oldStatus = $appt->status;
        $appt->payment_status = 'paid';
        $appt->payment_method = 'cash';
        $appt->amount_paid    = (float)$request->amount_paid;
        $appt->paid_at        = now();
        $appt->status         = 'Completed';

        if ($request->filled('notes')) {
            $appt->notes = $appt->notes ? $appt->notes . ' | ' . trim($request->notes) : trim($request->notes);
        }

        $appt->save();

        Notification::create([
            'type'           => 'completed',
            'title'          => 'Cash Payment Received & Session Finalized',
            'description'    => 'Staff received cash payment of ₱' . number_format($request->amount_paid, 2) . ' for ' . ($appt->client?->name ?? 'Client') . ' (' . ($appt->service?->name ?? 'Service') . ').',
            'appointment_id' => $appt->id,
        ]);

        $tendered = $request->cash_tendered ? (float)$request->cash_tendered : (float)$request->amount_paid;
        $change = $request->change ? (float)$request->change : max(0, $tendered - (float)$request->amount_paid);

        \App\Models\AuditLog::log('update', 'Appointment', "Staff settled cash payment of ₱" . number_format($request->amount_paid, 2) . " (Tendered: ₱" . number_format($tendered, 2) . ", Change: ₱" . number_format($change, 2) . ") for booking #{$appt->id}", [
            'actor' => auth()->user()?->name ?? 'Staff Coordinator',
            'actor_role' => 'staff',
            'module' => 'Payments',
            'severity' => 'info',
            'metadata' => [
                'appointment_id' => $appt->id,
                'amount_paid'    => (float)$appt->amount_paid,
                'cash_tendered'  => $tendered,
                'change'         => $change,
                'old_status'     => $oldStatus,
                'new_status'     => 'Completed',
                'payment_status' => 'paid',
                'payment_method' => 'cash',
            ]
        ]);

        return response()->json([
            'message' => 'Cash payment settled and appointment marked Completed!',
            'appointment' => [
                'id'             => $appt->id,
                'client'         => $appt->client?->name ?? 'Client',
                'service'        => $appt->service?->name ?? 'Service',
                'datetime'       => $appt->datetime,
                'status'         => $appt->status,
                'payment_status' => $appt->payment_status,
                'payment_method' => $appt->payment_method,
                'amount_paid'    => (float)$appt->amount_paid,
                'paid_at'        => $appt->paid_at->format('Y-m-d H:i:s'),
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
            $parsedDatetime = Carbon::parse($request->datetime);
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
