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
        
        $totalRevenue = Appointment::where('appointments.status', 'Completed')
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->sum('services.price');

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
                ];
            });

        // 3. Services list
        $services = Service::all();

        // 4. Payments list generated from appointments (to display on admin payments tab)
        $completedAppts = Appointment::with(['client', 'service'])
            ->whereIn('status', ['Confirmed', 'Completed'])
            ->get();

        $payments = $completedAppts->map(function ($appt) {
            return [
                'id' => 1000 + $appt->id,
                'client_name' => $appt->client ? $appt->client->name : 'Client',
                'amount' => $appt->service ? (float)$appt->service->price : 749.00,
                'status' => $appt->status === 'Completed' ? 'Completed' : 'Pending',
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
                ];
            });

        return response()->json([
            'recent_appointments' => $appointments
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
            'status' => 'required|in:Pending,Confirmed,Completed,Cancelled',
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

        if ($oldStatus !== 'Completed' && $appt->status === 'Completed') {
            Notification::create([
                'type'           => 'completed',
                'title'          => 'Session Completed',
                'description'    => ($appt->client->name ?? 'Client') . ' — ' . ($appt->service->name ?? 'Service'),
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

        return response()->json([
            'message' => 'Appointment status updated successfully',
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
            'notes' => 'nullable|string|max:1000',
            'tier'  => 'nullable|in:Regular,VIP',
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Customer updated successfully'
        ]);
    }
}

