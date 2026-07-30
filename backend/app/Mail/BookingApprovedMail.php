<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $clientName;
    public string $serviceName;
    public string $appointmentDate;
    public string $appointmentTime;
    public string $therapistName;
    public int $bookingId;
    public string $totalPrice;
    public string $salonAddress;

    public function __construct(Appointment $appointment)
    {
        $this->clientName      = $appointment->client?->name ?? 'Valued Client';
        $this->serviceName     = $appointment->service?->name ?? 'Spa Service';
        $this->appointmentDate = $appointment->datetime->format('l, F j, Y');
        $this->appointmentTime = $appointment->datetime->format('g:i A');
        $this->therapistName   = $appointment->therapist?->name ?? 'Our Specialist';
        $this->bookingId       = $appointment->id;
        $this->totalPrice      = $appointment->service ? '₱' . number_format((float)$appointment->service->price, 2) : 'N/A';
        $this->salonAddress    = config('app.salon_address', 'Cozy Blissful Spa & Wellness, Metro Manila');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 Your Booking is Approved – Cozy Blissful Spa',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking_approved',
        );
    }
}
