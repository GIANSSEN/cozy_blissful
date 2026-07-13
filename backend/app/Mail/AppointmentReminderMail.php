<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $clientName;
    public string $serviceName;
    public string $appointmentDate;
    public string $appointmentTime;
    public string $therapistName;
    public string $hoursUntil;
    public int $bookingId;

    public function __construct(Appointment $appointment, string $hoursUntil = '24')
    {
        $this->clientName      = $appointment->client?->name ?? 'Valued Client';
        $this->serviceName     = $appointment->service?->name ?? 'Spa Service';
        $this->appointmentDate = $appointment->datetime->format('l, F j, Y');
        $this->appointmentTime = $appointment->datetime->format('g:i A');
        $this->therapistName   = $appointment->therapist?->name ?? 'Our Specialist';
        $this->hoursUntil      = $hoursUntil;
        $this->bookingId       = $appointment->id;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⏰ Reminder: Your ' . $this->serviceName . ' session is in ' . $this->hoursUntil . ' hours!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment_reminder',
        );
    }
}
