<?php

namespace App\Console\Commands;

use App\Mail\AppointmentReminderMail;
use App\Models\Appointment;
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
    protected $description = 'Send appointment reminder emails to clients with upcoming sessions (24hr and 2hr windows).';

    public function handle(): void
    {
        $now = Carbon::now();

        // ─── 24-HOUR REMINDER WINDOW ─────────────────────────────────────────
        $window24Start = $now->copy()->addHours(23)->addMinutes(30);
        $window24End   = $now->copy()->addHours(24)->addMinutes(30);

        $appointments24h = Appointment::with(['client', 'therapist', 'service'])
            ->whereIn('status', ['Confirmed', 'Pending'])
            ->whereBetween('datetime', [$window24Start, $window24End])
            ->whereNull('reminder_24h_sent_at') // Prevent duplicate sends
            ->get();

        foreach ($appointments24h as $appointment) {
            /** @var Appointment $appointment */
            if ($appointment->client && $appointment->client->email) {
                try {
                    Mail::to($appointment->client->email)
                        ->queue(new AppointmentReminderMail($appointment, '24'));

                    // Mark as sent so we don't send again
                    $appointment->update(['reminder_24h_sent_at' => now()]);

                    $this->info("24h reminder queued for: {$appointment->client->email} (Booking #{$appointment->id})");
                    Log::info('24h reminder sent', [
                        'appointment_id' => $appointment->id,
                        'client_email'   => $appointment->client->email,
                    ]);
                } catch (\Exception $e) {
                    $this->error("Failed to queue 24h reminder for booking #{$appointment->id}: {$e->getMessage()}");
                    Log::error('24h reminder failed', [
                        'appointment_id' => $appointment->id,
                        'error'          => $e->getMessage(),
                    ]);
                }
            }
        }

        // ─── 2-HOUR REMINDER WINDOW ──────────────────────────────────────────
        $window2Start = $now->copy()->addHours(1)->addMinutes(30);
        $window2End   = $now->copy()->addHours(2)->addMinutes(30);

        $appointments2h = Appointment::with(['client', 'therapist', 'service'])
            ->whereIn('status', ['Confirmed', 'Pending'])
            ->whereBetween('datetime', [$window2Start, $window2End])
            ->whereNull('reminder_2h_sent_at')
            ->get();

        foreach ($appointments2h as $appointment) {
            /** @var Appointment $appointment */
            if ($appointment->client && $appointment->client->email) {
                try {
                    Mail::to($appointment->client->email)
                        ->queue(new AppointmentReminderMail($appointment, '2'));

                    $appointment->update(['reminder_2h_sent_at' => now()]);

                    $this->info("2h reminder queued for: {$appointment->client->email} (Booking #{$appointment->id})");
                    Log::info('2h reminder sent', [
                        'appointment_id' => $appointment->id,
                        'client_email'   => $appointment->client->email,
                    ]);
                } catch (\Exception $e) {
                    $this->error("Failed to queue 2h reminder for booking #{$appointment->id}: {$e->getMessage()}");
                    Log::error('2h reminder failed', [
                        'appointment_id' => $appointment->id,
                        'error'          => $e->getMessage(),
                    ]);
                }
            }
        }

        $total = $appointments24h->count() + $appointments2h->count();
        $this->info("✅ Done. {$total} reminder(s) queued.");
    }
}
