<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Template;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EventController extends Controller
{
    public function index(): Response
    {
        $events = Event::withCount('editions')
            ->orderBy('event_name')
            ->get()
            ->map(fn ($e) => [
                'id'             => $e->id,
                'event_name'     => $e->event_name,
                'logo'           => $e->logo,
                'initials'       => $e->initials,
                'editions_count' => $e->editions_count,
            ]);

        return Inertia::render('events/index', [
            'events' => $events,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('events/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'event_name' => ['required', 'string', 'max:255', 'unique:events,event_name'],
            'logo'       => ['nullable', 'image', 'max:2048'],
        ]);

        $payload = ['event_name' => $data['event_name']];

        if ($request->hasFile('logo')) {
            $payload['logo'] = $request->file('logo')->store('event-logos', 'public');
        }

        $event = Event::create($payload);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event created successfully.']);

        return to_route('events.show', $event);
    }

    public function show(Event $event): Response
    {
        $event->load(['editions' => function ($q) {
            $q->with('templates')->withCount('participants')->orderBy('year', 'desc');
        }]);

        return Inertia::render('events/show', [
            'event' => [
                'id'         => $event->id,
                'event_name' => $event->event_name,
                'logo'       => $event->logo,
                'initials'   => $event->initials,
                'editions'   => $event->editions->map(fn ($ed) => [
                    'id'                 => $ed->id,
                    'year'               => $ed->year,
                    'template_ids'       => $ed->templates->pluck('id'),
                    'template_names'     => $ed->templates->pluck('name'),
                    'participants_count' => $ed->participants_count,
                ]),
            ],
            'templates' => Template::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function edit(Event $event): Response
    {
        return Inertia::render('events/edit', [
            'event' => [
                'id'         => $event->id,
                'event_name' => $event->event_name,
                'logo'       => $event->logo,
                'initials'   => $event->initials,
            ],
        ]);
    }

    public function update(Request $request, Event $event): RedirectResponse
    {
        $data = $request->validate([
            'event_name'  => ['required', 'string', 'max:255', 'unique:events,event_name,' . $event->id],
            'logo'        => ['nullable', 'image', 'max:2048'],
            'remove_logo' => ['nullable', 'boolean'],
        ]);

        $event->event_name = $data['event_name'];

        if ($request->boolean('remove_logo') && $event->logo) {
            Storage::disk('public')->delete($event->logo);
            $event->logo = null;
        }

        if ($request->hasFile('logo')) {
            if ($event->logo) {
                Storage::disk('public')->delete($event->logo);
            }
            $event->logo = $request->file('logo')->store('event-logos', 'public');
        }

        $event->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event updated successfully.']);

        return to_route('events.show', $event);
    }

    public function destroy(Event $event): RedirectResponse
    {
        if ($event->logo) {
            Storage::disk('public')->delete($event->logo);
        }
        $event->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Event deleted successfully.']);

        return to_route('events.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'];

        Event::whereIn('id', $ids)->get()->each(function ($e) {
            if ($e->logo) {
                Storage::disk('public')->delete($e->logo);
            }
            $e->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => count($ids) . ' event(s) deleted.']);

        return to_route('events.index');
    }
}
