<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Certificate</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                    {{-- ── Header ─────────────────────────────────────────── --}}
                    <tr>
                        <td style="background-color:#1a1a2e;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
                            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);">
                                {{ $fromName }}
                            </p>
                            <h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.03em;">
                                🎓 Your Certificate is Ready
                            </h1>
                        </td>
                    </tr>

                    {{-- ── Body ──────────────────────────────────────────────--}}
                    <tr>
                        <td style="background-color:#ffffff;padding:40px;">

                            <p style="margin:0 0 24px 0;font-size:16px;color:#374151;">
                                Dear <strong>{{ $participantName }}</strong>,
                            </p>

                            <p style="margin:0 0 24px 0;font-size:15px;color:#6b7280;line-height:1.7;">
                                Congratulations! Your certificate for
                                <strong style="color:#1a1a2e;">{{ $eventLabel }}</strong>
                                has been issued. Click the button below to view and download it.
                            </p>

                            {{-- Certificate details card --}}
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:32px;">
                                <tr>
                                    <td style="padding:20px 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:6px 0;border-bottom:1px solid #e5e7eb;">
                                                    <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Participant</span><br/>
                                                    <span style="font-size:15px;font-weight:600;color:#111827;">{{ $participantName }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;border-bottom:1px solid #e5e7eb;">
                                                    <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Event</span><br/>
                                                    <span style="font-size:15px;font-weight:600;color:#111827;">{{ $eventLabel }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:6px 0;">
                                                    <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.05em;">Certificate No.</span><br/>
                                                    <span style="font-size:13px;font-weight:600;color:#111827;font-family:monospace;">{{ $certificateNo }}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            {{-- CTA button --}}
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $certificateUrl }}"
                                            style="display:inline-block;background-color:#1a1a2e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 40px;border-radius:8px;letter-spacing:0.03em;">
                                            View &amp; Download Certificate →
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">
                                Or copy this link into your browser:<br/>
                                <a href="{{ $certificateUrl }}" style="color:#6366f1;word-break:break-all;">{{ $certificateUrl }}</a>
                            </p>
                        </td>
                    </tr>

                    {{-- ── Footer ─────────────────────────────────────────── --}}
                    <tr>
                        <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
                            <p style="margin:0 0 4px 0;font-size:13px;font-weight:600;color:#374151;">
                                {{ $fromName }}
                            </p>
                            <p style="margin:0 0 4px 0;font-size:12px;color:#9ca3af;">
                                This is an automated email — please do not reply.
                            </p>
                            <p style="margin:0;font-size:12px;color:#9ca3af;">
                                Replies to this address are not monitored.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>
