<?php

use App\Models\Event;
use App\Models\EventEdition;
use App\Models\Participant;
use App\Models\Template;

// ── Public routes ─────────────────────────────────────────────────────────────

test('certificate search page is publicly accessible', function () {
    $this->get(route('certificate.search'))
        ->assertOk();
});

test('certificate show returns 404 for unknown certificate number', function () {
    $this->get(route('certificate.show', 'nonexistent-abc123'))
        ->assertNotFound();
});

test('certificate data endpoint returns 404 for unknown certificate number', function () {
    $this->getJson(route('certificate.data', 'nonexistent-abc123'))
        ->assertNotFound();
});

test('certificate data endpoint returns JSON for a valid active certificate', function () {
    $event    = Event::create(['event_name' => 'Demo Fest']);
    $edition  = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $template = Template::create(['name' => 'Basic', 'template_file' => 'basic.html']);

    $certNo = 'demo-fest-2026-aabbcc';
    Participant::create([
        'event_id'         => $event->id,
        'event_edition_id' => $edition->id,
        'template_id'      => $template->id,
        'name'             => 'Alice',
        'email'            => 'alice@example.com',
        'certificate_no'   => $certNo,
        'status'           => 'active',
    ]);

    $this->getJson(route('certificate.data', $certNo))
        ->assertOk()
        ->assertJsonStructure(['templateFile', 'participant', 'event', 'logos', 'signatures']);
});

test('certificate data endpoint returns 404 for a pending certificate', function () {
    $event    = Event::create(['event_name' => 'Pending Fest']);
    $edition  = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $template = Template::create(['name' => 'Basic', 'template_file' => 'basic.html']);

    $certNo = 'pending-fest-2026-112233';
    Participant::create([
        'event_id'         => $event->id,
        'event_edition_id' => $edition->id,
        'template_id'      => $template->id,
        'name'             => 'Bob',
        'email'            => 'bob@example.com',
        'certificate_no'   => $certNo,
        'status'           => 'pending',
    ]);

    $this->getJson(route('certificate.data', $certNo))
        ->assertNotFound();
});

// ── Authenticated preview ─────────────────────────────────────────────────────

test('certificate preview requires authentication', function () {
    $event    = Event::create(['event_name' => 'Preview Fest']);
    $edition  = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $template = Template::create(['name' => 'Basic', 'template_file' => 'basic.html']);
    $participant = Participant::create([
        'event_id'         => $event->id,
        'event_edition_id' => $edition->id,
        'template_id'      => $template->id,
        'name'             => 'Carol',
        'email'            => 'carol@example.com',
        'certificate_no'   => 'preview-2026-aabbcc',
        'status'           => 'active',
    ]);

    $this->get(route('certificates.preview', $participant))
        ->assertRedirect(route('login'));
});

test('certificate preview returns 403 for user without certificates.preview permission', function () {
    $event    = Event::create(['event_name' => 'Preview Fest 2']);
    $edition  = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $template = Template::create(['name' => 'Basic', 'template_file' => 'basic.html']);
    $participant = Participant::create([
        'event_id'         => $event->id,
        'event_edition_id' => $edition->id,
        'template_id'      => $template->id,
        'name'             => 'Dave',
        'email'            => 'dave@example.com',
        'certificate_no'   => 'preview2-2026-aabbcc',
        'status'           => 'active',
    ]);

    $user = userWithPermission('some.other.permission');

    $this->actingAs($user)
        ->get(route('certificates.preview', $participant))
        ->assertForbidden();
});

// ── Template preview ──────────────────────────────────────────────────────────

test('template preview requires authentication', function () {
    $template = Template::create(['name' => 'Basic', 'template_file' => 'basic.html']);

    $this->get(route('templates.preview', $template))
        ->assertRedirect(route('login'));
});

test('template preview returns 403 for user without certificates.preview permission', function () {
    $template = Template::create(['name' => 'Basic', 'template_file' => 'basic.html']);
    $user     = userWithPermission('some.other.permission');

    $this->actingAs($user)
        ->get(route('templates.preview', $template))
        ->assertForbidden();
});

test('template preview is accessible for user with certificates.preview permission', function () {
    $template = Template::create(['name' => 'Basic', 'template_file' => 'basic.html']);
    $user     = userWithPermission('certificates.preview');

    $this->actingAs($user)
        ->get(route('templates.preview', $template))
        ->assertOk();
});

test('template preview is accessible for super admin', function () {
    $template = Template::create(['name' => 'Basic', 'template_file' => 'basic.html']);

    $this->actingAs(superAdmin())
        ->get(route('templates.preview', $template))
        ->assertOk();
});
