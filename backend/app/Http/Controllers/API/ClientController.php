<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\BookingConfirmationMail;
use App\Traits\ValidatesBookingCapacity;

class ClientController extends Controller
{
    use ValidatesBookingCapacity;
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

        // Group appointments by booking_group_id so multi-service packages appear as ONE logical record.
        // Single appointments with null booking_group_id remain their own distinct record.
        $grouped = $appointments->groupBy(function ($appt) {
            return $appt->booking_group_id ?: ('single_' . $appt->id);
        });

        $bookings = $grouped->map(function ($group) {
            $first = $group->first();
            $isMulti = $group->count() > 1;

            $totalPrice = (float) $group->sum(fn($a) => (float) ($a->service->price ?? 0));
            $totalDuration = (int) $group->sum(fn($a) => (int) ($a->service->duration ?? 60));
            $totalPaid = (float) $group->sum(fn($a) => (float) ($a->amount_paid ?? 0));

            $allPaid = $group->every(fn($a) => $a->payment_status === 'paid');
            $anyAwaiting = $group->contains(fn($a) => $a->payment_status === 'awaiting_payment');
            $paymentStatus = $allPaid ? 'paid' : ($anyAwaiting ? 'awaiting_payment' : 'unpaid');

            $servicesList = $group->map(function ($a) {
                return [
                    'id'               => $a->id,
                    'service_id'       => $a->service_id,
                    'name'             => $a->service ? $a->service->name : 'Custom Service',
                    'price'            => $a->service ? (float) $a->service->price : 0,
                    'duration'         => $a->service ? (int) $a->service->duration : 60,
                    'category'         => $a->service ? $a->service->category : null,
                    'therapist_name'   => $a->therapist ? $a->therapist->name : 'Awaiting Assignment',
                    'payment_status'   => $a->payment_status ?? 'unpaid',
                ];
            })->values()->toArray();

            $serviceNames = $group->map(fn($a) => $a->service ? $a->service->name : 'Custom Service')->values();
            $serviceLabel = $serviceNames->implode(', ');

            return [
                'id'                  => $first->id,
                'appointment_ids'     => $group->pluck('id')->values()->toArray(),
                'booking_group_id'    => $first->booking_group_id,
                'is_multi_service'    => $isMulti,
                'services_count'      => $group->count(),
                'therapist_name'      => $first->therapist ? $first->therapist->name : 'Awaiting Assignment',
                'therapist_id'        => $first->therapist_id,
                'service'             => $serviceLabel,
                'services'            => $servicesList,
                'service_id'          => $first->service_id,
                'service_price'       => $totalPrice,
                'total_price'         => $totalPrice,
                'service_duration'    => $totalDuration,
                'datetime'            => $first->datetime->format('Y-m-d H:i:s'),
                'status'              => $first->status,
                'notes'               => $first->notes,
                'payment_status'      => $paymentStatus,
                'payment_method'      => $first->payment_method ?? 'cash',
                'amount_paid'         => $totalPaid > 0 ? $totalPaid : ($allPaid ? $totalPrice : null),
                'paid_at'             => $first->paid_at ? $first->paid_at->format('Y-m-d H:i:s') : null,
                'paymongo_session_id' => $first->paymongo_session_id,
            ];
        })->values();

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
            'date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'service_id' => 'required|exists:services,id',
            'therapist_id' => 'nullable|exists:users,id',
            'total_duration' => 'sometimes|integer|min:15|max:480', // for multi-service bookings
        ]);

        $service = Service::findOrFail($request->service_id);
        $duration = max(15, (int) $service->duration);
        // Use total_duration if provided (for multi-service), otherwise use single service duration
        $effectiveDuration = $request->filled('total_duration')
            ? min(480, max(15, (int) $request->total_duration))
            : $duration;
        $date = Carbon::parse($request->date)->startOfDay();
        $dateString = $date->toDateString();
        $requestedTherapistId = $request->therapist_id;

        // Salon operating hours: 9:00 AM – 9:00 PM (computed live — no stale slot caching)
        $openTime = $date->copy()->setTime(9, 0);
        $closeTime = $date->copy()->setTime(21, 0);

        // Generate candidate slots every 30 minutes - use EFFECTIVE DURATION for boundary check
        $slots = [];
        $cursor = $openTime->copy();
        while ($cursor->copy()->addMinutes($effectiveDuration)->lte($closeTime)) {
            $slots[] = $cursor->format('H:i');
            $cursor->addMinutes(30);
        }

        $basePayload = [
            'date' => $dateString,
            'service_id' => $service->id,
            'service_name' => $service->name,
            'service_duration' => $duration,
            'effective_duration' => $effectiveDuration,
            'therapist_id' => $requestedTherapistId,
        ];

        if (empty($slots)) {
            return response()->json(array_merge($basePayload, [
                'salon_capacity' => 0,
                'available_slots' => [],
                'all_slots' => [],
                'booked_slots' => [],
            ]));
        }

        // Determine working therapists for this date (cached — roster changes slowly)
        $workingTherapistsCacheKey = "working_therapists:{$dateString}";
        $workingTherapists = Cache::remember($workingTherapistsCacheKey, 3600, function () use ($dateString) {
            return User::role('therapist')
                ->whereHas('availabilities', fn($q) => $q->where('date', $dateString))
                ->pluck('id')
                ->toArray();
        });

        if (empty($workingTherapists)) {
            // Fallback: all active therapists count toward capacity (concierge matching)
            $workingTherapists = User::role('therapist')->pluck('id')->toArray();
        }

        $salonCapacity = max(1, count($workingTherapists));

        // Convert slot times to minutes for overlap checks - use EFFECTIVE DURATION
        $slotMinutes = array_map(function ($slot) {
            [$h, $m] = explode(':', $slot);
            return (int) $h * 60 + (int) $m;
        }, $slots);
        $slotEndMinutes = array_map(fn($start) => $start + $effectiveDuration, $slotMinutes);

        $existingAppointments = Appointment::query()
            ->select('id', 'therapist_id', 'datetime', 'service_id')
            ->with(['service:id,duration'])
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('datetime', $dateString)
            ->when($requestedTherapistId, fn($q) => $q->where('therapist_id', $requestedTherapistId))
            ->get();

        // Past-slot guard: slots starting within the lead window are treated as booked.
        // Prevents clients from picking a time that already passed today.
        $now = Carbon::now();
        $isToday = $now->toDateString() === $dateString;
        $pastCutoffMin = ((int) $now->format('H')) * 60 + ((int) $now->format('i')) + 15;

        // Build interval map: therapist_id -> list of [start_min, end_min]
        $therapistIntervals = [];
        foreach ($existingAppointments as $appt) {
            $therapistId = $appt->therapist_id ?? 0; // 0 for unassigned
            $startMin = (int) $appt->datetime->format('H') * 60 + (int) $appt->datetime->format('i');
            $dur = $appt->service ? max(15, (int) $appt->service->duration) : 60;
            $endMin = $startMin + $dur;

            if (!isset($therapistIntervals[$therapistId])) {
                $therapistIntervals[$therapistId] = [];
            }
            $therapistIntervals[$therapistId][] = [$startMin, $endMin];
        }

        // Filter slots - use EFFECTIVE DURATION for overlap check
        $availableSlots = [];
        foreach ($slots as $index => $slotTime) {
            $slotStart = $slotMinutes[$index];
            $slotEnd = $slotEndMinutes[$index];

            if ($isToday && $slotStart <= $pastCutoffMin) {
                continue; // already passed today — mark as booked below
            }

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
                            break; // Count each therapist-block once per slot
                        }
                    }
                }
                if ($overlapCount < $salonCapacity) {
                    $availableSlots[] = $slotTime;
                }
            }
        }

        $bookedSlots = array_values(array_diff($slots, $availableSlots));

        return response()->json(array_merge($basePayload, [
            'salon_capacity' => $salonCapacity,
            'available_slots' => array_values($availableSlots),
            'all_slots' => array_values($slots),
            'booked_slots' => array_values($bookedSlots),
        ]));
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
        if ($request->filled('therapist_id')) {
            if ($this->therapistHasConflict((int) $request->therapist_id, $parsedDatetime, $totalDuration)) {
                return response()->json([
                    'message' => 'The selected specialist is not available at this time. Please pick another slot or choose Any Specialist.',
                    'errors' => ['datetime' => ['Specialist time conflict — therapist already has a booking during this window.']],
                ], 422);
            }
        } else {
            if ($this->salonAtCapacity($parsedDatetime, $totalDuration)) {
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

        // Validate and sanitize payment method.
        // Accepts every channel the client UIs offer (cash / GCash / Maya /
        // QR Ph / Online) — the same set the settlement flow records, so the
        // booking-time choice is never silently rewritten to cash.
        $validMethods = ['cash', 'gcash', 'maya', 'qrph', 'online'];
        $chosenMethod = in_array(strtolower($request->payment_method ?? 'cash'), $validMethods)
            ? strtolower($request->payment_method)
            : 'cash';

        $combinedNotes = $this->formatBillingNotes($request, $user);

        // ── Create appointments within transaction ─────────────────────────
        // All sibling appointments share a booking_group_id so that payment,
        // cancellation, and display can treat them as one logical booking.
        $groupId = (string) Str::uuid();

        $appointments = \Illuminate\Support\Facades\DB::transaction(function () use ($user, $services, $request, $parsedDatetime, $combinedNotes, $chosenMethod, $groupId) {
            $created = [];
            foreach ($services as $svc) {
                $appointment = Appointment::create([
                    'client_id'        => $user->id,
                    'therapist_id'     => $request->therapist_id,
                    'service_id'       => $svc->id,
                    'datetime'         => $parsedDatetime,
                    'status'           => 'Pending',
                    'notes'            => $combinedNotes,
                    'booking_group_id' => $groupId,
                    'payment_status'   => 'unpaid',
                    'payment_method'   => $chosenMethod,
                ]);
                $created[] = $appointment;
            }

            // Single admin notification for the entire group
            $serviceNames = $services->pluck('name')->implode(', ');
            Notification::create([
                'type'           => 'new_booking',
                'title'          => 'New Booking Received',
                'description'    => $user->name . ' — ' . $serviceNames . ' on ' . $parsedDatetime->format('M d, g:i A'),
                'appointment_id' => $created[0]->id,
            ]);

            return $created;
        });

        // Load relationships for response and email (ONE email for the whole group)
        foreach ($appointments as $appt) {
            $appt->load(['client', 'therapist', 'service']);
        }
        $firstAppt = $appointments[0];

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

        // ── Single consolidated Gmail per checkout (multi-service included) ──
        if ($user->email) {
            try {
                Mail::to($user->email)->send(new BookingConfirmationMail(collect($appointments)));
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

        $result = \Illuminate\Support\Facades\DB::transaction(function () use ($appt, $user) {
            if ($appt->booking_group_id) {
                Appointment::where('booking_group_id', $appt->booking_group_id)
                    ->where('client_id', $user->id)
                    ->update(['status' => 'Cancelled']);
                $appt->status = 'Cancelled';
            } else {
                $appt->status = 'Cancelled';
                $appt->save();
            }
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

        $duration = $appt->booking_group_id
            ? (int) Appointment::where('booking_group_id', $appt->booking_group_id)->with('service')->get()->sum(fn($a) => (int) ($a->service->duration ?? 60))
            : ($appt->service ? (int) $appt->service->duration : 60);

        $targetTherapistId = $request->has('therapist_id') ? $request->therapist_id : $appt->therapist_id;

        if ($targetTherapistId) {
            if ($this->therapistHasConflict((int) $targetTherapistId, $parsedDatetime, $duration, (int) $appt->id)) {
                return response()->json([
                    'message' => 'The selected specialist is not available at this rescheduled time. Please choose another slot.',
                    'errors' => ['datetime' => ['Specialist time conflict for requested reschedule window.']],
                ], 422);
            }
        } else {
            if ($this->salonAtCapacity($parsedDatetime, $duration, (int) $appt->id)) {
                return response()->json([
                    'message' => 'All specialist slots are fully booked for this reschedule window. Please choose another time.',
                    'errors' => ['datetime' => ['Salon capacity reached for this reschedule window.']],
                ], 422);
            }
        }

        // Update datetime and reset reminder flags across all siblings in group
        \Illuminate\Support\Facades\DB::transaction(function () use ($appt, $user, $parsedDatetime, $targetTherapistId, $request) {
            $updateData = [
                'datetime' => $parsedDatetime,
                'reminder_24h_sent_at' => null,
                'reminder_2h_sent_at' => null,
            ];
            if ($request->has('therapist_id')) {
                $updateData['therapist_id'] = $targetTherapistId;
            }

            if ($appt->booking_group_id) {
                Appointment::where('booking_group_id', $appt->booking_group_id)
                    ->where('client_id', $user->id)
                    ->update($updateData);
                $appt->datetime = $parsedDatetime;
                if ($request->has('therapist_id')) {
                    $appt->therapist_id = $targetTherapistId;
                }
            } else {
                $appt->update($updateData);
            }
        });

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

    /**
     * Build structured notes with client billing & address details.
     */
    private function formatBillingNotes(Request $request, $user): string
    {
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

        return $combinedNotes;
    }
}

