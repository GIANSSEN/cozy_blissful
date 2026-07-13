<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $clientName;

    public function __construct(string $clientName)
    {
        $this->clientName = $clientName;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🌿 Welcome to Cozy Blissful – Your Wellness Journey Begins!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome',
            with: [
                'clientName' => $this->clientName,
            ],
        );
    }
}
