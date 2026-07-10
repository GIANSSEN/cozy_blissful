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
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->count();

        $completedSessions = Appointment::where('therapist_id', $user->id)
            ->where('status', 'Completed')
            ->count();

        // Total hours worked based on completed appointments
        $hoursWorked = Appointment::where('therapist_id', $user->id)
            ->where('status', 'Completed')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->sum('services.duration') / 60.0;
        $hoursWorked = round($hoursWorked, 1);

        // 2. Fetch upcoming appointments
        $appointments = Appointment::with(['client', 'service'])
            ->where('therapist_id', $user->id)
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->orderBy('datetime', 'asc')
            ->get()
            ->map(function ($appt) {
                return [
                    'id' => $appt->id,
                    'client_name' => $appt->client ? $appt->client->name : 'Client',
                    'service' => $appt->service ? $appt->service->name : 'Massage Service',
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
                    'description' => $appt->notes ?? 'No additional notes.',
                    'location' => 'Cozy Blissful - Home Service',
                    'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                    'compensation' => '₱' . ($appt->service ? $appt->service->price : 749.00)
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
            ->whereDate('date', $dateStr)
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
}
