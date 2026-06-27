<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreParticipantRequest;
use App\Models\Event;
use App\Models\EventEdition;
use App\Models\ImportBatch;
use App\Models\Participant;
use App\Models\Template;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ParticipantController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:participants.read', only: ['index']),
            new Middleware('permission:participants.create', only: ['create', 'store']),
            new Middleware('permission:participants.update', only: ['edit', 'update']),
            new Middleware('permission:participants.delete', only: ['destroy', 'bulkDestroy', 'deleteAll']),
        ];
    }

    public function index(Request $request): Response
    {
        $participants = Participant::with('edition.event')
            ->active()
            ->when($request->event_edition_id, fn ($q) => $q->where('event_edition_id', $request->event_edition_id))
            ->when(
                $request->event_id && ! $request->event_edition_id,
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

        $participants->getCollection()->transform(function ($p) {
            $eventName = $p->edition?->event?->event_name;
            $year = $p->edition?->year;
            $p->setAttribute('edition_label', $eventName ? "{$eventName} — {$year}" : '—');

            return $p;
        });

        $canViewAllBatches = Auth::user()?->hasPermission('batches.view-all') ?? false;

        $pendingBatches = [];
        $pendingBatchCount = 0;

        if (! $canViewAllBatches) {
            $pendingBatches = ImportBatch::with('event')
                ->where('imported_by', Auth::id())
                ->whereIn('batch_id', function ($q) {
                    $q->select('batch_id')->from('participants')->where('status', 'pending')->whereNotNull('batch_id');
                })
                ->get()
                ->map(fn ($b) => [
                    'batch_id' => $b->batch_id,
                    'event_name' => $b->event?->event_name,
                    'count' => $b->participant_count,
                    'imported_at' => $b->created_at->toIso8601String(),
                    'email_window_from' => $b->email_window_from?->toIso8601String(),
                    'email_window_to' => $b->email_window_to?->toIso8601String(),
                    'window_status' => $b->windowStatus(),
                ]);
        }

        return Inertia::render('participants/index', [
            'participants' => $participants,
            'events' => $this->eventOptions(),
            'filters' => $request->only('event_id', 'event_edition_id', 'search'),
            'pendingBatches' => $pendingBatches,
            'pendingBatchCount' => $pendingBatchCount,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('participants/create', [
            'editions' => $this->editionOptions(),
            'templates' => Template::select('id', 'name')->get(),
        ]);
    }

    public function store(StoreParticipantRequest $request): RedirectResponse
    {
        $data = $request->validated();

        /** @var EventEdition $edition */
        $edition = EventEdition::with('event')->findOrFail($data['event_edition_id']);
        $data['event_id'] = $edition->event_id;
        $data['certificate_no'] = Participant::generateCertificateNo($edition);
        $data['status'] = 'active';

        Participant::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Participant added successfully.']);

        return to_route('participants.index');
    }

    public function edit(Participant $participant): Response
    {
        return Inertia::render('participants/edit', [
            'participant' => $participant,
            'editions' => $this->editionOptions(),
            'templates' => Template::select('id', 'name')->get(),
        ]);
    }

    public function update(StoreParticipantRequest $request, Participant $participant): RedirectResponse
    {
        $participant->update($request->validated());

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

        Inertia::flash('toast', ['type' => 'success', 'message' => count($ids).' participant(s) deleted.']);

        return to_route('participants.index');
    }

    public function deleteAll(Request $request): RedirectResponse
    {
        $query = Participant::active()
            ->when($request->event_edition_id, fn ($q) => $q->where('event_edition_id', $request->event_edition_id))
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

    private function eventOptions(): Collection
    {
        return Event::with(['editions' => fn ($q) => $q->with('templates')->orderBy('year', 'desc')])
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

    /**
     * @return Collection<int, array{id:int, label:string, event_id:int, year:int, template_ids:int[]}>
     */
    private function editionOptions(): Collection
    {
        return EventEdition::with('event', 'templates')
            ->get()
            ->sortBy(fn ($e) => ($e->event?->event_name ?? '').str_pad((string) $e->year, 4, '0', STR_PAD_LEFT))
            ->values()
            ->map(fn ($ed) => [
                'id' => $ed->id,
                'label' => ($ed->event?->event_name ?? '—').' — '.$ed->year,
                'event_id' => $ed->event_id,
                'year' => $ed->year,
                'template_ids' => $ed->templates->pluck('id')->values()->all(),
            ]);
    }
}
