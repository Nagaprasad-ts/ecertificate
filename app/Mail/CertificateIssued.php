<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;

class CertificateIssued extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $participantName,
        public readonly string $eventLabel,
        public readonly string $certificateNo,
        public readonly string $certificateUrl,
    ) {}

    public function headers(): Headers
    {
        $configSet = config('services.ses.options.ConfigurationSetName');

        return new Headers(
            text: $configSet ? ['X-SES-CONFIGURATION-SET' => $configSet] : [],
        );
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Your Certificate — {$this->eventLabel}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.certificate-issued',
            with: [
                'participantName' => $this->participantName,
                'eventLabel'      => $this->eventLabel,
                'certificateNo'   => $this->certificateNo,
                'certificateUrl'  => $this->certificateUrl,
                'fromName'        => config('mail.from.name'),
            ],
        );
    }
}
