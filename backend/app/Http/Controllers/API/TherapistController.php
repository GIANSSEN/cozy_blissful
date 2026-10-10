<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Notification;
use App\Models\TherapistAvailability;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TherapistController extends Controller
{
    /**
     * Display the Therapist Job Portal and appointments.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // 1. Calculate stats
        $myAppointmentsCount = Appointment::where('therapist_id', $user->id)
            ->whereIn('status', ['Pending', 'Confirmed', 'In Progress', 'Completed by Therapist'])
            ->count();

        $completedSessions = Appointment::where('therapist_id', $user->id)
            ->whereIn('status', ['Completed by Therapist', 'Completed'])
            ->count();

        // Total hours worked based on completed appointments
        $hoursWorked = Appointment::where('appointments.therapist_id', $user->id)
            ->whereIn('appointments.status', ['Completed by Therapist', 'Completed'])
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->sum('services.duration') / 60.0;
        $hoursWorked = round($hoursWorked, 1);

        // 2. Fetch all appointments assigned to this therapist
        $rawAppointments = Appointment::with(['client', 'service'])
            ->where('therapist_id', $user->id)
            ->whereIn('status', ['Pending', 'Confirmed', 'In Progress', 'Completed by Therapist', 'Completed'])
            ->orderBy('datetime', 'desc')
            ->get();

        // Group appointments by booking_group_id so multi-service packages show as ONE unified session card
        $grouped = $rawAppointments->groupBy(function ($appt) {
            return $appt->booking_group_id ?: ('single_' . $appt->id);
        });

        $appointments = $grouped->map(function ($group) {
            $first = $group->first();
            $isMulti = $group->count() > 1;

            $totalPrice = (float) $group->sum(fn($a) => (float) ($a->service->price ?? 0));
            $totalDuration = (int) $group->sum(fn($a) => (int) ($a->service->duration ?? 60));

            // Consolidated Status determination:
            if ($group->contains('status', 'In Progress')) {
                $status = 'In Progress';
            } elseif ($group->every('status', 'Completed')) {
                $status = 'Completed';
            } elseif ($group->every(fn($a) => in_array($a->status, ['Completed', 'Completed by Therapist']))) {
                $status = 'Completed by Therapist';
            } else {
                $status = $first->status;
            }

            $servicesList = $group->map(function ($a) {
                return [
                    'id'       => $a->id,
                    'name'     => $a->service ? $a->service->name : 'Massage Service',
                    'duration' => $a->service ? (int) $a->service->duration : 60,
                    'price'    => $a->service ? (float) $a->service->price : 0,
                    'category' => $a->service ? $a->service->category : null,
                    'status'   => $a->status,
                ];
            })->values()->toArray();

            $serviceNames = $group->map(fn($a) => $a->service ? $a->service->name : 'Massage Service')->values();
            $serviceLabel = $isMulti ? $serviceNames->implode(', ') : ($first->service ? $first->service->name : 'Massage Service');

            $uniqueNotes = $group->pluck('notes')->filter()->unique()->implode(" | ");

            return [
                'id'               => $first->id,
                'appointment_ids'  => $group->pluck('id')->sort()->values()->toArray(),
                'booking_group_id' => $first->booking_group_id,
                'is_multi_service' => $isMulti,
                'services_count'   => $group->count(),
                'client_name'      => $first->client ? $first->client->name : 'Client',
                'client_phone'     => $first->client && $first->client->phone ? $first->client->phone : 'Not provided',
                'service'          => $serviceLabel,
                'services'         => $servicesList,
                'duration'         => $totalDuration,
                'price'            => $totalPrice,
                'datetime'         => $first->datetime->format('Y-m-d H:i:s'),
                'notes'            => $uniqueNotes,
                'status'           => $status,
                'payment_status'   => $first->payment_status ?? 'unpaid',
            ];
        })->values();

        // 3. Fetch available jobs (unassigned appointments matching therapist availability)
        $availDates = TherapistAvailability::where('therapist_id', $user->id)->pluck('date')->toArray();

        $rawAvailableJobs = Appointment::with(['client', 'service'])
            ->whereNull('therapist_id')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->get()
            ->filter(function ($appt) use ($availDates) {
                $apptDate = $appt->datetime->format('Y-m-d');
                return in_array($apptDate, $availDates);
            });

        $groupedJobs = $rawAvailableJobs->groupBy(function ($appt) {
            return $appt->booking_group_id ?: ('single_' . $appt->id);
        });

        $availableJobs = $groupedJobs->map(function ($group) {
            $first = $group->first();
            $isMulti = $group->count() > 1;
            $totalDuration = (int) $group->sum(fn($a) => (int) ($a->service->duration ?? 60));
            $totalPrice = (float) $group->sum(fn($a) => (float) ($a->service->price ?? 0));
            $serviceNames = $group->map(fn($a) => $a->service ? $a->service->name : 'Massage')->implode(', ');
            $uniqueNotes = $group->pluck('notes')->filter()->unique()->implode(" | ");

            return [
                'id'              => $first->id,
                'appointment_ids' => $group->pluck('id')->sort()->values()->toArray(),
                'is_multi_service'=> $isMulti,
                'services_count'  => $group->count(),
                'title'           => $isMulti ? "Multi-Service Package ({$serviceNames}) Needed" : (($first->service ? $first->service->name : 'Massage') . ' Needed'),
                'description'     => $uniqueNotes ?: 'Standard appointment booking.',
                'location'        => 'Cozy Blissful - Main Clinic',
                'datetime'        => $first->datetime->format('Y-m-d H:i:s'),
                'duration'        => $totalDuration,
                'compensation'    => '₱' . number_format($totalPrice > 0 ? $totalPrice : 749.00, 2),
                'client_name'     => $first->client ? $first->client->name : 'Client',
            ];
        })->values();

        // Count sessions accurately based on grouped sessions
        $myAppointmentsCount = $appointments->whereIn('status', ['Pending', 'Confirmed', 'In Progress', 'Completed by Therapist'])->count();
        $completedSessions = $appointments->whereIn('status', ['Completed by Therapist', 'Completed'])->count();

        return response()->json([
            'message' => 'Therapist dashboard and jobs retrieved successfully',
            'therapist_stats' => [
                'my_appointments' => $myAppointmentsCount,
                'completed_sessions' => $completedSessions,
                'rating' => 4.9,
                'hours_worked' => $hoursWorked > 0 ? $hoursWorked : 0
            ],
            'therapist_profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'specialty' => $user->specialty ?? 'General Massage & Spa Therapy',
                'notes' => $user->notes ?? '',
            ],
            'appointments' => $appointments,
            'available_jobs' => $availableJobs
        ]);
    }

    /**
     * Get availability dates for the therapist.
     */
    public function getAvailability(Request $request)
    {
        $user = $request->user();

        $availabilities = TherapistAvailability::where('therapist_id', $user->id)
            ->pluck('date')
            ->map(function ($date) {
                return Carbon::parse($date)->format('Y-m-d');
            });

        return response()->json([
            'availabilities' => $availabilities
        ]);
    }

    /**
     * Toggle availability for a specific date.
     */
    public function toggleAvailability(Request $request)
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $dateStr = $request->date;

        $existing = TherapistAvailability::where('therapist_id', $user->id)
            ->where('date', $dateStr)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'message' => 'Availability removed for ' . $dateStr,
                'available' => false
            ]);
        } else {
            TherapistAvailability::create([
                'therapist_id' => $user->id,
                'date' => $dateStr
            ]);
            return response()->json([
                'message' => 'Availability added for ' . $dateStr,
                'available' => true
            ]);
        }
    }

    /**
     * Update session status by therapist (In Progress, Completed by Therapist).
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:In Progress,Completed,Completed by Therapist',
        ]);

        $user = $request->user();
        $appt = Appointment::where('id', $id)
            ->where('therapist_id', $user->id)
            ->firstOrFail();

        $oldStatus = $appt->status;
        $targetStatus = $request->status;
        // If therapist submits Completed, transition to Completed by Therapist for Admin confirmation
        if ($targetStatus === 'Completed' || $targetStatus === 'Completed by Therapist') {
            $targetStatus = 'Completed by Therapist';
        }

        // If part of a multi-service booking group, update all siblings assigned to this therapist!
        $siblings = $appt->booking_group_id
            ? Appointment::with('service')->where('booking_group_id', $appt->booking_group_id)
                ->where('therapist_id', $user->id)
                ->get()
            : collect([$appt]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($siblings, $targetStatus) {
            foreach ($siblings as $s) {
                $s->status = $targetStatus;
                $s->save();
            }
        });

        $appt->load(['client', 'service']);

        $serviceDesc = $siblings->count() > 1
            ? "{$siblings->count()} services package (" . $siblings->pluck('service.name')->filter()->implode(', ') . ")"
            : ($appt->service?->name ?? 'Service');

        if ($targetStatus === 'In Progress') {
            Notification::create([
                'type'           => 'in_progress',
                'title'          => 'Session Started',
                'description'    => "Therapist {$user->name} began session with " . ($appt->client?->name ?? 'Client') . ' (' . $serviceDesc . ')',
                'appointment_id' => $appt->id,
            ]);
        } elseif ($targetStatus === 'Completed by Therapist') {
            Notification::create([
                'type'           => 'completed_by_therapist',
                'title'          => 'Session Concluded by Therapist',
                'description'    => "Therapist {$user->name} completed session #{$appt->id} (" . $serviceDesc . ') with ' . ($appt->client?->name ?? 'Client') . '. Awaiting Admin verification.',
                'appointment_id' => $appt->id,
            ]);
        }

        AuditLog::log('update', 'Appointment', "Therapist {$user->name} marked booking #{$appt->id} ({$serviceDesc}) as {$targetStatus} (was {$oldStatus})", [
            'actor' => $user->name,
            'actor_role' => 'therapist',
            'module' => 'Therapist Portal',
            'severity' => 'info',
            'metadata' => [
                'appointment_id' => $appt->id,
                'appointment_ids' => $siblings->pluck('id')->toArray(),
                'old_status' => $oldStatus,
                'new_status' => $targetStatus,
            ]
        ]);

        return response()->json([
            'message' => $targetStatus === 'Completed by Therapist' 
                ? 'Session marked completed! Sent to Admin for final verification.' 
                : 'Session status updated to In Progress',
            'appointment' => [
                'id' => $appt->id,
                'appointment_ids' => $siblings->pluck('id')->values()->toArray(),
                'client_name' => $appt->client ? $appt->client->name : 'Client',
                'client_phone' => $appt->client && $appt->client->phone ? $appt->client->phone : 'Not provided',
                'service' => $siblings->count() > 1 ? $siblings->pluck('service.name')->implode(', ') : ($appt->service ? $appt->service->name : 'Massage Service'),
                'duration' => (int) $siblings->sum(fn($s) => (int) ($s->service->duration ?? 60)),
                'price' => (float) $siblings->sum(fn($s) => (float) ($s->service->price ?? 0)),
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'notes' => $appt->notes ?? '',
                'status' => $targetStatus,
            ]
        ]);
    }

    /**
     * Claim an unassigned job order / appointment matching therapist availability.
     */
    public function claimJob(Request $request, $id)
    {
        $user = $request->user();
        $appt = Appointment::with('service')->where('id', $id)
            ->whereNull('therapist_id')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->first();

        if (!$appt) {
            return response()->json([
                'message' => 'This job order has already been assigned or is no longer available.'
            ], 404);
        }

        // Claim all unassigned siblings in the booking group
        $siblings = $appt->booking_group_id
            ? Appointment::with('service')->where('booking_group_id', $appt->booking_group_id)
                ->whereNull('therapist_id')
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->get()
            : collect([$appt]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($siblings, $user) {
            foreach ($siblings as $s) {
                $s->therapist_id = $user->id;
                $s->status = 'Confirmed';
                $s->save();
            }
        });

        AuditLog::log('assign', 'Appointment', "Therapist '{$user->name}' claimed booking #{$appt->id} (" . ($siblings->count() > 1 ? $siblings->count() . ' services bundle' : 'single service') . ')', [
            'actor' => $user->name,
            'actor_role' => 'therapist',
            'module' => 'Therapist Portal',
            'severity' => 'info',
            'metadata' => [
                'appointment_id' => $appt->id,
                'appointment_ids' => $siblings->pluck('id')->toArray(),
                'therapist_id' => $user->id,
            ]
        ]);

        Notification::create([
            'type'           => 'therapist_assigned',
            'title'          => 'Job Claimed by Therapist',
            'description'    => "Therapist {$user->name} accepted booking #{$appt->id} (" . ($appt->service?->name ?? 'Service') . ')',
            'appointment_id' => $appt->id,
        ]);

        return response()->json([
            'message' => "Job order #{$appt->id} successfully assigned to you!",
            'appointment' => [
                'id' => $appt->id,
                'client_name' => $appt->client ? $appt->client->name : 'Client',
                'client_phone' => $appt->client && $appt->client->phone ? $appt->client->phone : 'Not provided',
                'service' => $appt->service ? $appt->service->name : 'Massage Service',
                'duration' => $appt->service ? $appt->service->duration : 60,
                'price' => $appt->service ? $appt->service->price : 0,
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'notes' => $appt->notes ?? '',
                'status' => $appt->status
            ]
        ]);
    }

    /**
     * Update therapist profile details (phone, specialty, notes, password).
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'phone' => 'nullable|string|max:30',
            'specialty' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:500',
            'current_password' => 'nullable|required_with:new_password|string',
            'new_password' => 'nullable|string|min:8|max:255|confirmed',
        ]);

        if (!empty($validated['current_password'])) {
            if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Current password is incorrect.',
                    'errors' => ['current_password' => ['The provided current password does not match.']]
                ], 422);
            }
            $user->password = $validated['new_password'];
        }

        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        if (array_key_exists('specialty', $validated)) {
            $user->specialty = $validated['specialty'];
        }
        if (array_key_exists('notes', $validated)) {
            $user->notes = $validated['notes'];
        }

        $user->save();

        AuditLog::log('update', 'User', "Therapist '{$user->name}' updated their profile settings", [
            'actor' => $user->name,
            'actor_role' => 'therapist',
            'module' => 'Therapist Portal',
            'severity' => 'info',
        ]);

        return response()->json([
            'message' => 'Profile updated successfully!',
            'therapist_profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'specialty' => $user->specialty ?? 'General Massage & Spa Therapy',
                'notes' => $user->notes ?? '',
            ]
        ]);
    }
}

