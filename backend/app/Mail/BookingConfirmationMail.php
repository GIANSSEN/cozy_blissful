<?php

namespace App\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class BookingConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $clientName;
    public string $serviceName;
    public string $serviceNames;
    /** @var array<int, array{name:string, price:string, duration:int}> */
    public array $services = [];
    public int $serviceCount = 1;
    public string $appointmentDate;
    public string $appointmentTime;
    public string $therapistName;
    public ?string $notes;
    public int $bookingId;
    /** @var int[] */
    public array $bookingIds = [];
    public string $bookingRefs = '';
    public string $totalPrice;
    public int $totalDuration = 0;
    public string $salonAddress;

    /**
     * @param Appointment|Collection|array $appointments Single row (backward compat)
     *   or a whole multi-service booking group — always renders ONE email.
     */
    public function __construct(Appointment|Collection|array $appointments)
    {
        $group = $appointments instanceof Appointment
            ? collect([$appointments])
            : collect($appointments);

        $group = $group->values();
        $first = $group->first();
        $first->loadMissing(['client', 'therapist', 'service']);

        $this->clientName = $first->client?->name ?? 'Valued Client';
        $this->appointmentDate = $first->datetime->format('l, F j, Y');
        $this->appointmentTime = $first->datetime->format('g:i A');
        $this->therapistName = $first->therapist?->name ?? 'Awaiting Assignment';
        $this->notes = $first->notes;
        $this->bookingId = $first->id;
        $this->bookingIds = $group->pluck('id')->all();
        $this->bookingRefs = $group->map(fn ($a) => '#CB-' . str_pad($a->id, 5, '0', STR_PAD_LEFT))->implode(', ');
        $this->salonAddress = config('app.salon_address', 'Cozy Blissful Spa & Wellness, Metro Manila');

        $total = 0;
        $duration = 0;
        $names = [];
        $rows = [];
        foreach ($group as $appt) {
            $appt->loadMissing('service');
            $svc = $appt->service;
            $price = $svc ? (float) $svc->price : 0;
            $dur = $svc ? (int) $svc->duration : 60;
            $total += $price;
            $duration += $dur;
            $names[] = $svc?->name ?? 'Spa Service';
            $rows[] = [
                'name' => $svc?->name ?? 'Spa Service',
                'price' => '₱' . number_format($price, 2),
                'duration' => $dur,
            ];
        }

        $this->services = $rows;
        $this->serviceCount = count($rows);
        $this->serviceNames = implode(', ', $names);
        // Keep legacy single-service variable working for old templates/subjects.
        $this->serviceName = $this->serviceCount === 1 ? $names[0] : $names[0] . ' (+' . ($this->serviceCount - 1) . ' more)';
        $this->totalPrice = '₱' . number_format($total, 2);
        $this->totalDuration = $duration;
    }

    public function envelope(): Envelope
    {
        $subject = $this->serviceCount > 1
            ? 'Booking Received (' . $this->bookingRefs . ') – ' . $this->serviceCount . ' services on ' . $this->appointmentDate
            : 'Booking Received (#CB-' . str_pad($this->bookingId, 5, '0', STR_PAD_LEFT) . ') – ' . $this->serviceName . ' on ' . $this->appointmentDate;

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.booking_confirmation');
    }
}
