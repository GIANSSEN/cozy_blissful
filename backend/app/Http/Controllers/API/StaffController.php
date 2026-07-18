<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Appointment;
use App\Models\TherapistAvailability;
use Carbon\Carbon;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * Staff dashboard — summary of today's therapist workload.
     */
    public function index()
    {
        $today = Carbon::today()->toDateString();

        $therapists = User::role('therapist')->with([
            'availabilities' => fn($q) => $q->whereDate('date', $today)
        ])->get();

        $todayAppointments = Appointment::with(['client', 'therapist', 'service'])
            ->whereDate('datetime', $today)
            ->orderBy('datetime')
            ->get();

        $pendingCount   = $todayAppointments->where('status', 'Pending')->count();
        $confirmedCount = $todayAppointments->where('status', 'Confirmed')->count();
        $totalTherapists = $therapists->count();
        $availableToday  = TherapistAvailability::whereDate('date', $today)->count();

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
                'id'         => $a->id,
                'client'     => $a->client?->name ?? 'Unknown',
                'therapist'  => $a->therapist?->name ?? 'Unassigned',
                'service'    => $a->service?->name ?? 'Unknown',
                'datetime'   => $a->datetime,
                'status'     => $a->status,
                'notes'      => $a->notes,
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
            ->whereDate('date', $request->date)
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
     * Get today's + upcoming appointments (read-only view for staff).
     */
    public function getAppointments()
    {
        $appointments = Appointment::with(['client', 'therapist', 'service'])
            ->where('datetime', '>=', Carbon::today())
            ->orderBy('datetime')
            ->limit(50)
            ->get()
            ->map(fn($a) => [
                'id'        => $a->id,
                'client'    => $a->client?->name ?? 'Unknown',
                'therapist' => $a->therapist?->name ?? 'Unassigned',
                'service'   => $a->service?->name ?? 'Unknown',
                'datetime'  => $a->datetime,
                'status'    => $a->status,
                'notes'     => $a->notes,
            ]);

        return response()->json(['appointments' => $appointments]);
    }
}
