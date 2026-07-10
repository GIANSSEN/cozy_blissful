<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Display client bookings and active options.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'message' => 'Client bookings retrieved successfully',
            'client_name' => $user ? $user->name : 'Jane Client',
            'bookings' => [
                [
                    'id' => 1,
                    'therapist_name' => 'John Therapist',
                    'service' => 'Swedish Massage (60 min)',
                    'datetime' => '2026-07-11 10:00:00',
                    'status' => 'Confirmed'
                ]
            ],
            'available_services' => [
                [ 'id' => 1, 'name' => 'Swedish Massage', 'price' => 80.00, 'duration' => '60 min' ],
                [ 'id' => 2, 'name' => 'Deep Tissue Massage', 'price' => 120.00, 'duration' => '90 min' ],
                [ 'id' => 3, 'name' => 'Aromatherapy Massage', 'price' => 95.00, 'duration' => '60 min' ]
            ],
            'available_therapists' => [
                [ 'id' => 1, 'name' => 'John Therapist', 'specialty' => 'Relaxation & Swedish' ],
                [ 'id' => 2, 'name' => 'Sarah Connor', 'specialty' => 'Deep Tissue & Sports Recovery' ]
            ]
        ]);
    }

    /**
     * Create a mock booking for the client.
     */
    public function store(Request $request)
    {
        $request->validate([
            'service' => 'required|string',
            'therapist' => 'required|string',
            'datetime' => 'required|string',
        ]);

        return response()->json([
            'message' => 'Booking created successfully!',
            'booking' => [
                'id' => rand(100, 999),
                'therapist_name' => $request->therapist,
                'service' => $request->service,
                'datetime' => $request->datetime,
                'status' => 'Pending'
            ]
        ], 201);
    }
}
