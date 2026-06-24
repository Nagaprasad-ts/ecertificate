<?php

namespace App\Http\Controllers;

use App\Imports\ParticipantsImport;
use App\Models\Event;
use App\Models\EventEdition;
use App\Models\ImportBatch;
use App\Models\Participant;
use App\Models\Template;
use App\Jobs\SendCertificateEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class ParticipantController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:participants.read',   only: ['index']),
            new Middleware('permission:participants.create', only: ['create', 'store']),
            new Middleware('permission:participants.update', only: ['edit', 'update']),
            new Middleware('permission:participants.delete', only: ['destroy', 'bulkDestroy', 'deleteAll']),
            new Middleware('permission:participants.import', only: ['importForm', 'import', 'importResults', 'confirmImport', 'discardImport', 'reImport']),
            // batches.view-all / batches.set-window / batches.delete are applied at the route level
        ];
    }

    /**
     * Eager-load edition.event so we can show "EventName — Year" on the index.
     */
    public function index(Request $request): Response
    {
        $participants = Participant::with('edition.event')
            ->active()
            // Specific edition filter takes precedence over event-level filter
            ->when($request->event_edition_id, fn ($q) => $q->where('event_edition_id', $request->event_edition_id))
            ->when($request->event_id && ! $request->event_edition_id,
                fn ($q) => $q->whereHas('edition', fn ($eq) => $eq->where('event_id', $request->event_id))
            )
            ->when($request->search, fn ($q) => $q->where(function ($inner) use ($request) {
                $inner->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('usn', 'like', "%{$request->search}%")
                    ->orWhere('phone_no', 'like', "%{$request->search}%");
            }))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        // Decorate each participant row with the display label
        $participants->getCollection()->transform(function ($p) {
            $eventName = $p->edition?->event?->event_name;
            $year      = $p->edition?->year;
            $p->setAttribute('edition_label', $eventName ? "{$eventName} — {$year}" : '—');
            return $p;
        });

        $canViewAllBatches = Auth::user()?->hasPermission('batches.view-all') ?? false;

        if ($canViewAllBatches) {
            $pendingBatches    = [];
            $pendingBatchCount = 0;
        } else {
            $pendingBatchCount = 0;
            $pendingBatches = ImportBatch::with('event')
                ->where('imported_by', Auth::id())
                ->whereIn('batch_id', function ($q) {
                    $q->select('batch_id')->from('participants')->where('status', 'pending')->whereNotNull('batch_id');
                })
                ->get()
                ->map(fn ($b) => [
                    'batch_id'          => $b->batch_id,
                    'event_name'        => $b->event?->event_name,
                    'count'             => $b->participant_count,
                    'imported_at'       => $b->created_at->toIso8601String(),
                    'email_window_from' => $b->email_window_from?->toIso8601String(),
                    'email_window_to'   => $b->email_window_to?->toIso8601String(),
                    'window_status'     => $b->windowStatus(),
                ]);
        }

        return Inertia::render('participants/index', [
            'participants'      => $participants,
            'events'            => $this->eventOptions(),
            'filters'           => $request->only('event_id', 'event_edition_id', 'search'),
            'pendingBatches'    => $pendingBatches,
            'pendingBatchCount' => $pendingBatchCount,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('participants/create', [
            'editions'  => $this->editionOptions(),
            'templates' => Template::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'event_edition_id' => ['required', 'exists:event_editions,id'],
            'template_id'      => ['required', 'exists:templates,id'],
            'name'             => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255'],
            'usn'              => ['nullable', 'string', 'max:100'],
            'phone_no'         => ['nullable', 'string', 'max:20'],
        ]);

        /** @var EventEdition $edition */
        $edition = EventEdition::with('event')->findOrFail($data['event_edition_id']);
        $data['event_id']       = $edition->event_id;
        $data['certificate_no'] = Participant::generateCertificateNo($edition);
        $data['status']         = 'active';

        Participant::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Participant added successfully.']);

        return to_route('participants.index');
    }

    public function edit(Participant $participant): Response
    {
        return Inertia::render('participants/edit', [
            'participant' => $participant,
            'editions'    => $this->editionOptions(),
            'templates'   => Template::select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Participant $participant): RedirectResponse
    {
        $data = $request->validate([
            'event_edition_id' => ['required', 'exists:event_editions,id'],
            'template_id'      => ['required', 'exists:templates,id'],
            'name'             => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255'],
            'usn'              => ['nullable', 'string', 'max:100'],
            'phone_no'         => ['nullable', 'string', 'max:20'],
        ]);

        $participant->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Participant updated successfully.']);

        return to_route('participants.index');
    }

    public function destroy(Participant $participant): RedirectResponse
    {
        $participant->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Participant deleted successfully.']);

        return to_route('participants.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'];
        Participant::destroy($ids);

        Inertia::flash('toast', ['type' => 'success', 'message' => count($ids) . ' participant(s) deleted.']);

        return to_route('participants.index');
    }

    public function deleteAll(Request $request): RedirectResponse
    {
        $query = Participant::active()
            ->when(
                $request->event_edition_id,
                fn ($q) => $q->where('event_edition_id', $request->event_edition_id),
            )
            ->when($request->search, fn ($q) => $q->where(function ($inner) use ($request) {
                $inner->where('name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%")
                    ->orWhere('usn', 'like', "%{$request->search}%")
                    ->orWhere('phone_no', 'like', "%{$request->search}%");
            }));

        $count = $query->count();
        $query->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$count} participant(s) deleted."]);

        return to_route('participants.index');
    }

    // ── Excel import ──────────────────────────────────────────────────────────

    public function importForm(): Response
    {
        return Inertia::render('participants/import', [
            'events'    => $this->eventOptions(activeOnly: true),
            'templates' => Template::select('id', 'name', 'expected_columns')->get(),
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'event_edition_id' => ['required', 'exists:event_editions,id'],
            'template_id'      => ['required', 'exists:templates,id'],
            'file'             => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        /** @var EventEdition $edition */
        $edition = EventEdition::with('event')->findOrFail($request->event_edition_id);
        $batchId = (string) Str::uuid();

        ImportBatch::create([
            'batch_id'         => $batchId,
            'event_id'         => $edition->event_id,
            'event_edition_id' => $edition->id,
            'template_id'      => (int) $request->template_id,
            'imported_by'      => Auth::id(),
        ]);

        $import = new ParticipantsImport(
            (int) $edition->id,
            (int) $request->template_id,
            $edition,
            $batchId,
        );

        /** @var \Illuminate\Http\UploadedFile $uploadedFile */
        $uploadedFile = $request->file('file');
        Excel::import($import, $uploadedFile);

        if (! empty($import->schemaErrors())) {
            ImportBatch::destroy($batchId);

            return back()->withErrors(['file' => implode(' ', $import->schemaErrors())]);
        }

        ImportBatch::findOrFail($batchId)->update([
            'participant_count' => $import->count(),
            'failed_count'      => count($import->failures()),
            'failures'          => $import->failures(),
        ]);

        return redirect()->route('participants.import.results', ['batchId' => $batchId]);
    }

    public function importResults(string $batchId): Response
    {
        $batch = ImportBatch::with('event')->find($batchId);

        $pending = Participant::pending()
            ->forBatch($batchId)
            ->get()
            ->map(fn ($p) => [
                'id'             => $p->id,
                'name'           => $p->name,
                'email'          => $p->email,
                'usn'            => $p->usn,
                'phone_no'       => $p->phone_no,
                'certificate_no' => $p->certificate_no,
            ]);

        $failures = $batch?->failures ?? [];

        if (! $batch && $pending->isEmpty()) {
            return Inertia::render('participants/import-results', [
                'batchId'  => $batchId,
                'imported' => [],
                'failures' => [],
                'notFound' => true,
                'batch'    => null,
            ]);
        }

        // Derive year from the first pending participant's edition (best-effort display)
        $editionYear = null;
        if ($batch) {
            $firstPending = Participant::pending()->forBatch($batchId)->with('edition')->first();
            $editionYear  = $firstPending?->edition?->year;
        }

        return Inertia::render('participants/import-results', [
            'batchId'  => $batchId,
            'imported' => $pending->values()->all(),
            'failures' => $failures,
            'notFound' => false,
            'batch'    => $batch ? [
                'event_name'         => $batch->event?->event_name,
                'event_year'         => $editionYear,
                'participant_count'  => $batch->participant_count,
                'failed_count'       => $batch->failed_count,
                'email_window_from'  => $batch->email_window_from?->toIso8601String(),
                'email_window_to'    => $batch->email_window_to?->toIso8601String(),
                'window_status'      => $batch->windowStatus(),
            ] : null,
        ]);
    }

    public function reImport(Request $request, string $batchId): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        $batch = ImportBatch::findOrFail($batchId);

        // Derive the edition from the existing pending rows (they all share the same edition)
        $editionId = Participant::pending()->forBatch($batchId)->value('event_edition_id');

        if (! $editionId) {
            return back()->withErrors(['file' => 'No pending rows found for this batch.']);
        }

        /** @var \App\Models\EventEdition $edition */
        $edition = \App\Models\EventEdition::with('event')->findOrFail($editionId);

        // Wipe all existing pending participants for this batch
        Participant::pending()->forBatch($batchId)->delete();

        // Re-run the import under the same batch_id
        $import = new ParticipantsImport(
            (int) $editionId,
            (int) $batch->template_id,
            $edition,
            $batchId,
        );

        /** @var \Illuminate\Http\UploadedFile $uploadedFile */
        $uploadedFile = $request->file('file');
        Excel::import($import, $uploadedFile);

        if (! empty($import->schemaErrors())) {
            return back()->withErrors(['file' => implode(' ', $import->schemaErrors())]);
        }

        $batch->update([
            'participant_count' => $import->count(),
            'failed_count'      => count($import->failures()),
            'failures'          => $import->failures(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'File re-uploaded. Review the updated results below.']);

        return redirect()->route('participants.import.results', ['batchId' => $batchId]);
    }

    public function setEmailWindow(Request $request, string $batchId): RedirectResponse
    {
        $data = $request->validate([
            'email_window_from' => ['required', 'date'],
            'email_window_to'   => ['required', 'date', 'after:email_window_from'],
        ]);

        $batch = ImportBatch::findOrFail($batchId);

        if ($batch->failed_count > 0) {
            return back()->withErrors([
                'email_window_from' => "Cannot set a send window while {$batch->failed_count} row(s) have failed validation. Fix them first.",
            ]);
        }

        $batch->update([
            'email_window_from' => $data['email_window_from'],
            'email_window_to'   => $data['email_window_to'],
        ]);

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

        $participants = Participant::pending()->forBatch($batchId)->get();
        $count        = $participants->count();

        // Flip to active immediately — each job handles sending + logging
        Participant::pending()->forBatch($batchId)->update(['status' => 'active']);

        foreach ($participants as $p) {
            SendCertificateEmail::dispatch($p, $batchId);
        }

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => "{$count} certificate email(s) queued for delivery. Track progress in Email Logs.",
        ]);

        return to_route('participants.index');
    }

    public function discardImport(string $batchId): RedirectResponse
    {
        $count = Participant::pending()->forBatch($batchId)->count('*');
        Participant::pending()->forBatch($batchId)->delete();
        ImportBatch::destroy($batchId);

        Inertia::flash('toast', [
            'type'    => 'info',
            'message' => "Import discarded. {$count} pending row(s) removed.",
        ]);

        return to_route('participants.index');
    }

    public function deleteBatch(string $batchId): RedirectResponse
    {
        $batch = ImportBatch::findOrFail($batchId);

        $count = Participant::forBatch($batchId)->count('*');
        Participant::forBatch($batchId)->delete();
        $batch->delete();

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => "Batch deleted. {$count} participant(s) removed.",
        ]);

        return to_route('admin.import-batches.index');
    }

    public function importBatchesAdmin(): Response
    {
        $batches = ImportBatch::with(['event', 'edition', 'template', 'importedBy'])
            ->latest()
            ->get()
            ->map(fn ($b) => [
                'batch_id'          => $b->batch_id,
                'event_name'        => $b->event?->event_name ?? '—',
                'event_year'        => $b->edition?->year,
                'template_name'     => $b->template?->name ?? '—',
                'imported_by_name'  => $b->importedBy?->name ?? '—',
                'imported_by_email' => $b->importedBy?->email ?? '—',
                'participant_count' => $b->participant_count,
                'failed_count'      => $b->failed_count,
                'imported_at'       => $b->created_at->toIso8601String(),
                'updated_at'        => $b->updated_at->toIso8601String(),
                'email_window_from' => $b->email_window_from?->toIso8601String(),
                'email_window_to'   => $b->email_window_to?->toIso8601String(),
                'window_status'     => $b->windowStatus(),
            ]);

        return Inertia::render('admin/import-batches/index', [
            'batches' => $batches,
        ]);
    }

    // ── Public certificate search ─────────────────────────────────────────────

    public function search(Request $request): Response
    {
        // Grouped structure: Event → Editions (id, year only — no template_ids needed here)
        $events = Event::with(['editions' => fn ($q) => $q->orderBy('year', 'desc')])
            ->orderBy('event_name')
            ->get()
            ->map(fn ($e) => [
                'id'         => $e->id,
                'event_name' => $e->event_name,
                'editions'   => $e->editions->map(fn ($ed) => [
                    'id'   => $ed->id,
                    'year' => $ed->year,
                ])->values(),
            ]);

        $results = null;

        if ($request->filled('event_edition_id') && $request->filled('query')) {
            $q         = trim((string) $request->input('query'));
            $queryType = $request->input('query_type', 'email');

            $column = match ($queryType) {
                'phone' => 'phone_no',
                'usn'   => 'usn',
                default => 'email',
            };

            $results = Participant::active()
                ->where('event_edition_id', $request->event_edition_id)
                ->where($column, $queryType === 'phone' ? 'like' : '=', $queryType === 'phone' ? "%{$q}%" : $q)
                ->with('edition.event')
                ->get()
                ->map(fn ($p) => [
                    'id'             => $p->id,
                    'name'           => $p->name,
                    'certificate_no' => $p->certificate_no,
                    'event_name'     => $p->edition?->event?->event_name,
                    'year'           => $p->edition?->year,
                ]);
        }

        return Inertia::render('participants/search', [
            'events'  => $events,
            'results' => $results,
            'filters' => $request->only('event_edition_id', 'query', 'query_type'),
        ]);
    }

    /**
     * Events grouped with their editions — used by the two-level filter on the index page.
     */
    private function eventOptions(bool $activeOnly = false): \Illuminate\Support\Collection
    {
        return Event::with(['editions' => fn ($q) => $q->with('templates')->orderBy('year', 'desc')])
            ->when($activeOnly, fn ($q) => $q->whereNull('archived_at'))
            ->orderBy('event_name')
            ->get()
            ->map(fn ($e) => [
                'id'         => $e->id,
                'event_name' => $e->event_name,
                'editions'   => $e->editions->map(fn ($ed) => [
                    'id'          => $ed->id,
                    'year'        => $ed->year,
                    'template_ids' => $ed->templates->pluck('id')->values()->all(),
                ])->values()->all(),
            ]);
    }

    /**
     * Flat list of editions with a display label, used by form dropdowns (create / edit / import).
     *
     * @return \Illuminate\Support\Collection<int, array{id:int, label:string, event_id:int, year:int, template_ids:int[]}>
     */
    private function editionOptions(): \Illuminate\Support\Collection
    {
        return EventEdition::with('event', 'templates')
            ->get()
            ->sortBy(fn ($e) => ($e->event?->event_name ?? '') . str_pad((string) $e->year, 4, '0', STR_PAD_LEFT))
            ->values()
            ->map(fn ($ed) => [
                'id'           => $ed->id,
                'label'        => ($ed->event?->event_name ?? '—') . ' — ' . $ed->year,
                'event_id'     => $ed->event_id,
                'year'         => $ed->year,
                'template_ids' => $ed->templates->pluck('id')->values()->all(),
            ]);
    }
}
