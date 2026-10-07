<?php

namespace App\Support;

use App\Models\Appointment;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * BookingGroup — single-email grouping helper.
 *
 * A "booking group" = all Appointment rows created from ONE checkout:
 * same client_id + same datetime (exact second). Multi-service checkout
 * creates N rows but must trigger exactly ONE email to the client.
 */
class BookingGroup
{
    /**
     * Get all sibling appointments belonging to the same checkout group.
     *
     * @return Collection<int, Appointment>
     */
    public static function for(Appointment $appointment): Collection
    {
        $appointment->loadMissing(['client', 'therapist', 'service']);

        return Appointment::with(['client', 'therapist', 'service'])
            ->where('client_id', $appointment->client_id)
            ->where('datetime', $appointment->datetime->format('Y-m-d H:i:s'))
            ->orderBy('id')
            ->get();
    }

    /**
     * Group an arbitrary collection of appointments by client+datetime.
     *
     * @param  iterable<Appointment>  $appointments
     * @return Collection<string, Collection<int, Appointment>>
     */
    public static function groupMany(iterable $appointments): Collection
    {
        $list = $appointments instanceof Collection ? $appointments : collect($appointments);

        return $list->groupBy(fn (Appointment $a) => $a->client_id . '|' . $a->datetime->format('Y-m-d H:i:s'));
    }

    /**
     * Cache key used to suppress duplicate approved-emails for a group.
     */
    public static function mailKey(Appointment $appointment): string
    {
        return 'booking_approved_sent:' . $appointment->client_id . ':' . $appointment->datetime->format('YmdHi');
    }

    /**
     * Returns true if an approved-email was already sent for this group
     * within the dedupe window (prevents per-service spam when staff
     * confirms sibling rows one by one).
     */
    public static function alreadyMailed(Appointment $appointment): bool
    {
        return Cache::has(self::mailKey($appointment));
    }

    /**
     * Mark a group as mailed for 12 hours.
     */
    public static function markMailed(Appointment $appointment): void
    {
        Cache::put(self::mailKey($appointment), true, now()->addHours(12));
    }

    /**
     * Confirm every sibling in the group together (same therapist + status),
     * so one staff action confirms the whole multi-service checkout.
     *
     * @return Collection<int, Appointment> refreshed group
     */
    public static function confirmGroup(Appointment $appointment, ?int $therapistId = null): Collection
    {
        $group = self::for($appointment);

        foreach ($group as $sibling) {
            $dirty = false;
            if (! is_null($therapistId) && $sibling->therapist_id !== $therapistId) {
                $sibling->therapist_id = $therapistId;
                $dirty = true;
            }
            if ($sibling->status === 'Pending') {
                $sibling->status = 'Confirmed';
                $dirty = true;
            }
            if ($dirty) {
                $sibling->save();
            }
        }

        return self::for($appointment);
    }
}
