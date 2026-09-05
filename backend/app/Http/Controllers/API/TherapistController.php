<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
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
        $hoursWorked = Appointment::where('therapist_id', $user->id)
            ->whereIn('appointments.status', ['Completed by Therapist', 'Completed'])
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->sum('services.duration') / 60.0;
        $hoursWorked = round($hoursWorked, 1);

        // 2. Fetch all appointments (both upcoming, in progress, awaiting admin confirmation, and completed) for full history view
        $appointments = Appointment::with(['client', 'service'])
            ->where('therapist_id', $user->id)
            ->whereIn('status', ['Pending', 'Confirmed', 'In Progress', 'Completed by Therapist', 'Completed'])
            ->orderBy('datetime', 'desc')
            ->get()
            ->map(function ($appt) {
                return [
                    'id' => $appt->id,
                    'client_name' => $appt->client ? $appt->client->name : 'Client',
                    'client_phone' => $appt->client && $appt->client->phone ? $appt->client->phone : 'Not provided',
                    'service' => $appt->service ? $appt->service->name : 'Massage Service',
                    'duration' => $appt->service ? $appt->service->duration : 60,
                    'price' => $appt->service ? $appt->service->price : 0,
                    'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                    'notes' => $appt->notes ?? '',
                    'status' => $appt->status
                ];
            });

        // 3. Fetch jobs (unassigned appointments that match dates when this therapist is available)
        // Let's get the list of availability dates for this therapist
        $availDates = TherapistAvailability::where('therapist_id', $user->id)->pluck('date')->toArray();

        // Query pending, unassigned appointments
        $availableJobsQuery = Appointment::with(['client', 'service'])
            ->whereNull('therapist_id')
            ->whereIn('status', ['Pending', 'Confirmed']);

        // Filter: check if date matches one of therapist's availability dates
        $availableJobs = $availableJobsQuery->get()
            ->filter(function ($appt) use ($availDates) {
                $apptDate = $appt->datetime->format('Y-m-d');
                return in_array($apptDate, $availDates);
            })
            ->map(function ($appt) {
                return [
                    'id' => $appt->id,
                    'title' => ($appt->service ? $appt->service->name : 'Massage') . ' Needed',
                    'description' => $appt->notes ?? 'Standard appointment booking.',
                    'location' => 'Cozy Blissful - Main Clinic / Home Service',
                    'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                    'duration' => $appt->service ? $appt->service->duration : 60,
                    'compensation' => '₱' . number_format($appt->service ? (float)$appt->service->price : 749.00, 2),
                    'client_name' => $appt->client ? $appt->client->name : 'Client',
                ];
            })
            ->values();

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
        $appt->status = $targetStatus;
        $appt->save();

        $appt->load(['client', 'service']);

        if ($targetStatus === 'In Progress') {
            \App\Models\Notification::create([
                'type'           => 'in_progress',
                'title'          => 'Session Started',
                'description'    => "Therapist {$user->name} began session with " . ($appt->client?->name ?? 'Client') . ' (' . ($appt->service?->name ?? 'Service') . ')',
                'appointment_id' => $appt->id,
            ]);
        } elseif ($targetStatus === 'Completed by Therapist') {
            \App\Models\Notification::create([
                'type'           => 'completed_by_therapist',
                'title'          => 'Session Concluded by Therapist',
                'description'    => "Therapist {$user->name} completed session #{$appt->id} with " . ($appt->client?->name ?? 'Client') . '. Awaiting Admin verification.',
                'appointment_id' => $appt->id,
            ]);
        }

        \App\Models\AuditLog::log('update', 'Appointment', "Therapist {$user->name} marked booking #{$appt->id} as {$targetStatus} (was {$oldStatus})", [
            'actor' => $user->name,
            'actor_role' => 'therapist',
            'module' => 'Therapist Portal',
            'severity' => 'info',
            'metadata' => [
                'appointment_id' => $appt->id,
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
     * Claim an unassigned job order / appointment matching therapist availability.
     */
    public function claimJob(Request $request, $id)
    {
        $user = $request->user();
        $appt = Appointment::where('id', $id)
            ->whereNull('therapist_id')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->first();

        if (!$appt) {
            return response()->json([
                'message' => 'This job order has already been assigned or is no longer available.'
            ], 404);
        }

        $oldStatus = $appt->status;
        $appt->therapist_id = $user->id;
        $appt->status = 'Confirmed';
        $appt->save();

        \App\Models\AuditLog::log('assign', 'Appointment', "Therapist '{$user->name}' claimed booking #{$appt->id}", [
            'actor' => $user->name,
            'actor_role' => 'therapist',
            'module' => 'Therapist Portal',
            'severity' => 'info',
            'metadata' => [
                'appointment_id' => $appt->id,
                'therapist_id' => $user->id,
            ]
        ]);

        \App\Models\Notification::create([
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

        \App\Models\AuditLog::log('update', 'User', "Therapist '{$user->name}' updated their profile settings", [
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

