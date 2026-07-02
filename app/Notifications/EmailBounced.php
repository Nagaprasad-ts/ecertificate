<?php

namespace App\Notifications;

use App\Models\EmailLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class EmailBounced extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly EmailLog $log) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $sentByName = $this->log->sender?->name;
        $isSender   = $notifiable->id === $this->log->sent_by;

        $message = $isSender
            ? "Email to {$this->log->to_name} ({$this->log->to_address}) was bounced."
            : "Email to {$this->log->to_name} ({$this->log->to_address}) sent by {$sentByName} was bounced.";

        return [
            'message'      => $message,
            'reason'       => $this->log->error_message,
            'email_log_id' => $this->log->id,
            'to_address'   => $this->log->to_address,
            'to_name'      => $this->log->to_name,
            'subject'      => $this->log->subject,
            'sent_by_name' => $sentByName,
        ];
    }
}
