<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
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
                'id'              => $appt->id,
                'therapist_name'  => $appt->therapist ? $appt->therapist->name : 'Awaiting Assignment',
                'therapist_id'    => $appt->therapist_id,
                'service'         => $appt->service ? $appt->service->name : 'Custom Service',
                'service_id'      => $appt->service_id,
                'service_price'   => $appt->service ? (float)$appt->service->price : null,
                'service_duration'=> $appt->service ? (int)$appt->service->duration : null,
                'datetime'        => $appt->datetime->format('Y-m-d H:i:s'),
                'status'          => $appt->status,
                'notes'           => $appt->notes,
            ];
        });

        // Fetch active services
        $availableServices = Service::where('status', 'active')->get()->map(function ($s) {
            return [
                'id'          => $s->id,
                'name'        => $s->name,
                'category'    => $s->category,
                'price'       => $s->price,
                'duration'    => (int)$s->duration,
                'description' => $s->description,
                'image'       => $s->image,
            ];
        });

        // Fetch therapist list
        $therapists = User::role('therapist')->get()->map(function ($t) {
            return [
                'id'        => $t->id,
                'name'      => $t->name,
                'specialty' => 'Spa Professional',
            ];
        });

        return response()->json([
            'message'               => 'Client bookings retrieved successfully',
            'client_name'           => $user->name,
            'bookings'              => $bookings,
            'available_services'    => $availableServices,
            'available_therapists'  => $therapists,
        ]);
    }

    /**
     * Return available time slots for a given date and service.
     * GET /booking/available-slots?date=YYYY-MM-DD&service_id=X&therapist_id=Y
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'date'         => 'required|date|after_or_equal:today',
            'service_id'   => 'required|exists:services,id',
            'therapist_id' => 'nullable|exists:users,id',
        ]);

        $service = Service::findOrFail($request->service_id);
        $duration = (int)$service->duration; // minutes
        $date = Carbon::parse($request->date);

        // Salon operating hours: 9:00 AM – 9:00 PM
        $openTime  = $date->copy()->setTime(9, 0);
        $closeTime = $date->copy()->setTime(21, 0);

        // Generate candidate slots every 30 minutes
        $slots = [];
        $cursor = $openTime->copy();
        while ($cursor->copy()->addMinutes($duration)->lte($closeTime)) {
            $slots[] = $cursor->format('H:i');
            $cursor->addMinutes(30);
        }

        // Determine working therapists for this date
        $workingTherapists = User::role('therapist')
            ->whereHas('availabilities', fn($q) => $q->where('date', $date->toDateString()))
            ->pluck('id')
            ->toArray();

        // If no therapists explicitly marked calendar, fallback to all active therapists
        if (empty($workingTherapists)) {
            $workingTherapists = User::role('therapist')->pluck('id')->toArray();
        }

        $salonCapacity = max(1, count($workingTherapists));
        $requestedTherapistId = $request->therapist_id;

        // Fetch existing confirmed/pending appointments on that date
        $existingAppointments = Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('datetime', $date->toDateString())
            ->get();

        // Convert appointments to interval minutes [startMin, endMin, therapist_id]
        $apptIntervals = $existingAppointments->map(function ($appt) {
            $startMin = (int)$appt->datetime->format('H') * 60 + (int)$appt->datetime->format('i');
            $dur      = $appt->service ? (int)$appt->service->duration : 60;
            return [
                'start'        => $startMin,
                'end'          => $startMin + $dur,
                'therapist_id' => $appt->therapist_id,
            ];
        });

        // Filter candidate slots based on capacity or specific therapist
        $availableSlots = array_filter($slots, function ($slotTime) use ($duration, $apptIntervals, $salonCapacity, $requestedTherapistId) {
            [$h, $m] = explode(':', $slotTime);
            $slotStart = (int)$h * 60 + (int)$m;
            $slotEnd   = $slotStart + $duration;

            if ($requestedTherapistId) {
                // If a specific therapist is requested, slot is unavailable if that therapist is busy
                foreach ($apptIntervals as $interval) {
                    if ((int)$interval['therapist_id'] === (int)$requestedTherapistId) {
                        if ($slotStart < $interval['end'] && $slotEnd > $interval['start']) {
                            return false;
                        }
                    }
                }
                return true;
            }

            // General salon capacity: count how many overlapping appointments exist
            $overlapCount = 0;
            foreach ($apptIntervals as $interval) {
                if ($slotStart < $interval['end'] && $slotEnd > $interval['start']) {
                    $overlapCount++;
                }
            }

            return $overlapCount < $salonCapacity;
        });

        $availableSlots = array_values($availableSlots);
        $bookedSlots = array_values(array_diff($slots, $availableSlots));

        return response()->json([
            'date'             => $date->toDateString(),
            'service_id'       => $service->id,
            'service_name'     => $service->name,
            'service_duration' => $duration,
            'therapist_id'     => $requestedTherapistId,
            'salon_capacity'   => $salonCapacity,
            'available_slots'  => $availableSlots,
            'all_slots'        => $slots,
            'booked_slots'     => $bookedSlots,
        ]);
    }

    /**
     * Create a real booking for the client.
     */
    public function store(Request $request)
    {
        $request->validate([
            'service_id'   => 'required|exists:services,id',
            'therapist_id' => 'nullable|exists:users,id',
            'datetime'     => 'required|date|after:now',
            'notes'        => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $service = Service::findOrFail($request->service_id);
        $duration = (int)$service->duration;

        try {
            $parsedDatetime = Carbon::parse($request->datetime);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid date time format.'], 422);
        }

        // ── Concurrency & Capacity check ─────────────────────────────────────
        $newStart = $parsedDatetime->copy();
        $newEnd   = $parsedDatetime->copy()->addMinutes($duration);
        $newStartMin = (int)$newStart->format('H') * 60 + (int)$newStart->format('i');
        $newEndMin   = $newStartMin + $duration;

        $existingAppointments = Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('datetime', $parsedDatetime->toDateString())
            ->get();

        if ($request->filled('therapist_id')) {
            $therapistBusy = $existingAppointments->first(function ($appt) use ($request, $newStartMin, $newEndMin) {
                if ((int)$appt->therapist_id !== (int)$request->therapist_id) {
                    return false;
                }
                $startMin = (int)$appt->datetime->format('H') * 60 + (int)$appt->datetime->format('i');
                $dur      = $appt->service ? (int)$appt->service->duration : 60;
                $endMin   = $startMin + $dur;
                return $newStartMin < $endMin && $newEndMin > $startMin;
            });

            if ($therapistBusy) {
                return response()->json([
                    'message' => 'The selected specialist is not available at this time. Please pick another slot or choose Any Specialist.',
                    'errors'  => ['datetime' => ['Specialist time conflict — therapist already has a booking during this window.']],
                ], 422);
            }
        } else {
            // Check overall salon capacity
            $workingTherapistsCount = User::role('therapist')
                ->whereHas('availabilities', fn($q) => $q->where('date', $parsedDatetime->toDateString()))
                ->count();

            if ($workingTherapistsCount === 0) {
                $workingTherapistsCount = User::role('therapist')->count();
            }
            $capacity = max(1, $workingTherapistsCount);

            $overlapCount = $existingAppointments->filter(function ($appt) use ($newStartMin, $newEndMin) {
                $startMin = (int)$appt->datetime->format('H') * 60 + (int)$appt->datetime->format('i');
                $dur      = $appt->service ? (int)$appt->service->duration : 60;
                $endMin   = $startMin + $dur;
                return $newStartMin < $endMin && $newEndMin > $startMin;
            })->count();

            if ($overlapCount >= $capacity) {
                return response()->json([
                    'message' => 'All specialist slots are fully booked for this time window. Please select an adjacent time slot.',
                    'errors'  => ['datetime' => ['Salon capacity reached for this time window.']],
                ], 422);
            }
        }

        // ── Create appointment within transaction ─────────────────────────
        $appt = \Illuminate\Support\Facades\DB::transaction(function () use ($user, $service, $request, $parsedDatetime) {
            $appointment = Appointment::create([
                'client_id'    => $user->id,
                'therapist_id' => $request->therapist_id, // Assigned if requested, or left for staff
                'service_id'   => $service->id,
                'datetime'     => $parsedDatetime,
                'status'       => 'Pending',
                'notes'        => $request->notes,
            ]);

            // Create admin notification for new booking
            Notification::create([
                'type'           => 'new_booking',
                'title'          => 'New Booking Received',
                'description'    => $user->name . ' — ' . $service->name . ' on ' . $parsedDatetime->format('M d, g:i A'),
                'appointment_id' => $appointment->id,
            ]);

            return $appointment;
        });

        // Load relationships for response and email
        $appt->load(['client', 'therapist', 'service']);

        if ($user->email) {
            try {
                Mail::to($user->email)->send(new BookingConfirmationMail($appt));
            } catch (\Exception $e) {
                Log::error('Failed to send booking confirmation email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Booking created successfully!',
            'booking' => [
                'id'               => $appt->id,
                'therapist_name'   => $appt->therapist ? $appt->therapist->name : 'Awaiting Assignment',
                'therapist_id'     => $appt->therapist_id,
                'service'          => $service->name,
                'service_price'    => (float)$service->price,
                'service_duration' => $duration,
                'datetime'         => $appt->datetime->format('Y-m-d H:i:s'),
                'status'           => 'Pending',
                'notes'            => $appt->notes,
            ],
        ], 201);
    }

    /**
     * Client cancels their own appointment.
     * Only Pending or Confirmed appointments can be cancelled.
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $appt = Appointment::where('id', $id)
            ->where('client_id', $user->id)
            ->firstOrFail();

        if (in_array($appt->status, ['Cancelled', 'Completed'])) {
            return response()->json([
                'message' => "This appointment is already {$appt->status} and cannot be cancelled.",
            ], 422);
        }

        $appt->status = 'Cancelled';
        $appt->save();

        return response()->json([
            'message' => 'Appointment cancelled successfully.',
            'booking' => [
                'id'     => $appt->id,
                'status' => $appt->status,
            ],
        ]);
    }

    /**
     * Client reschedules their own appointment to a new datetime.
     * Resets reminder flags so fresh emails are sent for the new time.
     */
    public function reschedule(Request $request, $id)
    {
        $request->validate([
            'datetime'     => 'required|date|after:now',
            'therapist_id' => 'nullable|exists:users,id',
        ]);

        $user = $request->user();
        $appt = Appointment::with('service')
            ->where('id', $id)
            ->where('client_id', $user->id)
            ->firstOrFail();

        if (in_array($appt->status, ['Cancelled', 'Completed'])) {
            return response()->json([
                'message' => "This appointment is {$appt->status} and cannot be rescheduled.",
            ], 422);
        }

        try {
            $parsedDatetime = Carbon::parse($request->datetime);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid date time format.'], 422);
        }

        $duration   = $appt->service ? (int)$appt->service->duration : 60;
        $newStartMin = (int)$parsedDatetime->format('H') * 60 + (int)$parsedDatetime->format('i');
        $newEndMin   = $newStartMin + $duration;

        $targetTherapistId = $request->has('therapist_id') ? $request->therapist_id : $appt->therapist_id;

        $existingAppointments = Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->where('id', '!=', $appt->id)
            ->whereDate('datetime', $parsedDatetime->toDateString())
            ->get();

        if ($targetTherapistId) {
            $therapistBusy = $existingAppointments->first(function ($other) use ($targetTherapistId, $newStartMin, $newEndMin) {
                if ((int)$other->therapist_id !== (int)$targetTherapistId) {
                    return false;
                }
                $otherStartMin = (int)$other->datetime->format('H') * 60 + (int)$other->datetime->format('i');
                $otherDur      = $other->service ? (int)$other->service->duration : 60;
                $otherEndMin   = $otherStartMin + $otherDur;
                return $newStartMin < $otherEndMin && $newEndMin > $otherStartMin;
            });

            if ($therapistBusy) {
                return response()->json([
                    'message' => 'The selected specialist is not available at this rescheduled time. Please choose another slot.',
                    'errors'  => ['datetime' => ['Specialist time conflict for requested reschedule window.']],
                ], 422);
            }
        } else {
            $workingTherapistsCount = User::role('therapist')
                ->whereHas('availabilities', fn($q) => $q->where('date', $parsedDatetime->toDateString()))
                ->count();

            if ($workingTherapistsCount === 0) {
                $workingTherapistsCount = User::role('therapist')->count();
            }
            $capacity = max(1, $workingTherapistsCount);

            $overlapCount = $existingAppointments->filter(function ($other) use ($newStartMin, $newEndMin) {
                $otherStartMin = (int)$other->datetime->format('H') * 60 + (int)$other->datetime->format('i');
                $otherDur      = $other->service ? (int)$other->service->duration : 60;
                $otherEndMin   = $otherStartMin + $otherDur;
                return $newStartMin < $otherEndMin && $newEndMin > $otherStartMin;
            })->count();

            if ($overlapCount >= $capacity) {
                return response()->json([
                    'message' => 'All specialist slots are fully booked for this reschedule window. Please choose another time.',
                    'errors'  => ['datetime' => ['Salon capacity reached for this reschedule window.']],
                ], 422);
            }
        }

        // Update datetime and reset reminder flags
        $appt->datetime             = $parsedDatetime;
        if ($request->has('therapist_id')) {
            $appt->therapist_id = $request->therapist_id;
        }
        $appt->reminder_24h_sent_at = null;
        $appt->reminder_2h_sent_at  = null;
        $appt->save();

        return response()->json([
            'message' => 'Appointment rescheduled successfully!',
            'booking' => [
                'id'           => $appt->id,
                'datetime'     => $appt->datetime->format('Y-m-d H:i:s'),
                'therapist_id' => $appt->therapist_id,
                'status'       => $appt->status,
            ],
        ]);
    }
}
