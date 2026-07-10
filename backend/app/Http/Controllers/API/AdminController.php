<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Display the Admin Dashboard metrics and stats.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Admin dashboard metrics retrieved successfully',
            'stats' => [
                'total_bookings' => 142,
                'total_revenue' => 12850.75,
                'active_therapists' => 12,
                'registered_clients' => 89,
            ],
            'recent_appointments' => [
                [
                    'id' => 1,
                    'client_name' => 'Jane Client',
                    'therapist_name' => 'John Therapist',
                    'service' => 'Swedish Massage (60 min)',
                    'datetime' => '2026-07-11 10:00:00',
                    'status' => 'Confirmed',
                ],
                [
                    'id' => 2,
                    'client_name' => 'Alice Cooper',
                    'therapist_name' => 'Sarah Connor',
                    'service' => 'Deep Tissue Therapy',
                    'datetime' => '2026-07-11 11:30:00',
                    'status' => 'Pending',
                ],
                [
                    'id' => 3,
                    'client_name' => 'Bob Marley',
                    'therapist_name' => 'John Therapist',
                    'service' => 'Aromatherapy Session',
                    'datetime' => '2026-07-12 15:00:00',
                    'status' => 'Confirmed',
                ]
            ],
            'services' => [
                [ 'id' => 1, 'name' => 'Swedish Massage', 'duration' => '60 min', 'price' => 80.00 ],
                [ 'id' => 2, 'name' => 'Deep Tissue Massage', 'duration' => '90 min', 'price' => 120.00 ],
                [ 'id' => 3, 'name' => 'Aromatherapy Massage', 'duration' => '60 min', 'price' => 95.00 ],
                [ 'id' => 4, 'name' => 'Hot Stone Therapy', 'duration' => '75 min', 'price' => 110.00 ]
            ],
            'payments' => [
                [ 'id' => 101, 'client_name' => 'Jane Client', 'amount' => 80.00, 'status' => 'Completed', 'date' => '2026-07-09' ],
                [ 'id' => 102, 'client_name' => 'Bob Marley', 'amount' => 95.00, 'status' => 'Completed', 'date' => '2026-07-08' ],
                [ 'id' => 103, 'client_name' => 'Alice Cooper', 'amount' => 120.00, 'status' => 'Pending', 'date' => '2026-07-10' ]
            ]
        ]);
    }
}
