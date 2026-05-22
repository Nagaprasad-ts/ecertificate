<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventEdition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EventEditionController extends Controller
{
    public function store(Request $request, Event $event): RedirectResponse
    {
        $data = $request->validate([
            'year' => [
                'required', 'integer', 'min:2000', 'max:2100',
                Rule::unique('event_editions', 'year')->where(fn ($q) => $q->where('event_id', $event->id)),
            ],
            'template_ids'   => ['nullable', 'array'],
            'template_ids.*' => ['exists:templates,id'],
        ]);

        $edition = $event->editions()->create(['year' => $data['year']]);

        if (!empty($data['template_ids'])) {
            $edition->templates()->sync($data['template_ids']);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "Edition {$data['year']} added."]);

        return to_route('events.show', $event);
    }

    public function update(Request $request, Event $event, EventEdition $edition): RedirectResponse
    {
        abort_unless($edition->event_id === $event->id, 404);

        $data = $request->validate([
            'template_ids'   => ['nullable', 'array'],
            'template_ids.*' => ['exists:templates,id'],
        ]);

        $edition->templates()->sync($data['template_ids'] ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => "Edition {$edition->year} updated."]);

        return to_route('events.show', $event);
    }

    public function destroy(Event $event, EventEdition $edition): RedirectResponse
    {
        abort_unless($edition->event_id === $event->id, 404);

        $edition->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Edition deleted.']);

        return to_route('events.show', $event);
    }
}
