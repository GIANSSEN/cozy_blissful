<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
                'id' => $appt->id,
                'therapist_name' => $appt->therapist ? $appt->therapist->name : 'Awaiting Assignment',
                'therapist_id' => $appt->therapist_id,
                'service' => $appt->service ? $appt->service->name : 'Custom Service',
                'service_id' => $appt->service_id,
                'service_price' => $appt->service ? (float) $appt->service->price : null,
                'service_duration' => $appt->service ? (int) $appt->service->duration : null,
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'status' => $appt->status,
                'notes' => $appt->notes,
                'payment_status' => $appt->payment_status ?? 'unpaid',
                'payment_method' => $appt->payment_method ?? 'cash',
                'amount_paid' => $appt->amount_paid ? (float) $appt->amount_paid : null,
                'paid_at' => $appt->paid_at ? $appt->paid_at->format('Y-m-d H:i:s') : null,
            ];
        });

        // Fetch active services
        $availableServices = Service::where('status', 'active')->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'category' => $s->category,
                'price' => $s->price,
                'duration' => (int) $s->duration,
                'description' => $s->description,
                'image' => $s->image,
            ];
        });

        // Fetch therapist list
        $therapists = User::role('therapist')->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'name' => $t->name,
                'specialty' => 'Spa Professional',
            ];
        });

        return response()->json([
            'message' => 'Client bookings retrieved successfully',
            'client_name' => $user->name,
            'client_email' => $user->email,
            'client_phone' => $user->phone ?? '',
            'bookings' => $bookings,
            'available_services' => $availableServices,
            'available_therapists' => $therapists,
        ]);
    }

    /**
     * Return available time slots for a given date and service.
     * GET /booking/available-slots?date=YYYY-MM-DD&service_id=X&therapist_id=Y&total_duration=Z
     * 
     * Optimized with database-level filtering and Redis caching
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'service_id' => 'required|exists:services,id',
            'therapist_id' => 'nullable|exists:users,id',
            'total_duration' => 'sometimes|integer|min:15|max:480', // for multi-service bookings
        ]);

        $service = Service::findOrFail($request->service_id);
        $duration = (int) $service->duration;
        // Use total_duration if provided (for multi-service), otherwise use single service duration
        $effectiveDuration = $request->filled('total_duration') ? (int) $request->total_duration : $duration;
        $date = Carbon::parse($request->date);
        $dateString = $date->toDateString();
        $requestedTherapistId = $request->therapist_id;

        // Cache key for this query
        $therapistKey = $requestedTherapistId ?? 'any';
        $durationKey = $effectiveDuration;
        $cacheKey = "available_slots:{$dateString}:{$service->id}:{$therapistKey}:{$durationKey}";

        return Cache::remember($cacheKey, 300, function () use ($date, $duration, $effectiveDuration, $dateString, $requestedTherapistId) {
            // Salon operating hours: 9:00 AM – 9:00 PM
            $openTime = $date->copy()->setTime(9, 0);
            $closeTime = $date->copy()->setTime(21, 0);

            // Generate candidate slots every 30 minutes - use EFFECTIVE DURATION for boundary check
            $slots = [];
            $cursor = $openTime->copy();
            while ($cursor->copy()->addMinutes($effectiveDuration)->lte($closeTime)) {
                $slots[] = $cursor->format('H:i');
                $cursor->addMinutes(30);
            }

            if (empty($slots)) {
                return [
                    'date' => $dateString,
                    'service_id' => $service->id,
                    'service_name' => $service->name,
                    'service_duration' => $duration,
                    'effective_duration' => $effectiveDuration,
                    'therapist_id' => $requestedTherapistId,
                    'salon_capacity' => 0,
                    'available_slots' => [],
                    'all_slots' => [],
                    'booked_slots' => [],
                ];
            }

            // Determine working therapists for this date (cached)
            $workingTherapistsCacheKey = "working_therapists:{$dateString}";
            $workingTherapists = Cache::remember($workingTherapistsCacheKey, 3600, function () use ($dateString) {
                return User::role('therapist')
                    ->whereHas('availabilities', fn($q) => $q->where('date', $dateString))
                    ->pluck('id')
                    ->toArray();
            });

            if (empty($workingTherapists)) {
                $workingTherapists = User::role('therapist')->pluck('id')->toArray();
            }

            $salonCapacity = max(1, count($workingTherapists));

            // Convert slot times to minutes for DB query - use EFFECTIVE DURATION
            $slotMinutes = array_map(function ($slot) {
                [$h, $m] = explode(':', $slot);
                return (int) $h * 60 + (int) $m;
            }, $slots);
            $slotEndMinutes = array_map(fn($start) => $start + $effectiveDuration, $slotMinutes);

            // Fetch ONLY overlapping appointments from DB using indexed columns
            // This uses the composite index (therapist_id, status, datetime) or (status, datetime)
            $existingAppointments = Appointment::query()
                ->select('id', 'therapist_id', 'datetime', 'service_id')
                ->with(['service:id,duration'])
                ->whereIn('status', ['Pending', 'Confirmed'])
                ->whereDate('datetime', $dateString)
                ->when($requestedTherapistId, fn($q) => $q->where('therapist_id', $requestedTherapistId))
                ->get();

            if ($existingAppointments->isEmpty()) {
                return [
                    'date' => $dateString,
                    'service_id' => $service->id,
                    'service_name' => $service->name,
                    'service_duration' => $duration,
                    'effective_duration' => $effectiveDuration,
                    'therapist_id' => $requestedTherapistId,
                    'salon_capacity' => $salonCapacity,
                    'available_slots' => $slots,
                    'all_slots' => $slots,
                    'booked_slots' => [],
                ];
            }

            // Build interval map: therapist_id -> list of [start_min, end_min]
            $therapistIntervals = [];
            foreach ($existingAppointments as $appt) {
                $therapistId = $appt->therapist_id ?? 0; // 0 for unassigned
                $startMin = (int) $appt->datetime->format('H') * 60 + (int) $appt->datetime->format('i');
                $dur = $appt->service ? (int) $appt->service->duration : 60;
                $endMin = $startMin + $dur;

                if (!isset($therapistIntervals[$therapistId])) {
                    $therapistIntervals[$therapistId] = [];
                }
                $therapistIntervals[$therapistId][] = [$startMin, $endMin];
            }

            // Filter slots efficiently - use EFFECTIVE DURATION for overlap check
            $availableSlots = [];
            foreach ($slots as $index => $slotTime) {
                $slotStart = $slotMinutes[$index];
                $slotEnd = $slotEndMinutes[$index];

                if ($requestedTherapistId) {
                    // Check only requested therapist's intervals
                    $intervals = $therapistIntervals[$requestedTherapistId] ?? [];
                    $conflict = false;
                    foreach ($intervals as [$start, $end]) {
                        if ($slotStart < $end && $slotEnd > $start) {
                            $conflict = true;
                            break;
                        }
                    }
                    if (!$conflict) {
                        $availableSlots[] = $slotTime;
                    }
                } else {
                    // Count overlapping appointments across all therapists
                    $overlapCount = 0;
                    foreach ($therapistIntervals as $intervals) {
                        foreach ($intervals as [$start, $end]) {
                            if ($slotStart < $end && $slotEnd > $start) {
                                $overlapCount++;
                                break; // Count each appointment once per slot
                            }
                        }
                    }
                    if ($overlapCount < $salonCapacity) {
                        $availableSlots[] = $slotTime;
                    }
                }
            }

            $bookedSlots = array_values(array_diff($slots, $availableSlots));

            return [
                'date' => $dateString,
                'service_id' => $service->id,
                'service_name' => $service->name,
                'service_duration' => $duration,
                'effective_duration' => $effectiveDuration,
                'therapist_id' => $requestedTherapistId,
                'salon_capacity' => $salonCapacity,
                'available_slots' => $availableSlots,
                'all_slots' => $slots,
                'booked_slots' => $bookedSlots,
            ];
        });
    }

    /**
     * Create a real booking for the client (supports multiple services).
     */
    public function store(Request $request)
    {
        $request->validate([
            'service_ids' => 'sometimes|array|min:1',
            'service_ids.*' => 'exists:services,id',
            'service_id' => 'sometimes|exists:services,id', // backward compat
            'primary_service_id' => 'sometimes|exists:services,id',
            'therapist_id' => 'nullable|exists:users,id',
            'datetime' => 'required|date|after:now',
            'total_duration' => 'sometimes|integer|min:15|max:480',
            'notes' => 'nullable|string|max:2000|not_regex:/<[^>]*>/',
            'client_name' => 'nullable|string|max:150',
            'client_phone' => 'nullable|string|max:50',
            'client_address' => 'nullable|string|max:500',
            'payment_method' => 'nullable|string|max:50',
        ]);

        $user = $request->user();

        // Determine services: prefer service_ids array, fall back to single service_id
        $serviceIds = $request->input('service_ids');
        if (empty($serviceIds) && $request->filled('service_id')) {
            $serviceIds = [$request->input('service_id')];
        }
        if (empty($serviceIds)) {
            return response()->json(['message' => 'At least one service must be selected.'], 422);
        }

        $services = Service::whereIn('id', $serviceIds)->get();
        if ($services->count() !== count($serviceIds)) {
            return response()->json(['message' => 'One or more selected services not found.'], 422);
        }

        // Primary service for slot fetching / capacity check
        $primaryServiceId = $request->input('primary_service_id') ?? $serviceIds[0];
        $primaryService = $services->firstWhere('id', $primaryServiceId) ?? $services->first();
        $totalDuration = $request->filled('total_duration') ? (int) $request->total_duration : $services->sum('duration');

        try {
            $parsedDatetime = Carbon::parse($request->datetime);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid date time format.'], 422);
        }

        // ── Concurrency & Capacity check (use total duration for capacity) ─────────────────────────────────────
        $newStart = $parsedDatetime->copy();
        $newEnd = $parsedDatetime->copy()->addMinutes($totalDuration);
        $newStartMin = (int) $newStart->format('H') * 60 + (int) $newStart->format('i');
        $newEndMin = $newStartMin + $totalDuration;

        $existingAppointments = Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('datetime', $parsedDatetime->toDateString())
            ->get();

        if ($request->filled('therapist_id')) {
            $therapistBusy = $existingAppointments->first(function ($appt) use ($request, $newStartMin, $newEndMin) {
                if ((int) $appt->therapist_id !== (int) $request->therapist_id) {
                    return false;
                }
                $startMin = (int) $appt->datetime->format('H') * 60 + (int) $appt->datetime->format('i');
                $dur = $appt->service ? (int) $appt->service->duration : 60;
                $endMin = $startMin + $dur;
                return $newStartMin < $endMin && $newEndMin > $startMin;
            });

            if ($therapistBusy) {
                return response()->json([
                    'message' => 'The selected specialist is not available at this time. Please pick another slot or choose Any Specialist.',
                    'errors' => ['datetime' => ['Specialist time conflict — therapist already has a booking during this window.']],
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
                $startMin = (int) $appt->datetime->format('H') * 60 + (int) $appt->datetime->format('i');
                $dur = $appt->service ? (int) $appt->service->duration : 60;
                $endMin = $startMin + $dur;
                return $newStartMin < $endMin && $newEndMin > $startMin;
            })->count();

            if ($overlapCount >= $capacity) {
                return response()->json([
                    'message' => 'All specialist slots are fully booked for this time window. Please select an adjacent time slot.',
                    'errors' => ['datetime' => ['Salon capacity reached for this time window.']],
                ], 422);
            }
        }

        // Auto-update user phone if provided and not yet saved
        if ($request->filled('client_phone') && empty($user->phone)) {
            $user->update(['phone' => $request->client_phone]);
        }

        // Validate and sanitize payment method
        $validMethods = ['cash', 'gcash', 'maya'];
        $chosenMethod = in_array(strtolower($request->payment_method ?? 'cash'), $validMethods)
            ? strtolower($request->payment_method)
            : 'cash';

        // Build structured notes with client billing & address details
        $billingDetails = [];
        if ($request->filled('client_name') && $request->client_name !== $user->name) {
            $billingDetails[] = 'Billing Name: ' . trim($request->client_name);
        }
        if ($request->filled('client_phone')) {
            $billingDetails[] = 'Phone: ' . trim($request->client_phone);
        }
        if ($request->filled('client_address')) {
            $billingDetails[] = 'Address: ' . trim($request->client_address);
        }

        $combinedNotes = trim($request->notes ?? '');
        if (!empty($billingDetails)) {
            $billingBlock = "[Billing & Contact Info]\n" . implode("\n", $billingDetails);
            $combinedNotes = $combinedNotes ? $combinedNotes . "\n\n" . $billingBlock : $billingBlock;
        }

        // ── Create appointments within transaction ─────────────────────────
        $appointments = \Illuminate\Support\Facades\DB::transaction(function () use ($user, $services, $request, $parsedDatetime, $combinedNotes, $chosenMethod, $primaryService) {
            $created = [];
            foreach ($services as $svc) {
                $appointment = Appointment::create([
                    'client_id' => $user->id,
                    'therapist_id' => $request->therapist_id,
                    'service_id' => $svc->id,
                    'datetime' => $parsedDatetime,
                    'status' => 'Pending',
                    'notes' => $combinedNotes,
                    'payment_status' => 'unpaid',
                    'payment_method' => $chosenMethod,
                ]);
                $created[] = $appointment;
            }

            // Create admin notification for new booking (single notification for the group)
            $serviceNames = $services->pluck('name')->implode(', ');
            Notification::create([
                'type' => 'new_booking',
                'title' => 'New Booking Received',
                'description' => $user->name . ' — ' . $serviceNames . ' on ' . $parsedDatetime->format('M d, g:i A'),
                'appointment_id' => $created[0]->id,
            ]);

            return $created;
        });

        // Load relationships for response and email
        $firstAppt = $appointments[0];
        $firstAppt->load(['client', 'therapist', 'service']);

        // Prepare multi-service response
        $serviceData = $services->map(function ($svc) {
            return [
                'id' => $svc->id,
                'name' => $svc->name,
                'price' => (float) $svc->price,
                'duration' => (int) $svc->duration,
            ];
        })->values()->toArray();

        $totalPrice = $services->sum('price');

        if ($user->email) {
            try {
                Mail::to($user->email)->send(new BookingConfirmationMail($firstAppt));
            } catch (\Exception $e) {
                Log::error('Failed to send booking confirmation email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => count($appointments) === 1 ? 'Booking created successfully!' : count($appointments) . ' bookings created successfully!',
            'booking' => [
                'id' => $firstAppt->id,
                'therapist_name' => $firstAppt->therapist ? $firstAppt->therapist->name : 'Awaiting Assignment',
                'therapist_id' => $firstAppt->therapist_id,
                'service' => $primaryService->name, // primary service for backward compat
                'services' => $serviceData, // full array for multi-service
                'service_price' => (float) $totalPrice,
                'service_duration' => $totalDuration,
                'datetime' => $firstAppt->datetime->format('Y-m-d H:i:s'),
                'status' => 'Pending',
                'notes' => $firstAppt->notes,
                'payment_status' => 'unpaid',
                'payment_method' => $chosenMethod,
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

        $result = \Illuminate\Support\Facades\DB::transaction(function () use ($appt) {
            $appt->status = 'Cancelled';
            $appt->save();
            return $appt;
        });

        return response()->json([
            'message' => 'Appointment cancelled successfully.',
            'booking' => [
                'id' => $result->id,
                'status' => $result->status,
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
            'datetime' => 'required|date|after:now',
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

        $duration = $appt->service ? (int) $appt->service->duration : 60;
        $newStartMin = (int) $parsedDatetime->format('H') * 60 + (int) $parsedDatetime->format('i');
        $newEndMin = $newStartMin + $duration;

        $targetTherapistId = $request->has('therapist_id') ? $request->therapist_id : $appt->therapist_id;

        $existingAppointments = Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->where('id', '!=', $appt->id)
            ->whereDate('datetime', $parsedDatetime->toDateString())
            ->get();

        if ($targetTherapistId) {
            $therapistBusy = $existingAppointments->first(function ($other) use ($targetTherapistId, $newStartMin, $newEndMin) {
                if ((int) $other->therapist_id !== (int) $targetTherapistId) {
                    return false;
                }
                $otherStartMin = (int) $other->datetime->format('H') * 60 + (int) $other->datetime->format('i');
                $otherDur = $other->service ? (int) $other->service->duration : 60;
                $otherEndMin = $otherStartMin + $otherDur;
                return $newStartMin < $otherEndMin && $newEndMin > $otherStartMin;
            });

            if ($therapistBusy) {
                return response()->json([
                    'message' => 'The selected specialist is not available at this rescheduled time. Please choose another slot.',
                    'errors' => ['datetime' => ['Specialist time conflict for requested reschedule window.']],
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
                $otherStartMin = (int) $other->datetime->format('H') * 60 + (int) $other->datetime->format('i');
                $otherDur = $other->service ? (int) $other->service->duration : 60;
                $otherEndMin = $otherStartMin + $otherDur;
                return $newStartMin < $otherEndMin && $newEndMin > $otherStartMin;
            })->count();

            if ($overlapCount >= $capacity) {
                return response()->json([
                    'message' => 'All specialist slots are fully booked for this reschedule window. Please choose another time.',
                    'errors' => ['datetime' => ['Salon capacity reached for this reschedule window.']],
                ], 422);
            }
        }

        // Update datetime and reset reminder flags
        $appt->datetime = $parsedDatetime;
        if ($request->has('therapist_id')) {
            $appt->therapist_id = $request->therapist_id;
        }
        $appt->reminder_24h_sent_at = null;
        $appt->reminder_2h_sent_at = null;
        $appt->save();

        return response()->json([
            'message' => 'Appointment rescheduled successfully!',
            'booking' => [
                'id' => $appt->id,
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'therapist_id' => $appt->therapist_id,
                'status' => $appt->status,
            ],
        ]);
    }
}
