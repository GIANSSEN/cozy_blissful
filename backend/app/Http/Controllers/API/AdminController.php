<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use App\Models\TherapistAvailability;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Display the Admin Dashboard metrics and stats.
     */
    public function index()
    {
        // 1. Core metrics
        $totalBookings = Appointment::count();
        
        $totalRevenue = Appointment::where('status', 'Completed')
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
                    'id' => $appt->id,
                    'client_name' => $appt->client ? $appt->client->name : 'Client',
                    'therapist_name' => $appt->therapist ? $appt->therapist->name : 'Unassigned',
                    'therapist_id' => $appt->therapist_id,
                    'service' => $appt->service ? $appt->service->name : 'Massage Service',
                    'datetime' => $appt->datetime->format('Y-m-d H:i:s'),
                    'status' => $appt->status,
                    'notes' => $appt->notes ?? '',
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
        $appt->therapist_id = $request->therapist_id;
        
        // If therapist is assigned and status was Pending, auto-confirm the booking
        if ($request->therapist_id && $appt->status === 'Pending') {
            $appt->status = 'Confirmed';
        }
        
        $appt->save();

        $appt->load(['client', 'therapist', 'service']);

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
        ]);

        $appt = Appointment::findOrFail($id);
        $appt->status = $request->status;
        $appt->save();

        $appt->load(['client', 'therapist', 'service']);

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
}
