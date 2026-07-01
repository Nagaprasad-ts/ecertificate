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
            return response()->json(['ok' => true]);
        }

        $message = json_decode($body['Message'] ?? '{}', true);

        if (($message['notificationType'] ?? '') !== 'Bounce') {
            return response()->json(['ok' => true]);
        }

        $bounce     = $message['bounce'];
        $recipients = $bounce['bouncedRecipients'] ?? [];
        $reason     = $bounce['bounceSubType'] ?? $bounce['bounceType'] ?? 'Unknown';

        foreach ($recipients as $recipient) {
            $email = $recipient['emailAddress'] ?? null;

            if (! $email) {
                continue;
            }

            $diagnosticCode = $recipient['diagnosticCode'] ?? $reason;

            $log = EmailLog::where('to_address', $email)
                ->whereIn('status', ['sent'])
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

            if ($log->sent_by) {
                $log->load('sender');
                $log->sender?->notify(new EmailBounced($log));
            }

            Log::info("SES bounce webhook: marked email log #{$log->id} ({$email}) as bounced.");
        }

        return response()->json(['ok' => true]);
    }
}
