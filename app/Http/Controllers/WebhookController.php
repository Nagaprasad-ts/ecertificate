<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use App\Notifications\EmailBounced;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle AWS SNS → SES bounce/complaint notifications.
     *
     * AWS setup:
     *  1. SES Console → Configuration Sets → Event Destinations → Add SNS destination (Bounce + Complaint)
     *  2. SNS Console → Create Topic (Standard) → Subscribe with HTTPS endpoint pointing here
     *  3. This endpoint auto-confirms the subscription on first call.
     */
    public function sesNotification(Request $request): JsonResponse
    {
        $messageType = $request->header('x-amz-sns-message-type');
        $body        = json_decode($request->getContent(), true);

        Log::info('SES webhook received', ['type' => $messageType]);

        if (! $body) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        // Auto-confirm the SNS subscription
        if ($messageType === 'SubscriptionConfirmation') {
            Http::get($body['SubscribeURL']);
            Log::info('SES bounce webhook: SNS subscription confirmed.');
            return response()->json(['confirmed' => true]);
        }

        if ($messageType !== 'Notification') {
            Log::info('SES webhook: ignoring message type', ['type' => $messageType]);
            return response()->json(['ok' => true]);
        }

        $message = json_decode($body['Message'] ?? '{}', true);


        $notifType = $message['notificationType'] ?? $message['eventType'] ?? '';

        if ($notifType !== 'Bounce') {
                return response()->json(['ok' => true]);
        }

        $bounce = $message['bounce'] ?? $message['bounce'] ?? null;

        if (! $bounce) {
            Log::warning('SES webhook: bounce payload missing', ['message_keys' => array_keys($message)]);
            return response()->json(['ok' => true]);
        }
        $recipients = $bounce['bouncedRecipients'] ?? [];
        $reason     = $bounce['bounceSubType'] ?? $bounce['bounceType'] ?? 'Unknown';

        foreach ($recipients as $recipient) {
            $email = $recipient['emailAddress'] ?? null;

            if (! $email) {
                continue;
            }

            $diagnosticCode = $recipient['diagnosticCode'] ?? $reason;

            $log = EmailLog::where('to_address', $email)
                ->latest('sent_at')
                ->first();

            if (! $log) {
                Log::warning("SES bounce webhook: no email log found for {$email}");
                continue;
            }

            $log->update([
                'status'        => 'bounced',
                'bounced_at'    => now(),
                'error_message' => $diagnosticCode,
            ]);

            $log->load('sender');
            $notifiable = $log->sender ?? \App\Models\User::find(1);
            $notifiable?->notify(new EmailBounced($log));

            Log::info("SES bounce webhook: marked email log #{$log->id} ({$email}) as bounced, notified user #{$notifiable?->id}.");
        }

        return response()->json(['ok' => true]);
    }
}
