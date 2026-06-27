<?php

use App\Models\Event;
use App\Models\EventEdition;
use App\Models\Participant;
use App\Models\Template;

// ── Unauthenticated access ────────────────────────────────────────────────────

test('participant index redirects to login when unauthenticated', function () {
    $this->get(route('participants.index'))
        ->assertRedirect(route('login'));
});

test('participant create redirects to login when unauthenticated', function () {
    $this->get(route('participants.create'))
        ->assertRedirect(route('login'));
});

// ── Permission gating ─────────────────────────────────────────────────────────

test('participant index returns 403 without participants.read permission', function () {
    $this->actingAs(userWithPermission('some.other'))
        ->get(route('participants.index'))
        ->assertForbidden();
});

test('participant index returns 200 with participants.read permission', function () {
    $this->actingAs(userWithPermission('participants.read'))
        ->get(route('participants.index'))
        ->assertOk();
});

test('participant create returns 403 without participants.create permission', function () {
    $this->actingAs(userWithPermission('participants.read'))
        ->get(route('participants.create'))
        ->assertForbidden();
});

test('participant create returns 200 with participants.create permission', function () {
    $this->actingAs(userWithPermission('participants.create'))
        ->get(route('participants.create'))
        ->assertOk();
});

test('super admin can access participant index', function () {
    $this->actingAs(superAdmin())
        ->get(route('participants.index'))
        ->assertOk();
});

// ── Store ─────────────────────────────────────────────────────────────────────

test('participant store returns 403 without participants.create permission', function () {
    $this->actingAs(userWithPermission('participants.read'))
        ->post(route('participants.store'), [])
        ->assertForbidden();
});

test('participant store validates required fields', function () {
    $this->actingAs(userWithPermission('participants.create'))
        ->post(route('participants.store'), [])
        ->assertSessionHasErrors(['event_edition_id', 'template_id', 'name', 'email']);
});

test('participant store creates a participant and redirects', function () {
    $event    = Event::create(['event_name' => 'Store Fest']);
    $edition  = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $template = Template::create(['name' => 'T1', 'template_file' => 'basic.html']);
    $edition->templates()->attach($template->id);

    $this->actingAs(userWithPermission('participants.create'))
        ->post(route('participants.store'), [
            'event_edition_id' => $edition->id,
            'template_id'      => $template->id,
            'name'             => 'Eve Smith',
            'email'            => 'eve@example.com',
        ])
        ->assertRedirect(route('participants.index'));

    $this->assertDatabaseHas('participants', [
        'email'  => 'eve@example.com',
        'status' => 'active',
    ]);
});

// ── Destroy ───────────────────────────────────────────────────────────────────

test('participant destroy returns 403 without participants.delete permission', function () {
    $event    = Event::create(['event_name' => 'Del Fest']);
    $edition  = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $template = Template::create(['name' => 'T2', 'template_file' => 'basic.html']);
    $participant = Participant::create([
        'event_id'         => $event->id,
        'event_edition_id' => $edition->id,
        'template_id'      => $template->id,
        'name'             => 'Frank',
        'email'            => 'frank@example.com',
        'certificate_no'   => 'del-2026-'.uniqid(),
        'status'           => 'active',
    ]);

    $this->actingAs(userWithPermission('participants.read'))
        ->delete(route('participants.destroy', $participant))
        ->assertForbidden();
});

test('participant destroy deletes record and redirects', function () {
    $event    = Event::create(['event_name' => 'Del Fest 2']);
    $edition  = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $template = Template::create(['name' => 'T3', 'template_file' => 'basic.html']);
    $participant = Participant::create([
        'event_id'         => $event->id,
        'event_edition_id' => $edition->id,
        'template_id'      => $template->id,
        'name'             => 'Grace',
        'email'            => 'grace@example.com',
        'certificate_no'   => 'del2-2026-'.uniqid(),
        'status'           => 'active',
    ]);

    $this->actingAs(userWithPermission('participants.delete'))
        ->delete(route('participants.destroy', $participant))
        ->assertRedirect(route('participants.index'));

    $this->assertDatabaseMissing('participants', ['id' => $participant->id]);
});

// ── Bulk destroy ──────────────────────────────────────────────────────────────

test('bulk destroy deletes selected participants', function () {
    $event    = Event::create(['event_name' => 'Bulk Fest']);
    $edition  = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $template = Template::create(['name' => 'T4', 'template_file' => 'basic.html']);

    $p1 = Participant::create([
        'event_id' => $event->id, 'event_edition_id' => $edition->id, 'template_id' => $template->id,
        'name' => 'H1', 'email' => 'h1@example.com', 'certificate_no' => 'b1-'.uniqid(), 'status' => 'active',
    ]);
    $p2 = Participant::create([
        'event_id' => $event->id, 'event_edition_id' => $edition->id, 'template_id' => $template->id,
        'name' => 'H2', 'email' => 'h2@example.com', 'certificate_no' => 'b2-'.uniqid(), 'status' => 'active',
    ]);

    $this->actingAs(userWithPermission('participants.delete'))
        ->delete(route('participants.bulk-destroy'), ['ids' => [$p1->id, $p2->id]])
        ->assertRedirect(route('participants.index'));

    $this->assertDatabaseMissing('participants', ['id' => $p1->id]);
    $this->assertDatabaseMissing('participants', ['id' => $p2->id]);
});
