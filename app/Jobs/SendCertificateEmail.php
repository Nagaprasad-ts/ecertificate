<?php

namespace App\Jobs;

use App\Mail\CertificateIssued;
use App\Models\EmailLog;
use App\Models\Participant;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendCertificateEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $backoff = 60;

    public function __construct(
        public readonly Participant $participant,
        public readonly string $batchId,
    ) {}

    public function handle(): void
    {
        $this->participant->loadMissing('edition.event');

        $eventLabel     = trim(($this->participant->edition?->event?->event_name ?? 'Event') . ' ' . ($this->participant->edition?->year ?? ''));
        $certificateUrl = url('/certificate/' . $this->participant->certificate_no);
        $subject        = "Your Certificate — {$eventLabel}";

        Mail::to($this->participant->email, $this->participant->name)
            ->send(new CertificateIssued(
                participantName: $this->participant->name,
                eventLabel:      $eventLabel,
                certificateNo:   $this->participant->certificate_no,
                certificateUrl:  $certificateUrl,
            ));

        EmailLog::create([
            'batch_id'         => $this->batchId,
            'event_id'         => $this->participant->event_id,
            'event_edition_id' => $this->participant->event_edition_id,
            'participant_id'   => $this->participant->id,
            'to_address'       => $this->participant->email,
            'to_name'          => $this->participant->name,
            'subject'          => $subject,
            'status'           => 'sent',
            'sent_at'          => now(),
        ]);
    }

    public function failed(\Throwable $e): void
    {
        $this->participant->loadMissing('edition.event');

        $eventLabel = trim(($this->participant->edition?->event?->event_name ?? 'Event') . ' ' . ($this->participant->edition?->year ?? ''));

        EmailLog::create([
            'batch_id'         => $this->batchId,
            'event_id'         => $this->participant->event_id,
            'event_edition_id' => $this->participant->event_edition_id,
            'participant_id'   => $this->participant->id,
            'to_address'       => $this->participant->email,
            'to_name'          => $this->participant->name,
            'subject'          => "Your Certificate — {$eventLabel}",
            'status'           => 'failed',
            'error_message'    => $e->getMessage(),
            'sent_at'          => now(),
        ]);
    }
}
