<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
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
     * GET /booking/available-slots?date=YYYY-MM-DD&service_id=X
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'date'       => 'required|date|after_or_equal:today',
            'service_id' => 'required|exists:services,id',
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

        // Fetch existing confirmed/pending appointments on that date
        $existingAppointments = Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('datetime', $date->toDateString())
            ->get();

        // Build an array of blocked minute ranges [start_minute, end_minute]
        $blockedRanges = $existingAppointments->map(function ($appt) {
            $startMin  = (int)$appt->datetime->format('H') * 60 + (int)$appt->datetime->format('i');
            $apptDur   = $appt->service ? (int)$appt->service->duration : 60;
            return [$startMin, $startMin + $apptDur];
        })->toArray();

        // Filter out slots that overlap with any existing booking
        $availableSlots = array_filter($slots, function ($slotTime) use ($duration, $blockedRanges) {
            [$h, $m] = explode(':', $slotTime);
            $slotStart = (int)$h * 60 + (int)$m;
            $slotEnd   = $slotStart + $duration;

            foreach ($blockedRanges as [$blockStart, $blockEnd]) {
                // Overlap if slot starts before block ends AND slot ends after block starts
                if ($slotStart < $blockEnd && $slotEnd > $blockStart) {
                    return false;
                }
            }
            return true;
        });

        return response()->json([
            'date'            => $date->toDateString(),
            'service_id'      => $service->id,
            'service_name'    => $service->name,
            'service_duration'=> $duration,
            'available_slots' => array_values($availableSlots),
            'all_slots'       => $slots,
            'booked_slots'    => array_values(array_diff($slots, $availableSlots)),
        ]);
    }

    /**
     * Create a real booking for the client.
     */
    public function store(Request $request)
    {
        $request->validate([
            'service_id'  => 'required|exists:services,id',
            'datetime'    => 'required|date|after:now',
            'notes'       => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $service = Service::findOrFail($request->service_id);
        $duration = (int)$service->duration;

        try {
            $parsedDatetime = Carbon::parse($request->datetime);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid date time format.'], 422);
        }

        // ── Server-side conflict check ─────────────────────────────────────
        $newStart = $parsedDatetime->copy();
        $newEnd   = $parsedDatetime->copy()->addMinutes($duration);

        $conflict = Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('datetime', $parsedDatetime->toDateString())
            ->get()
            ->first(function ($appt) use ($newStart, $newEnd) {
                $existStart = $appt->datetime;
                $existDur   = $appt->service ? (int)$appt->service->duration : 60;
                $existEnd   = $existStart->copy()->addMinutes($existDur);
                return $newStart->lt($existEnd) && $newEnd->gt($existStart);
            });

        if ($conflict) {
            return response()->json([
                'message' => 'This time slot is already booked. Please choose a different time.',
                'errors'  => ['datetime' => ['Time slot conflict — another appointment overlaps this window.']],
            ], 422);
        }

        // ── Create appointment ─────────────────────────────────────────────
        $appt = Appointment::create([
            'client_id'    => $user->id,
            'therapist_id' => null, // Admin/Staff will assign the therapist
            'service_id'   => $service->id,
            'datetime'     => $parsedDatetime,
            'status'       => 'Pending',
            'notes'        => $request->notes,
        ]);

        // Load relationships for the email
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
                'id'              => $appt->id,
                'therapist_name'  => $appt->therapist ? $appt->therapist->name : 'Awaiting Assignment',
                'service'         => $service->name,
                'service_price'   => (float)$service->price,
                'service_duration'=> $duration,
                'datetime'        => $appt->datetime->format('Y-m-d H:i:s'),
                'status'          => 'Pending',
                'notes'           => $appt->notes,
            ],
        ], 201);
    }
}
