<?php

namespace App\Http\Controllers;

use App\Imports\ParticipantsImport;
use App\Models\EventEdition;
use App\Models\ImportBatch;
use App\Models\Participant;
use App\Models\Template;
use App\Services\GraphMailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class ParticipantController extends Controller
{
    /**
     * Eager-load edition.event so we can show "EventName — Year" on the index.
     */
    public function index(Request $request): Response
    {
        $participants = Participant::with('edition.event')
            ->active()
            ->when(
                $request->event_edition_id,
                fn ($q) => $q->where('event_edition_id', $request->event_edition_id),
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
            'editions'          => $this->editionOptions(),
            'filters'           => $request->only('event_edition_id', 'search'),
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
        Participant::whereIn('id', $ids)->delete();

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
            'editions'  => $this->editionOptions(),
            'templates' => Template::select('id', 'name')->get(),
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
            'batch_id'    => $batchId,
            'event_id'    => $edition->event_id,
            'template_id' => (int) $request->template_id,
            'imported_by' => Auth::id(),
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

        ImportBatch::where('batch_id', $batchId)->update([
            'participant_count' => $import->count(),
            'failed_count'      => count($import->failures()),
        ]);

        session()->flash("import_failures_{$batchId}", $import->failures());

        return redirect()->route('participants.import.results', ['batchId' => $batchId]);
    }

    public function importResults(string $batchId): Response
    {
        $batch = ImportBatch::with('event')->find($batchId);

        $pending = Participant::pending()
            ->where('batch_id', $batchId)
            ->get()
            ->map(fn ($p) => [
                'id'             => $p->id,
                'name'           => $p->name,
                'email'          => $p->email,
                'usn'            => $p->usn,
                'phone_no'       => $p->phone_no,
                'certificate_no' => $p->certificate_no,
            ]);

        $failures = session("import_failures_{$batchId}", []);

        if (! $batch && $pending->isEmpty() && empty($failures)) {
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
            $firstPending = Participant::pending()->where('batch_id', $batchId)->with('edition')->first();
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

    public function setEmailWindow(Request $request, string $batchId): RedirectResponse
    {
        $data = $request->validate([
            'email_window_from' => ['required', 'date'],
            'email_window_to'   => ['required', 'date', 'after:email_window_from'],
        ]);

        $batch = ImportBatch::findOrFail($batchId);
        $batch->update([
            'email_window_from' => $data['email_window_from'],
            'email_window_to'   => $data['email_window_to'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Email window saved. The confirm button will be active during that period.']);

        return redirect()->route('participants.import.results', ['batchId' => $batchId]);
    }

    public function confirmImport(string $batchId, GraphMailService $mailer): RedirectResponse
    {
        set_time_limit(300);

        /** @var ImportBatch|null $batch */
        $batch = ImportBatch::find($batchId);

        if (! $batch instanceof ImportBatch) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Import batch not found.']);
            return to_route('participants.index');
        }

        if (! $batch->isEmailWindowActive()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Email sending is not authorized at this time. Contact your administrator.']);
            return redirect()->route('participants.import.results', ['batchId' => $batchId]);
        }

        $participants = Participant::pending()
            ->where('batch_id', $batchId)
            ->with('edition.event')
            ->get();

        $count = $participants->count();

        $messages = $participants->map(function ($p) {
            $eventName      = $p->edition?->event?->event_name ?? 'Event';
            $year           = $p->edition?->year ?? '';
            $eventLabel     = trim("{$eventName} {$year}");
            $certificateUrl = url('/certificate/' . $p->certificate_no);

            $html = view('emails.certificate-issued', [
                'participantName' => $p->name,
                'eventLabel'      => $eventLabel,
                'certificateNo'   => $p->certificate_no,
                'certificateUrl'  => $certificateUrl,
                'fromName'        => config('mail.from.name'),
            ])->render();

            return [
                'to_address' => $p->email,
                'to_name'    => $p->name,
                'subject'    => "Your Certificate — {$eventLabel}",
                'html'       => $html,
            ];
        })->all();

        try {
            $mailer->sendBatch($messages);
        } catch (\Throwable $e) {
            Inertia::flash('toast', [
                'type'    => 'error',
                'message' => 'Email sending failed: ' . $e->getMessage(),
            ]);

            return redirect()->route('participants.import.results', ['batchId' => $batchId]);
        }

        Participant::pending()
            ->where('batch_id', $batchId)
            ->update(['status' => 'active']);

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => "{$count} certificate(s) sent successfully.",
        ]);

        return to_route('participants.index');
    }

    public function discardImport(string $batchId): RedirectResponse
    {
        $count = Participant::pending()->where('batch_id', $batchId)->count();
        Participant::pending()->where('batch_id', $batchId)->delete();
        ImportBatch::where('batch_id', $batchId)->delete();

        Inertia::flash('toast', [
            'type'    => 'info',
            'message' => "Import discarded. {$count} pending row(s) removed.",
        ]);

        return to_route('participants.index');
    }

    public function deleteBatch(string $batchId): RedirectResponse
    {
        $batch = ImportBatch::where('batch_id', $batchId)->firstOrFail();

        $count = Participant::where('batch_id', $batchId)->count();
        Participant::where('batch_id', $batchId)->delete();
        $batch->delete();

        Inertia::flash('toast', [
            'type'    => 'success',
            'message' => "Batch deleted. {$count} participant(s) removed.",
        ]);

        return to_route('admin.import-batches.index');
    }

    public function importBatchesAdmin(): Response
    {
        $batches = ImportBatch::with(['event', 'importedBy'])
            ->whereIn('batch_id', function ($q) {
                $q->select('batch_id')->from('participants')->where('status', 'pending')->whereNotNull('batch_id');
            })
            ->latest()
            ->get()
            ->map(fn ($b) => [
                'batch_id'          => $b->batch_id,
                'event_name'        => $b->event?->event_name,
                'event_year'        => null, // year now lives on edition; left null for back-compat
                'imported_by_name'  => $b->importedBy?->name,
                'imported_by_email' => $b->importedBy?->email,
                'participant_count' => $b->participant_count,
                'failed_count'      => $b->failed_count,
                'imported_at'       => $b->created_at->toIso8601String(),
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
        $editions = $this->editionOptions();
        $results  = null;

        if ($request->filled('event_edition_id') && $request->filled('query')) {
            $q          = trim((string) $request->input('query'));
            $digitsOnly = preg_replace('/\D/', '', $q);

            $results = Participant::active()
                ->where('event_edition_id', $request->event_edition_id)
                ->where(function ($inner) use ($q, $digitsOnly) {
                    $inner->where('email', $q)->orWhere('usn', $q);
                    $inner->orWhere('phone_no', 'like', "%{$q}%");
                    if ($digitsOnly !== '' && $digitsOnly !== $q) {
                        $inner->orWhere('phone_no', 'like', "%{$digitsOnly}%");
                    }
                })
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
            'editions' => $editions,
            'results'  => $results,
            'filters'  => $request->only('event_edition_id', 'query'),
        ]);
    }

    /**
     * Flat list of editions with a display label, used by every dropdown.
     *
     * @return \Illuminate\Support\Collection<int, array{id:int, label:string, event_id:int, year:int, template_id:int|null}>
     */
    private function editionOptions()
    {
        return EventEdition::with('event', 'templates')
            ->get()
            ->sortBy(fn ($e) => ($e->event?->event_name ?? '') . str_pad((string) $e->year, 4, '0', STR_PAD_LEFT))
            ->values()
            ->map(fn ($ed) => [
                'id'          => $ed->id,
                'label'       => ($ed->event?->event_name ?? '—') . ' — ' . $ed->year,
                'event_id'    => $ed->event_id,
                'year'        => $ed->year,
                'template_ids' => $ed->templates->pluck('id')->values()->all(),
            ]);
    }
}
