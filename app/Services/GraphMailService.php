<?php

namespace App\Services;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GraphMailService
{
    /**
     * Send a single HTML email via Microsoft Graph API.
     *
     * @param  array{to_address: string, to_name: string, subject: string, html: string}  $message
     */
    public function send(array $message): void
    {
        $this->sendBatch([$message]);
    }

    /**
     * Send multiple emails efficiently using the Graph $batch endpoint.
     * Graph allows up to 20 requests per batch call — we chunk automatically.
     *
     * @param  array<int, array{to_address: string, to_name: string, subject: string, html: string}>  $messages
     */
    public function sendBatch(array $messages): void
    {
        if (empty($messages)) {
            return;
        }

        $token    = $this->accessToken();
        $fromAddr = config('mail.from.address');
        $fromName = config('mail.from.name');

        foreach (array_chunk($messages, 20) as $chunk) {
            $requests = [];

            foreach ($chunk as $i => $msg) {
                $requests[] = [
                    'id'      => (string) ($i + 1),
                    'method'  => 'POST',
                    'url'     => "/users/{$fromAddr}/sendMail",
                    'headers' => ['Content-Type' => 'application/json'],
                    'body'    => [
                        'message' => [
                            'subject' => $msg['subject'],
                            'body'    => [
                                'contentType' => 'HTML',
                                'content'     => $msg['html'],
                            ],
                            'from' => [
                                'emailAddress' => [
                                    'address' => $fromAddr,
                                    'name'    => $fromName,
                                ],
                            ],
                            // replyTo points back to the same no-reply address
                            // so any "Reply" in the recipient's email client is
                            // clearly marked as a no-reply mailbox
                            'replyTo' => [
                                [
                                    'emailAddress' => [
                                        'address' => $fromAddr,
                                        'name'    => 'No Reply — ' . $fromName,
                                    ],
                                ],
                            ],
                            'toRecipients' => [
                                [
                                    'emailAddress' => [
                                        'address' => $msg['to_address'],
                                        'name'    => $msg['to_name'],
                                    ],
                                ],
                            ],
                        ],
                        'saveToSentItems' => false,
                    ],
                ];
            }

            $response = Http::withToken($token)
                ->timeout(30)
                ->post('https://graph.microsoft.com/v1.0/$batch', [
                    'requests' => $requests,
                ]);

            if ($response->failed()) {
                Log::error('Graph batch sendMail failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);

                throw new RuntimeException(
                    "Graph API batch failed [{$response->status()}]: " . $response->body()
                );
            }

            // Check per-message results — batch HTTP 200 doesn't mean all messages succeeded
            $responses = $response->json('responses', []);
            foreach ($responses as $r) {
                if (($r['status'] ?? 200) >= 400) {
                    $code    = $r['body']['error']['code']    ?? 'Unknown';
                    $message = $r['body']['error']['message'] ?? 'Unknown error';

                    Log::error('Graph batch: individual sendMail failed', [
                        'id'     => $r['id'] ?? '?',
                        'status' => $r['status'],
                        'code'   => $code,
                        'body'   => $r['body'] ?? null,
                    ]);

                    throw new RuntimeException(
                        "Graph sendMail failed [{$code}]: {$message}"
                    );
                }
            }
        }
    }

    /**
     * Fetch and cache the client-credentials access token (expires ~1 h; cached 55 min).
     */
    private function accessToken(): string
    {
        return Cache::remember('graph_mail_token', 3300, function () {
            $tenantId = config('services.azure.tenant_id');

            $response = Http::asForm()
                ->timeout(10)
                ->post("https://login.microsoftonline.com/{$tenantId}/oauth2/v2.0/token", [
                    'client_id'     => config('services.azure.client_id'),
                    'client_secret' => config('services.azure.client_secret'),
                    'scope'         => 'https://graph.microsoft.com/.default',
                    'grant_type'    => 'client_credentials',
                ]);

            if ($response->failed() || ! $response->json('access_token')) {
                throw new RuntimeException(
                    'Failed to obtain Azure access token: ' . $response->body()
                );
            }

            return $response->json('access_token');
        });
    }
}
