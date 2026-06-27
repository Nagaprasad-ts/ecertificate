<?php

namespace App\Http\Controllers;

use App\Http\Requests\ImportParticipantRequest;
use App\Models\Event;
use App\Models\EventEdition;
use App\Models\ImportBatch;
use App\Models\Participant;
use App\Models\Template;
use App\Services\ParticipantImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantImportController extends Controller implements HasMiddleware
{
    public function __construct(private readonly ParticipantImportService $importService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:participants.import', only: ['importForm', 'import', 'importResults', 'confirmImport', 'discardImport', 'reImport']),
            new Middleware('permission:batches.set-window', only: ['setEmailWindow']),
        ];
    }

    public function importForm(): Response
    {
        return Inertia::render('participants/import', [
            'events' => $this->eventOptions(),
            'templates' => Template::select('id', 'name', 'expected_columns')->get(),
        ]);
    }

    public function import(ImportParticipantRequest $request): RedirectResponse
    {
        /** @var EventEdition $edition */
        $edition = EventEdition::with('event')->findOrFail($request->event_edition_id);

        $result = $this->importService->processImport(
            $edition,
            (int) $request->template_id,
            $request->file('file'),
        );

        if (! empty($result['schemaErrors'])) {
            return back()->withErrors(['file' => implode(' ', $result['schemaErrors'])]);
        }

        return redirect()->route('participants.import.results', ['batchId' => $result['batchId']]);
    }

    public function importResults(string $batchId): Response
    {
        $batch = ImportBatch::with('event')->find($batchId);

        $pending = Participant::pending()
            ->forBatch($batchId)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'email' => $p->email,
                'usn' => $p->usn,
                'phone_no' => $p->phone_no,
                'certificate_no' => $p->certificate_no,
            ]);

        $failures = $batch?->failures ?? [];

        if (! $batch && $pending->isEmpty()) {
            return Inertia::render('participants/import-results', [
                'batchId' => $batchId,
                'imported' => [],
                'failures' => [],
                'notFound' => true,
                'batch' => null,
            ]);
        }

        $editionYear = null;
        if ($batch) {
            $firstPending = Participant::pending()->forBatch($batchId)->with('edition')->first();
            $editionYear = $firstPending?->edition?->year;
        }

        return Inertia::render('participants/import-results', [
            'batchId' => $batchId,
            'imported' => $pending->values()->all(),
            'failures' => $failures,
            'notFound' => false,
            'batch' => $batch ? [
                'event_name' => $batch->event?->event_name,
                'event_year' => $editionYear,
                'participant_count' => $batch->participant_count,
                'failed_count' => $batch->failed_count,
                'email_window_from' => $batch->email_window_from?->toIso8601String(),
                'email_window_to' => $batch->email_window_to?->toIso8601String(),
                'window_status' => $batch->windowStatus(),
            ] : null,
        ]);
    }

    public function reImport(Request $request, string $batchId): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $batch = ImportBatch::findOrFail($batchId);
        $result = $this->importService->processReImport($batch, $request->file('file'));

        if (! empty($result['schemaErrors'])) {
            return back()->withErrors(['file' => implode(' ', $result['schemaErrors'])]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'File re-uploaded. Review the updated results below.']);

        return redirect()->route('participants.import.results', ['batchId' => $batchId]);
    }

    public function setEmailWindow(Request $request, string $batchId): RedirectResponse
    {
        $data = $request->validate([
            'email_window_from' => ['required', 'date'],
            'email_window_to' => ['required', 'date', 'after:email_window_from'],
        ]);

        $batch = ImportBatch::findOrFail($batchId);

        if ($batch->failed_count > 0) {
            return back()->withErrors([
                'email_window_from' => "Cannot set a send window while {$batch->failed_count} row(s) have failed validation. Fix them first.",
            ]);
        }

        $this->importService->setEmailWindow($batch, $data['email_window_from'], $data['email_window_to']);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Email window saved. The confirm button will be active during that period.']);

        return redirect()->route('participants.import.results', ['batchId' => $batchId]);
    }

    public function confirmImport(string $batchId): RedirectResponse
    {
        $batch = ImportBatch::find($batchId, ['*']);

        if (! $batch instanceof ImportBatch) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Import batch not found.']);

            return to_route('participants.index');
        }

        if (! $batch->isEmailWindowActive()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Email sending is not authorized at this time. Contact your administrator.']);

            return redirect()->route('participants.import.results', ['batchId' => $batchId]);
        }

        $count = $this->importService->confirmAndDispatch($batch);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "{$count} certificate email(s) queued for delivery. Track progress in Email Logs.",
        ]);

        return to_route('participants.index');
    }

    public function discardImport(string $batchId): RedirectResponse
    {
        $count = $this->importService->discardBatch($batchId);

        Inertia::flash('toast', [
            'type' => 'info',
            'message' => "Import discarded. {$count} pending row(s) removed.",
        ]);

        return to_route('participants.index');
    }

    private function eventOptions(): Collection
    {
        return Event::with(['editions' => fn ($q) => $q->with('templates')->orderBy('year', 'desc')])
            ->whereNull('archived_at')
            ->orderBy('event_name')
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'event_name' => $e->event_name,
                'editions' => $e->editions->map(fn ($ed) => [
                    'id' => $ed->id,
                    'year' => $ed->year,
                    'template_ids' => $ed->templates->pluck('id')->values()->all(),
                ])->values()->all(),
            ]);
    }
}
