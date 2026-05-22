<?php

namespace App\Http\Controllers;

use App\Models\Participant;
use App\Models\Signature;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    // Public certificate page — accessed via /certificate/{certificate_no}
    public function show(string $certificateNo): Response
    {
        $participant = Participant::where('certificate_no', $certificateNo)
            ->where('status', 'active')   // pending certificates are not publicly accessible
            ->with('template', 'edition.event')
            ->firstOrFail();

        return Inertia::render('certificates/show', [
            'templateFile' => $participant->template->template_file,
            'participant'  => $participant->only('name', 'certificate_no', 'data'),
            'event'        => [
                'event_name' => $participant->edition?->event?->event_name ?? '',
                'year'       => $participant->edition?->year ?? now()->year,
            ],
            'logos'      => [],
            'signatures' => Signature::orderByDesc('id')->take(3)->get(),
        ]);
    }

    // Preview for a real participant certificate (auth)
    public function preview(Participant $participant): Response
    {
        $participant->load('template', 'edition.event');

        return Inertia::render('certificates/preview', [
            'templateFile' => $participant->template->template_file,
            'participant'  => $participant->only('name', 'certificate_no', 'data'),
            'event'        => [
                'event_name' => $participant->edition?->event?->event_name ?? '',
                'year'       => $participant->edition?->year ?? now()->year,
            ],
            'logos'      => [],
            'signatures' => Signature::orderByDesc('id')->take(3)->get(),
        ]);
    }


    // Super-admin template preview with sample data
    public function templatePreview(Request $request, Template $template): Response
    {
        abort_unless(
            $request->user()->role?->slug === 'super_admin',
            403,
            'Only super admins can preview templates.'
        );

        return Inertia::render('certificates/preview', [
            'templateFile' => $template->template_file,
            'participant'  => [
                'name'           => 'Jane Doe',
                'certificate_no' => 'sample-' . now()->year . '-abc123',
                'data'           => null,
            ],
            'event'      => [
                'event_name' => 'Sample Event',
                'year'       => now()->year,
            ],
            'logos'      => [],
            'signatures' => Signature::latest()->take(3)->get(),
        ]);
    }
}
