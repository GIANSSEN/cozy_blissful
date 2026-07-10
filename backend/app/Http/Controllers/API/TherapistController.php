<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TherapistController extends Controller
{
    /**
     * Display the Therapist Job Portal and appointments.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Therapist dashboard and jobs retrieved successfully',
            'therapist_stats' => [
                'my_appointments' => 4,
                'completed_sessions' => 48,
                'rating' => 4.9,
                'hours_worked' => 96
            ],
            'appointments' => [
                [
                    'id' => 1,
                    'client_name' => 'Jane Client',
                    'service' => 'Swedish Massage (60 min)',
                    'datetime' => '2026-07-11 10:00:00',
                    'notes' => 'Prefers firm pressure on the shoulders.',
                    'status' => 'Confirmed'
                ],
                [
                    'id' => 3,
                    'client_name' => 'Bob Marley',
                    'service' => 'Aromatherapy Session',
                    'datetime' => '2026-07-12 15:00:00',
                    'notes' => 'Requested lavender essential oil.',
                    'status' => 'Confirmed'
                ]
            ],
            'available_jobs' => [
                [
                    'id' => 10,
                    'title' => 'Deep Tissue Masseuse Needed',
                    'location' => 'Cozy Blissful Retreat - Suite A',
                    'compensation' => '$90.00 / session',
                    'datetime' => '2026-07-13 14:00:00',
                    'description' => 'Requires expertise in sports recovery massage.'
                ],
                [
                    'id' => 11,
                    'title' => 'Hot Stone Therapy Specialist',
                    'location' => 'Cozy Blissful Retreat - Suite B',
                    'compensation' => '$110.00 / session',
                    'datetime' => '2026-07-14 09:00:00',
                    'description' => 'Client requested standard hot basalt stone relaxation.'
                ]
            ]
        ]);
    }
}
