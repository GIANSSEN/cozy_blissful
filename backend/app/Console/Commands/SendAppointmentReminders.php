<?php

namespace App\Console\Commands;

use App\Mail\AppointmentReminderMail;
use App\Models\Appointment;
use App\Support\BookingGroup;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'reminders:send';

    /**
     * The console command description.
     */
    protected $description = 'Send appointment reminder emails to clients with upcoming sessions (24hr and 2hr windows). One email per booking group.';

    public function handle(): void
    {
        $now = Carbon::now();

        $this->sendWindowReminders($now->copy()->addHours(23)->addMinutes(30), $now->copy()->addHours(24)->addMinutes(30), '24', 'reminder_24h_sent_at');
        $this->sendWindowReminders($now->copy()->addHours(1)->addMinutes(30), $now->copy()->addHours(2)->addMinutes(30), '2', 'reminder_2h_sent_at');

        $this->info('✅ Done. Reminders processed (one email per booking group).');
    }

    private function sendWindowReminders(Carbon $start, Carbon $end, string $hoursUntil, string $flagColumn): void
    {
        $appointments = Appointment::with(['client', 'therapist', 'service'])
            ->whereIn('status', ['Confirmed', 'Pending'])
            ->whereBetween('datetime', [$start, $end])
            ->whereNull($flagColumn) // Prevent duplicate sends
            ->orderBy('datetime')
            ->get();

        // Group by client+datetime: one Gmail per multi-service checkout.
        $groups = BookingGroup::groupMany($appointments);
        $sent = 0;

        foreach ($groups as $group) {
            /** @var Appointment $first */
            $first = $group->first();
            if (! $first->client || ! $first->client->email) {
                continue;
            }

            try {
                Mail::to($first->client->email)->send(new AppointmentReminderMail($group, $hoursUntil));

                // Mark every sibling so the group never re-sends.
                Appointment::whereIn('id', $group->pluck('id'))->update([$flagColumn => now()]);

                $sent++;
                $this->info("{$hoursUntil}h reminder sent to: {$first->client->email} ({$group->count()} service(s): {$group->pluck('id')->implode(', ')})");
                Log::info("{$hoursUntil}h group reminder sent", [
                    'appointment_ids' => $group->pluck('id')->all(),
                    'client_email' => $first->client->email,
                ]);
            } catch (\Exception $e) {
                $this->error("Failed to send {$hoursUntil}h reminder for bookings {$group->pluck('id')->implode(', ')}: {$e->getMessage()}");
                Log::error("{$hoursUntil}h group reminder failed", [
                    'appointment_ids' => $group->pluck('id')->all(),
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info("{$hoursUntil}h window: {$sent} group email(s) sent.");
    }
}
