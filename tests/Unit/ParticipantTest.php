<?php

use App\Models\Event;
use App\Models\EventEdition;
use App\Models\Participant;
use App\Models\Template;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeEdition(): EventEdition
{
    $event = Event::create(['event_name' => 'Test Event '.uniqid()]);
    return EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
}

function makeTemplate(): Template
{
    return Template::create(['name' => 'Default', 'template_file' => 'default.html']);
}

function makeParticipant(array $overrides = []): Participant
{
    $edition  = makeEdition();
    $template = makeTemplate();

    return Participant::create(array_merge([
        'event_id'         => $edition->event_id,
        'event_edition_id' => $edition->id,
        'template_id'      => $template->id,
        'name'             => 'Jane Doe',
        'email'            => 'jane@example.com',
        'certificate_no'   => 'test-2026-'.uniqid(),
        'status'           => 'active',
    ], $overrides));
}

// ── Scope tests ───────────────────────────────────────────────────────────────

test('scopeActive returns only active participants', function () {
    makeParticipant(['status' => 'active', 'email' => 'a@test.com', 'certificate_no' => 'a-'.uniqid()]);
    makeParticipant(['status' => 'pending', 'email' => 'b@test.com', 'certificate_no' => 'b-'.uniqid()]);

    expect(Participant::active()->count())->toBe(1)
        ->and(Participant::active()->first()->email)->toBe('a@test.com');
});

test('scopePending returns only pending participants', function () {
    makeParticipant(['status' => 'active', 'email' => 'a@test.com', 'certificate_no' => 'a-'.uniqid()]);
    makeParticipant(['status' => 'pending', 'email' => 'b@test.com', 'certificate_no' => 'b-'.uniqid()]);

    expect(Participant::pending()->count())->toBe(1)
        ->and(Participant::pending()->first()->email)->toBe('b@test.com');
});

test('scopeForBatch returns only participants with the given batch_id', function () {
    $batchId = (string) \Illuminate\Support\Str::uuid();
    makeParticipant(['batch_id' => $batchId, 'email' => 'batch@test.com', 'certificate_no' => 'c-'.uniqid()]);
    makeParticipant(['batch_id' => null,      'email' => 'other@test.com', 'certificate_no' => 'd-'.uniqid()]);

    expect(Participant::forBatch($batchId)->count())->toBe(1)
        ->and(Participant::forBatch($batchId)->first()->email)->toBe('batch@test.com');
});

// ── generateCertificateNo ─────────────────────────────────────────────────────

test('generateCertificateNo returns slug-year-hex format', function () {
    $event   = Event::create(['event_name' => 'Spring Hackathon']);
    $edition = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $edition->load('event');

    $no = Participant::generateCertificateNo($edition);

    expect($no)->toMatch('/^spring-hackathon-2026-[0-9a-f]{6}$/');
});

test('generateCertificateNo is unique and retries on collision', function () {
    $event   = Event::create(['event_name' => 'Unique Fest']);
    $edition = EventEdition::create(['event_id' => $event->id, 'year' => 2026]);
    $edition->load('event');
    $template = makeTemplate();

    // Generate 5 certificate numbers and confirm all are distinct
    $numbers = collect(range(1, 5))->map(fn () => Participant::generateCertificateNo($edition))->unique();

    expect($numbers)->toHaveCount(5);
});
