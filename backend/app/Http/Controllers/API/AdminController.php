<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Notification;
use App\Models\Service;
use App\Models\User;
use App\Models\TherapistAvailability;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\BookingApprovedMail;

class AdminController extends Controller
{
    /**
     * Display the Admin Dashboard metrics and stats.
     */
    public function index()
    {
        // 1. Core metrics
        $totalBookings = Appointment::count();
        
        // Sum paid cash amounts (fallback to service price for paid records where amount_paid is null)
        $totalRevenue = (float) Appointment::where('payment_status', 'paid')
            ->sum('amount_paid');

        if ($totalRevenue == 0) {
            $totalRevenue = (float) Appointment::where('appointments.status', 'Completed')
                ->where('appointments.payment_status', 'paid')
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.price');
        }

        $activeTherapists = User::role('therapist')->count();
        $registeredClients = User::role('client')->count();

        // 2. Recent appointments (limit 5)
        $recentAppointments = Appointment::with(['client', 'therapist', 'service'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($appt) {
                return [
                    'id' => $appt->id,
                    'client_name' => $appt->client ? $appt->client->name : 'Jane Client',
                    'therapist_name' => $appt->therapist ? $appt->therapist->name : 'Unassigned',
                    'service' => $appt->service ? $appt->service->name : 'Massage Service',
                    'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                    'status' => $appt->status,
                    'payment_status' => $appt->payment_status ?? 'unpaid',
                    'amount_paid' => $appt->amount_paid ? (float)$appt->amount_paid : null,
                ];
            });

        // 3. Services list
        $services = Service::all();

        // 4. Payments list generated from appointments (to display on admin payments tab)
        $completedAppts = Appointment::with(['client', 'service'])
            ->whereIn('status', ['Confirmed', 'In Progress', 'Completed by Therapist', 'Completed'])
            ->orderBy('datetime', 'desc')
            ->get();

        $payments = $completedAppts->map(function ($appt) {
            $price = $appt->service ? (float)$appt->service->price : 0.00;
            return [
                'id' => 1000 + $appt->id,
                'appointment_id' => $appt->id,
                'client_name' => $appt->client ? $appt->client->name : 'Client',
                'service' => $appt->service ? $appt->service->name : 'Service',
                'amount' => $appt->amount_paid ? (float)$appt->amount_paid : $price,
                'payment_method' => $appt->payment_method ?? 'cash',
                'payment_status' => $appt->payment_status ?? 'unpaid',
                'status' => ($appt->payment_status === 'paid' || $appt->status === 'Completed') ? 'Completed' : 'Pending',
                'paid_at' => $appt->paid_at ? $appt->paid_at->format('Y-m-d H:i:s') : null,
                'date' => $appt->datetime->format('Y-m-d'),
            ];
        });

        return response()->json([
            'message' => 'Admin dashboard metrics retrieved successfully',
            'stats' => [
                'total_bookings' => $totalBookings,
                'total_revenue' => (float)$totalRevenue,
                'active_therapists' => $activeTherapists,
                'registered_clients' => $registeredClients,
            ],
            'recent_appointments' => $recentAppointments,
            'services' => $services,
            'payments' => $payments
        ]);
    }

    /**
     * Get all appointments.
     */
    public function getAppointments()
    {
        $appointments = Appointment::with(['client', 'therapist', 'service'])
            ->orderBy('datetime', 'asc')
            ->get()
            ->map(function ($appt) {
                return [
                    'id'               => $appt->id,
                    'client_name'      => $appt->client ? $appt->client->name : 'Client',
                    'client_email'     => $appt->client ? $appt->client->email : '',
                    'therapist_name'   => $appt->therapist ? $appt->therapist->name : 'Unassigned',
                    'therapist_id'     => $appt->therapist_id,
                    'service'          => $appt->service ? $appt->service->name : 'Massage Service',
                    'service_id'       => $appt->service_id,
                    'service_price'    => $appt->service ? (float)$appt->service->price : null,
                    'service_duration' => $appt->service ? (int)$appt->service->duration : null,
                    'datetime'         => $appt->datetime->format('Y-m-d H:i:s'),
                    'status'           => $appt->status,
                    'notes'            => $appt->notes ?? '',
                    'payment_status'   => $appt->payment_status ?? 'unpaid',
                    'payment_method'   => $appt->payment_method ?? 'cash',
                    'amount_paid'      => $appt->amount_paid ? (float)$appt->amount_paid : null,
                    'paid_at'          => $appt->paid_at ? $appt->paid_at->format('Y-m-d H:i:s') : null,
                ];
            });

        return response()->json([
            'recent_appointments' => $appointments,
            'appointments'        => $appointments,
        ]);
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
        
        // If therapist is assigned and status was Pending, auto-confirm the booking
        if ($request->therapist_id && $appt->status === 'Pending') {
            $appt->status = 'Confirmed';
        }
        
        $appt->save();

        $appt->load(['client', 'therapist', 'service']);

        if ($oldStatus !== 'Confirmed' && $appt->status === 'Confirmed') {
            // Send email
            if ($appt->client && $appt->client->email) {
                try {
                    Mail::to($appt->client->email)->send(new BookingApprovedMail($appt));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send booking approved email: ' . $e->getMessage());
                }
            }
            // Create notification
            Notification::create([
                'type'           => 'confirmed',
                'title'          => 'Booking Confirmed',
                'description'    => ($appt->client->name ?? 'Client') . ' — ' . ($appt->service->name ?? 'Service'),
                'appointment_id' => $appt->id,
            ]);
        }

        $actor = auth()->user()?->name ?? 'System Admin';
        $actorRole = auth()->user()?->roles?->first()?->name ?? 'admin';

        \App\Models\AuditLog::log('update', 'Appointment', "Assigned therapist '".($appt->therapist?->name ?? 'Therapist')."' to booking #{$appt->id}", [
            'actor' => $actor,
            'actor_role' => $actorRole,
            'module' => 'Bookings',
            'severity' => 'warning',
            'metadata' => [
                'appointment_id' => $appt->id,
                'therapist_id' => $appt->therapist_id,
                'status' => $appt->status
            ]
        ]);

        return response()->json([
            'message' => 'Therapist assigned successfully',
            'appointment' => [
                'id' => $appt->id,
                'client_name' => $appt->client ? $appt->client->name : 'Client',
                'therapist_name' => $appt->therapist ? $appt->therapist->name : 'Unassigned',
                'therapist_id' => $appt->therapist_id,
                'service' => $appt->service ? $appt->service->name : 'Massage Service',
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'status' => $appt->status,
                'notes' => $appt->notes ?? '',
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
        $newStatus = $request->status;

        // ── State-machine guard: enforce valid transitions ──────────────────
        // Admin-allowed transitions map: fromStatus => [allowedToStatuses]
        $allowedTransitions = [
            'Pending'                => ['Confirmed', 'Cancelled'],
            'Confirmed'              => ['In Progress', 'Cancelled', 'Pending'],
            'In Progress'            => ['Completed by Therapist', 'Completed', 'Cancelled'],
            'Completed by Therapist' => ['Completed', 'Cancelled'],
            'Completed'              => [],  // terminal state
            'Cancelled'              => [],  // terminal state
        ];

        $allowed = $allowedTransitions[$oldStatus] ?? [];
        if (!in_array($newStatus, $allowed)) {
            return response()->json([
                'message' => "Invalid status transition from '{$oldStatus}' to '{$newStatus}'. " .
                             "Allowed transitions from '{$oldStatus}': " . (count($allowed) ? implode(', ', $allowed) : 'none (terminal state)') . '.',
                'current_status' => $oldStatus,
            ], 422);
        }

        $appt->status = $newStatus;

        if ($request->filled('reason')) {
            $reasonText = 'Rejection Reason: ' . trim($request->reason);
            $appt->notes = $appt->notes ? $appt->notes . ' | ' . $reasonText : $reasonText;
        }

        $appt->save();

        $appt->load(['client', 'therapist', 'service']);

        if ($oldStatus !== 'Confirmed' && $appt->status === 'Confirmed') {
            if ($appt->client && $appt->client->email) {
                try {
                    Mail::to($appt->client->email)->send(new BookingApprovedMail($appt));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Failed to send booking approved email in updateStatus: ' . $e->getMessage());
                }
            }
            Notification::create([
                'type'           => 'confirmed',
                'title'          => 'Booking Confirmed',
                'description'    => ($appt->client->name ?? 'Client') . ' — ' . ($appt->service->name ?? 'Service'),
                'appointment_id' => $appt->id,
            ]);
        }

        if ($oldStatus !== 'In Progress' && $appt->status === 'In Progress') {
            Notification::create([
                'type'           => 'in_progress',
                'title'          => 'Session In Progress',
                'description'    => ($appt->client->name ?? 'Client') . ' — ' . ($appt->service->name ?? 'Service'),
                'appointment_id' => $appt->id,
            ]);
        }

        if ($appt->status === 'Completed by Therapist') {
            Notification::create([
                'type'           => 'completed_by_therapist',
                'title'          => 'Session Awaiting Admin Confirmation',
                'description'    => ($appt->therapist?->name ?? 'Therapist') . ' completed session #' . $appt->id . ' for ' . ($appt->client->name ?? 'Client') . '. Ready to verify.',
                'appointment_id' => $appt->id,
            ]);
        }

        if ($oldStatus !== 'Completed' && $appt->status === 'Completed') {
            // Auto-mark cash payment as paid if not already marked
            if ($appt->payment_status !== 'paid') {
                $appt->payment_status = 'paid';
                $appt->payment_method = $request->payment_method ?? 'cash';
                $appt->amount_paid = $request->amount_paid ?? ($appt->service ? (float)$appt->service->price : 0.00);
                $appt->paid_at = now();
                $appt->save();
            }

            Notification::create([
                'type'           => 'completed',
                'title'          => 'Session Verified & Completed',
                'description'    => 'Admin confirmed completion and cash settlement of ' . ($appt->client->name ?? 'Client') . ' (' . ($appt->service->name ?? 'Service') . ') by ' . ($appt->therapist?->name ?? 'Therapist') . '. Moved to History.',
                'appointment_id' => $appt->id,
            ]);
        }

        if ($oldStatus !== 'Cancelled' && $appt->status === 'Cancelled') {
            Notification::create([
                'type'           => 'cancelled',
                'title'          => 'Booking Cancelled',
                'description'    => ($appt->client->name ?? 'Client') . ' — ' . ($appt->service->name ?? 'Service'),
                'appointment_id' => $appt->id,
            ]);
        }

        \App\Models\AuditLog::log('update', 'Appointment', "Admin updated status of booking #{$appt->id} from {$oldStatus} to {$appt->status}", [
            'actor' => auth()->user()?->name ?? 'System Admin',
            'actor_role' => 'admin',
            'module' => 'Bookings',
            'severity' => 'info',
            'metadata' => [
                'appointment_id' => $appt->id,
                'old_status' => $oldStatus,
                'new_status' => $appt->status,
                'reason' => $request->reason ?? null
            ]
        ]);

        return response()->json([
            'message' => 'Appointment status updated to ' . $appt->status,
            'appointment' => [
                'id' => $appt->id,
                'client_name' => $appt->client ? $appt->client->name : 'Client',
                'therapist_name' => $appt->therapist ? $appt->therapist->name : 'Unassigned',
                'therapist_id' => $appt->therapist_id,
                'service' => $appt->service ? $appt->service->name : 'Massage Service',
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'status' => $appt->status,
                'notes' => $appt->notes ?? '',
                'payment_status' => $appt->payment_status,
                'payment_method' => $appt->payment_method ?? 'cash',
                'amount_paid' => $appt->amount_paid ? (float)$appt->amount_paid : null,
                'paid_at' => $appt->paid_at ? $appt->paid_at->format('Y-m-d H:i:s') : null,
            ]
        ]);
    }

    /**
     * Settle cash payment after treatment session is completed.
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

        // ── Guard: only allow settlement on active sessions ─────────────────
        $settleableStatuses = ['Confirmed', 'In Progress', 'Completed by Therapist'];
        if (!in_array($appt->status, $settleableStatuses)) {
            return response()->json([
                'message' => "Cannot settle payment for a booking with status '{$appt->status}'. " .
                             'Settlement is only allowed for: ' . implode(', ', $settleableStatuses) . '.',
                'current_status' => $appt->status,
            ], 422);
        }

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
            'description'    => 'Cash payment of ₱' . number_format($request->amount_paid, 2) . ' received for ' . ($appt->client?->name ?? 'Client') . ' (' . ($appt->service?->name ?? 'Service') . ').',
            'appointment_id' => $appt->id,
        ]);

        $tendered = $request->cash_tendered ? (float)$request->cash_tendered : (float)$request->amount_paid;
        $change = $request->change ? (float)$request->change : max(0, $tendered - (float)$request->amount_paid);

        \App\Models\AuditLog::log('update', 'Appointment', "Admin settled cash payment of ₱" . number_format($request->amount_paid, 2) . " (Tendered: ₱" . number_format($tendered, 2) . ", Change: ₱" . number_format($change, 2) . ") for booking #{$appt->id}", [
            'actor' => auth()->user()?->name ?? 'System Admin',
            'actor_role' => 'admin',
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
                'client_name'    => $appt->client ? $appt->client->name : 'Client',
                'service'        => $appt->service ? $appt->service->name : 'Massage Service',
                'datetime'       => $appt->datetime->format('Y-m-d H:i:s'),
                'status'         => $appt->status,
                'payment_status' => $appt->payment_status,
                'payment_method' => $appt->payment_method,
                'amount_paid'    => (float)$appt->amount_paid,
                'paid_at'        => $appt->paid_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    /**
     * Reschedule appointment (Admin).
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

        // Reset reminder timestamps
        $appt->reminder_24h_sent_at = null;
        $appt->reminder_2h_sent_at = null;
        $appt->save();

        $appt->load(['client', 'therapist', 'service']);

        \App\Models\AuditLog::log('update', 'Appointment', "Admin rescheduled booking #{$appt->id} from {$oldDatetime} to {$appt->datetime->format('Y-m-d H:i:s')}", [
            'actor' => auth()->user()?->name ?? 'System Admin',
            'actor_role' => 'admin',
            'module' => 'Bookings',
            'severity' => 'warning',
            'metadata' => [
                'appointment_id' => $appt->id,
                'old_datetime' => $oldDatetime,
                'new_datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'notes' => $request->notes ?? null
            ]
        ]);

        return response()->json([
            'message' => 'Appointment rescheduled successfully',
            'appointment' => [
                'id' => $appt->id,
                'client_name' => $appt->client ? $appt->client->name : 'Client',
                'therapist_name' => $appt->therapist ? $appt->therapist->name : 'Unassigned',
                'therapist_id' => $appt->therapist_id,
                'service' => $appt->service ? $appt->service->name : 'Massage Service',
                'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                'status' => $appt->status,
                'notes' => $appt->notes ?? '',
            ]
        ]);
    }

    /**
     * Get list of therapists and their scheduled availabilities.
     */
    public function getTherapists()
    {
        $therapists = User::role('therapist')
            ->get()
            ->map(function ($t) {
                // Fetch availability dates
                $availDates = TherapistAvailability::where('therapist_id', $t->id)
                    ->pluck('date')
                    ->map(function ($date) {
                        return Carbon::parse($date)->format('Y-m-d');
                    })
                    ->toArray();

                return [
                    'id' => $t->id,
                    'name' => $t->name,
                    'email' => $t->email,
                    'availabilities' => $availDates,
                    'specialty' => 'Spa Professional'
                ];
            });

        return response()->json([
            'therapists' => $therapists
        ]);
    }

    // ── SERVICES CRUD ────────────────────────────────────────────────────────

    public function getServices()
    {
        $services = Service::all();
        return response()->json($services);
    }

    public function storeService(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'nullable|numeric',
            'duration' => 'required|integer',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $service = Service::create($validated);

        return response()->json([
            'message' => 'Service created successfully',
            'service' => $service
        ]);
    }

    public function updateService(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'nullable|numeric',
            'duration' => 'required|integer',
            'image' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $service = Service::findOrFail($id);
        $service->update($validated);

        return response()->json([
            'message' => 'Service updated successfully',
            'service' => $service
        ]);
    }

    public function deleteService($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully'
        ]);
    }

    /**
     * Get all registered client customers with full profile data.
     */
    public function getCustomers()
    {
        $clients = User::role('client')
            ->with([
                'appointments' => function ($q) {
                    $q->with(['service', 'therapist'])
                      ->orderBy('datetime', 'desc');
                }
            ])
            ->withCount('appointments')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($c) {
                // Total spent: sum of service prices for Completed appointments
                $totalSpent = $c->appointments
                    ->where('status', 'Completed')
                    ->sum(fn ($a) => $a->service ? (float) $a->service->price : 0);

                // Auto-tier: VIP if >= 5 bookings, else use stored tier
                $tier = $c->tier ?? 'Regular';
                if ($c->appointments_count >= 5 && $tier === 'Regular') {
                    $tier = 'VIP';
                }

                // Build history array (last 10 appointments)
                $history = $c->appointments->take(10)->map(fn ($a) => [
                    'id'        => 'b' . $a->id,
                    'service'   => $a->service ? $a->service->name : 'Service',
                    'date'      => $a->datetime->format('Y-m-d'),
                    'therapist' => $a->therapist ? $a->therapist->name : 'Unassigned',
                    'status'    => $a->status,
                    'amount'    => $a->service ? (float) $a->service->price : 0,
                ])->values()->toArray();

                return [
                    'id'          => $c->id,
                    'name'        => $c->name,
                    'email'       => $c->email,
                    'phone'       => $c->phone ?? '',
                    'tier'        => $tier,
                    'bookings'    => $c->appointments_count,
                    'totalSpent'  => $totalSpent,
                    'notes'       => $c->notes ?? '',
                    'created_at'  => $c->created_at->format('Y-m-d'),
                    'history'     => $history,
                ];
            });

        return response()->json([
            'customers' => $clients
        ]);
    }

    /**
     * Register a new customer (client role user).
     */
    public function storeCustomer(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|min:2|max:100',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'tier'  => 'nullable|in:Regular,VIP',
            'notes' => 'nullable|string|max:1000',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'phone'    => $validated['phone'] ?? null,
            'tier'     => $validated['tier'] ?? 'Regular',
            'notes'    => $validated['notes'] ?? null,
            'password' => bcrypt('Temp@' . rand(10000, 99999)), // temp password
        ]);

        $user->assignRole('client');

        return response()->json([
            'message'  => 'Customer registered successfully',
            'customer' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone ?? '',
                'tier'       => $user->tier,
                'bookings'   => 0,
                'totalSpent' => 0,
                'notes'      => $user->notes ?? '',
                'created_at' => $user->created_at->format('Y-m-d'),
                'history'    => [],
            ]
        ], 201);
    }

    /**
     * Update customer notes/tier.
     */
    public function updateCustomer(Request $request, $id)
    {
        $user = User::role('client')->findOrFail($id);

        $validated = $request->validate([
            'name'  => 'nullable|string|min:2|max:100',
            'notes' => 'nullable|string|max:1000',
            'tier'  => 'nullable|in:Regular,VIP',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Customer updated successfully'
        ]);
    }

    /**
     * Delete customer account.
     */
    public function deleteCustomer($id)
    {
        $user = User::role('client')->findOrFail($id);

        // Revoke any active tokens
        $user->tokens()->delete();

        // Delete user
        $user->delete();

        return response()->json([
            'message' => 'Customer account deleted successfully'
        ]);
    }

    /**
     * Update RBAC permissions for roles and log audit event.
     */
    public function updatePermissions(Request $request)
    {
        $permissionsData = $request->input('permissions', []);

        foreach ($permissionsData as $roleName => $perms) {
            /** @var \Spatie\Permission\Models\Role|null $role */
            $role = \Spatie\Permission\Models\Role::where('name', $roleName)->first();
            if (!$role) continue;

            $enabledPerms = array_keys(array_filter($perms));
            // Ensure permissions exist before syncing
            foreach ($enabledPerms as $permName) {
                \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permName, 'guard_name' => 'web']);
            }
            $role->syncPermissions($enabledPerms);
        }

        $actor = auth()->user()?->name ?? 'System Admin';
        $actorRole = auth()->user()?->roles?->first()?->name ?? 'admin';

        \App\Models\AuditLog::log('update', 'RBAC Permissions', "Updated permissions for system roles", [
            'actor' => $actor,
            'actor_role' => $actorRole,
            'module' => 'Access Control',
            'severity' => 'warning',
            'metadata' => [
                'updated_roles' => array_keys($permissionsData),
                'permissions_payload' => $permissionsData,
            ]
        ]);

        return response()->json([
            'message' => 'RBAC permissions updated and logged successfully',
        ]);
    }

    /**
     * Get team members (therapists and staff coordinators).
     */
    public function getTeamMembers()
    {
        $members = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['therapist', 'staff']);
        })
        ->with('roles')
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($u) {
            $roleName = $u->roles->first()?->name ?? 'therapist';
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone ?? '',
                'role' => $roleName,
                'specialty' => $u->specialty ?: ($roleName === 'therapist' ? 'General Wellness & Spa' : 'Front Desk Coordinator'),
                'status' => $u->status ?? 'active',
                'joined' => $u->created_at ? $u->created_at->format('Y-m-d') : date('Y-m-d'),
                'commRate' => $roleName === 'therapist' ? 40 : null,
            ];
        });

        return response()->json([
            'team_members' => $members
        ]);
    }

    /**
     * Store new team member (therapist or staff only - strictly NO admin allowed).
     */
    public function storeTeamMember(Request $request)
    {
        // Explicit security check: Admin roles cannot be added via team member onboarding
        if (strtolower($request->input('role', '')) === 'admin') {
            return response()->json([
                'message' => 'Security Policy: Administrator accounts cannot be provisioned through team onboarding.',
                'errors' => [
                    'role' => ['Administrator role cannot be assigned here for security and governance.']
                ]
            ], 422);
        }

        // Bridge confirmPassword to password_confirmation for Laravel confirmed rule
        if ($request->filled('confirmPassword') && !$request->filled('password_confirmation')) {
            $request->merge(['password_confirmation' => $request->input('confirmPassword')]);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|max:150|unique:users,email',
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^[0-9+()\- ]{7,25}$/'],
            'role' => 'required|string|in:therapist,staff',
            'specialty' => 'nullable|string|max:150',
            'status' => 'required|string|in:active,inactive',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'role.in' => 'Selected role must be either Therapist or Staff Coordinator.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.confirmed' => 'Password confirmation does not match.',
            'email.unique' => 'This email address is already registered in the system.',
            'phone.regex' => 'Please enter a valid phone number (e.g., +63 917 123 4567).',
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'phone' => !empty($validated['phone']) ? trim($validated['phone']) : null,
            'specialty' => !empty($validated['specialty']) ? trim($validated['specialty']) : null,
            'status' => $validated['status'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        $roleLabel = $validated['role'] === 'therapist' ? 'Therapist' : 'Staff Coordinator';
        \App\Models\AuditLog::log('create', 'User Management', "Admin provisioned new {$roleLabel} account: {$user->name} ({$user->email})", [
            'actor' => auth()->user()?->name ?? 'System Admin',
            'actor_role' => 'admin',
            'module' => 'Team Members',
            'severity' => 'info',
            'metadata' => [
                'user_id' => $user->id,
                'role' => $validated['role'],
                'specialty' => $user->specialty,
                'status' => $user->status,
            ]
        ]);

        return response()->json([
            'message' => "New {$roleLabel} account successfully created!",
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'role' => $validated['role'],
                'specialty' => $user->specialty ?: ($validated['role'] === 'therapist' ? 'General Wellness & Spa' : 'Front Desk Coordinator'),
                'status' => $user->status,
                'joined' => $user->created_at->format('Y-m-d'),
                'commRate' => $validated['role'] === 'therapist' ? 40 : null,
            ]
        ], 201);
    }

    /**
     * Update team member.
     */
    public function updateTeamMember(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Security check: ensure target is not an admin
        if ($user->hasRole('admin')) {
            return response()->json([
                'message' => 'Security Policy: Administrator accounts cannot be modified through team member maintenance.',
            ], 403);
        }

        // Security check: cannot elevate to admin
        if (strtolower($request->input('role', '')) === 'admin') {
            return response()->json([
                'message' => 'Security Policy: Cannot assign Administrator role.',
                'errors' => [
                    'role' => ['Administrator role cannot be assigned here.']
                ]
            ], 422);
        }

        // Bridge confirmPassword to password_confirmation if password is provided
        if ($request->filled('confirmPassword') && !$request->filled('password_confirmation')) {
            $request->merge(['password_confirmation' => $request->input('confirmPassword')]);
        }

        $validated = $request->validate([
            'name' => 'required|string|min:2|max:100',
            'email' => 'required|email|max:150|unique:users,email,' . $id,
            'phone' => ['nullable', 'string', 'max:25', 'regex:/^[0-9+()\- ]{7,25}$/'],
            'role' => 'required|string|in:therapist,staff',
            'specialty' => 'nullable|string|max:150',
            'status' => 'required|string|in:active,inactive',
            'password' => 'nullable|string|min:8|confirmed',
        ], [
            'role.in' => 'Selected role must be either Therapist or Staff Coordinator.',
            'password.min' => 'Password must be at least 8 characters long.',
            'password.confirmed' => 'Password confirmation does not match.',
            'email.unique' => 'This email address is already registered in the system.',
            'phone.regex' => 'Please enter a valid phone number (e.g., +63 917 123 4567).',
        ]);

        $updateData = [
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'phone' => !empty($validated['phone']) ? trim($validated['phone']) : null,
            'specialty' => !empty($validated['specialty']) ? trim($validated['specialty']) : null,
            'status' => $validated['status'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $user->update($updateData);
        $user->syncRoles([$validated['role']]);

        \App\Models\AuditLog::log('update', 'User Management', "Admin updated team member #{$user->id}: {$user->name}", [
            'actor' => auth()->user()?->name ?? 'System Admin',
            'actor_role' => 'admin',
            'module' => 'Team Members',
            'severity' => 'info',
            'metadata' => [
                'user_id' => $user->id,
                'role' => $validated['role'],
                'status' => $user->status,
            ]
        ]);

        return response()->json([
            'message' => 'Team member profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'role' => $validated['role'],
                'specialty' => $user->specialty ?: ($validated['role'] === 'therapist' ? 'General Wellness & Spa' : 'Front Desk Coordinator'),
                'status' => $user->status,
                'joined' => $user->created_at->format('Y-m-d'),
                'commRate' => $validated['role'] === 'therapist' ? 40 : null,
            ]
        ]);
    }

    /**
     * Toggle team member status (active / inactive).
     */
    public function toggleTeamMemberStatus($id)
    {
        $user = User::findOrFail($id);
        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'Cannot alter administrator status.'], 403);
        }

        $nextStatus = ($user->status === 'active') ? 'inactive' : 'active';
        $user->status = $nextStatus;
        $user->save();

        \App\Models\AuditLog::log('update', 'User Management', "Admin changed status of #{$user->id} ({$user->name}) to {$nextStatus}", [
            'actor' => auth()->user()?->name ?? 'System Admin',
            'actor_role' => 'admin',
            'module' => 'Team Members',
            'severity' => 'info',
        ]);

        return response()->json([
            'message' => "User status set to {$nextStatus}",
            'status' => $nextStatus
        ]);
    }

    /**
     * Delete team member account.
     */
    public function deleteTeamMember($id)
    {
        $user = User::findOrFail($id);
        if ($user->hasRole('admin')) {
            return response()->json(['message' => 'Administrator accounts cannot be deleted.'], 403);
        }

        $userName = $user->name;
        $user->tokens()->delete();
        $user->delete();

        \App\Models\AuditLog::log('delete', 'User Management', "Admin removed team member: {$userName} (#{$id})", [
            'actor' => auth()->user()?->name ?? 'System Admin',
            'actor_role' => 'admin',
            'module' => 'Team Members',
            'severity' => 'warning',
        ]);

        return response()->json([
            'message' => "Team member {$userName} removed successfully"
        ]);
    }
}


