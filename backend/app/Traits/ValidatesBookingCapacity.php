<?php

namespace App\Traits;

use App\Models\Appointment;
use App\Models\User;
use Carbon\Carbon;

/**
 * Shared salon scheduling guards for Admin / Staff / Client booking flows.
 *
 * Single source of truth for the overlap rule used across the system:
 *   a window [S_start, S_end] overlaps an existing booking [E_start, E_end]
 *   iff  S_start < E_end && S_end > E_start.
 *
 * Only `Pending` and `Confirmed` rows occupy capacity — In Progress sessions
 * are already inside the salon and Completed/Cancelled rows are history.
 */
trait ValidatesBookingCapacity
{
    /**
     * Check whether a specific therapist is already engaged during the window.
     */
    protected function therapistHasConflict(
        int $therapistId,
        Carbon $newStart,
        int $durationMin,
        ?int $ignoreAppointmentId = null
    ): bool {
        $newStartMin = ((int) $newStart->format('H')) * 60 + ((int) $newStart->format('i'));
        $newEndMin = $newStartMin + max(15, $durationMin);

        return Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->where('therapist_id', $therapistId)
            ->whereDate('datetime', $newStart->toDateString())
            ->when($ignoreAppointmentId, fn ($q) => $q->where('id', '!=', $ignoreAppointmentId))
            ->get()
            ->contains(function ($other) use ($newStartMin, $newEndMin) {
                $otherStartMin = ((int) $other->datetime->format('H')) * 60 + ((int) $other->datetime->format('i'));
                $otherDur = $other->service ? max(15, (int) $other->service->duration) : 60;
                return $newStartMin < ($otherStartMin + $otherDur) && $newEndMin > $otherStartMin;
            });
    }

    /**
     * Check whether every working therapist is engaged during the window
     * (i.e. the salon has no free chair left for an "any specialist" booking).
     */
    protected function salonAtCapacity(
        Carbon $newStart,
        int $durationMin,
        ?int $ignoreAppointmentId = null
    ): bool {
        $newStartMin = ((int) $newStart->format('H')) * 60 + ((int) $newStart->format('i'));
        $newEndMin = $newStartMin + max(15, $durationMin);

        $workingCount = User::role('therapist')
            ->whereHas('availabilities', fn ($q) => $q->where('date', $newStart->toDateString()))
            ->count();
        if ($workingCount === 0) {
            $workingCount = User::role('therapist')->count();
        }
        $capacity = max(1, $workingCount);

        $overlapCount = Appointment::with('service')
            ->whereIn('status', ['Pending', 'Confirmed'])
            ->whereDate('datetime', $newStart->toDateString())
            ->when($ignoreAppointmentId, fn ($q) => $q->where('id', '!=', $ignoreAppointmentId))
            ->get()
            ->filter(function ($other) use ($newStartMin, $newEndMin) {
                $otherStartMin = ((int) $other->datetime->format('H')) * 60 + ((int) $other->datetime->format('i'));
                $otherDur = $other->service ? max(15, (int) $other->service->duration) : 60;
                return $newStartMin < ($otherStartMin + $otherDur) && $newEndMin > $otherStartMin;
            })
            ->count();

        return $overlapCount >= $capacity;
    }
}
