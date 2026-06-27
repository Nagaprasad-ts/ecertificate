<?php

use App\Models\Event;

// ── Unauthenticated access ────────────────────────────────────────────────────

test('events index redirects to login when unauthenticated', function () {
    $this->get(route('events.index'))
        ->assertRedirect(route('login'));
});

// ── Permission gating ─────────────────────────────────────────────────────────

test('events index returns 403 without events.read permission', function () {
    $this->actingAs(userWithPermission('some.other'))
        ->get(route('events.index'))
        ->assertForbidden();
});

test('events index returns 200 with events.read permission', function () {
    $this->actingAs(userWithPermission('events.read'))
        ->get(route('events.index'))
        ->assertOk();
});

test('super admin can access events index', function () {
    $this->actingAs(superAdmin())
        ->get(route('events.index'))
        ->assertOk();
});

test('events create returns 403 without events.create permission', function () {
    $this->actingAs(userWithPermission('events.read'))
        ->get(route('events.create'))
        ->assertForbidden();
});

// ── Archive / Unarchive ───────────────────────────────────────────────────────

test('archive endpoint requires events.update permission', function () {
    $event = Event::create(['event_name' => 'Archivable']);

    $this->actingAs(userWithPermission('events.read'))
        ->post(route('events.archive', $event))
        ->assertForbidden();
});

test('archive sets archived_at on event', function () {
    $event = Event::create(['event_name' => 'Archive Me']);

    $this->actingAs(userWithPermission('events.update'))
        ->post(route('events.archive', $event))
        ->assertRedirect();

    expect($event->fresh()->archived_at)->not->toBeNull();
});

test('unarchive clears archived_at on event', function () {
    $event = Event::create(['event_name' => 'Unarchive Me', 'archived_at' => now()]);

    $this->actingAs(userWithPermission('events.update'))
        ->post(route('events.unarchive', $event))
        ->assertRedirect();

    expect($event->fresh()->archived_at)->toBeNull();
});

// ── Archived index ────────────────────────────────────────────────────────────

test('archived events index returns 200 with events.read permission', function () {
    $this->actingAs(userWithPermission('events.read'))
        ->get(route('events.archived'))
        ->assertOk();
});
