<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingConfirmationMail;

class ClientController extends Controller
{
    /**
     * Display client bookings and active options.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Fetch real appointments for this user
        $appointments = Appointment::with(['therapist', 'service'])
            ->where('client_id', $user->id)
            ->orderBy('datetime', 'desc')
            ->get();

        $bookings = $appointments->map(function ($appt) {
            return [
                'id' => $appt->id,
                'therapist_name' => $appt->therapist ? $appt->therapist->name : 'Awaiting Assignment',
                'service' => $appt->service ? $appt->service->name : 'Custom Service',
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'status' => $appt->status,
                'notes' => $appt->notes
            ];
        });

        // Fetch active services
        $availableServices = Service::where('status', 'active')->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'price' => $s->price,
                'duration' => $s->duration . ' min',
                'description' => $s->description,
                'image' => $s->image
            ];
        });

        // Fetch therapist list (users with therapist role)
        $therapists = User::role('therapist')->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'specialty' => 'Spa Professional'
            ];
        });

        return response()->json([
            'message' => 'Client bookings retrieved successfully',
            'client_name' => $user->name,
            'bookings' => $bookings,
            'available_services' => $availableServices,
            'available_therapists' => $therapists
        ]);
    }

    /**
     * Create a real booking for the client.
     */
    public function store(Request $request)
    {
        $request->validate([
            'service' => 'required|string',
            'therapist' => 'nullable|string',
            'datetime' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        // 1. Find service
        // Service could be passed as service name or service ID. Let's find it.
        $service = Service::where('name', $request->service)
            ->orWhere('id', $request->service)
            ->first();

        if (!$service) {
            // Fallback: create or use default Swedish Massage
            $service = Service::firstOrCreate(
                ['name' => 'Swedish Massage'],
                ['category' => 'Massage Therapy', 'price' => 749.00, 'duration' => 60]
            );
        }

        // 2. Find therapist (if preferred)
        $therapistId = null;
        if ($request->therapist && $request->therapist !== 'Awaiting Assignment') {
            $therapist = User::role('therapist')
                ->where('name', $request->therapist)
                ->orWhere('id', $request->therapist)
                ->first();
            if ($therapist) {
                $therapistId = $therapist->id;
            }
        }

        // Parse datetime safely
        try {
            $parsedDatetime = \Carbon\Carbon::parse($request->datetime);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid date time format.'], 422);
        }

        // 3. Create appointment
        $appt = Appointment::create([
            'client_id' => $user->id,
            'therapist_id' => $therapistId,
            'service_id' => $service->id,
            'datetime' => $parsedDatetime,
            'status' => 'Pending',
            'notes' => $request->notes,
        ]);

        if ($user->email) {
            try {
                Mail::to($user->email)->queue(new BookingConfirmationMail($appt));
            } catch (\Exception $e) {
                // Log fail but don't break response
                \Illuminate\Support\Facades\Log::error('Failed to queue booking confirmation email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Booking created successfully!',
            'booking' => [
                'id' => $appt->id,
                'therapist_name' => $appt->therapist ? $appt->therapist->name : 'Awaiting Assignment',
                'service' => $service->name,
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'status' => 'Pending',
                'notes' => $appt->notes
            ]
        ], 201);
    }
}
