<?php

use App\Models\Event;
use App\Models\ImportBatch;
use App\Models\Template;
use App\Models\User;
use Illuminate\Support\Str;

// ── Primary key (needs DB) ────────────────────────────────────────────────────

test('ImportBatch uses batch_id as string primary key', function () {
    $event    = Event::create(['event_name' => 'PK Test Event']);
    $template = Template::create(['name' => 'PK Tpl', 'template_file' => 'basic.html']);
    $user     = User::factory()->create();
    $uuid     = (string) Str::uuid();

    $batch = ImportBatch::create([
        'batch_id'          => $uuid,
        'event_id'          => $event->id,
        'template_id'       => $template->id,
        'imported_by'       => $user->id,
        'participant_count' => 5,
        'failed_count'      => 0,
    ]);

    expect($batch->getKeyName())->toBe('batch_id')
        ->and($batch->batch_id)->toBe($uuid)
        ->and(ImportBatch::find($uuid, ['*']))->not->toBeNull();
});

// ── windowStatus — purely in-memory (no DB needed) ───────────────────────────

test('windowStatus is not_set when no window is configured', function () {
    $batch = new ImportBatch();

    expect($batch->windowStatus())->toBe('not_set');
});

test('windowStatus is upcoming when window has not started', function () {
    $batch = new ImportBatch([
        'email_window_from' => now()->addHour(),
        'email_window_to'   => now()->addHours(2),
    ]);

    expect($batch->windowStatus())->toBe('upcoming');
});

test('windowStatus is active when now is within the window', function () {
    $batch = new ImportBatch([
        'email_window_from' => now()->subHour(),
        'email_window_to'   => now()->addHour(),
    ]);

    expect($batch->windowStatus())->toBe('active');
});

test('windowStatus is expired when window has passed', function () {
    $batch = new ImportBatch([
        'email_window_from' => now()->subHours(3),
        'email_window_to'   => now()->subHour(),
    ]);

    expect($batch->windowStatus())->toBe('expired');
});

// ── isEmailWindowActive — purely in-memory ────────────────────────────────────

test('isEmailWindowActive is false when no window is set', function () {
    expect((new ImportBatch())->isEmailWindowActive())->toBeFalse();
});

test('isEmailWindowActive is false when window has not started yet', function () {
    $batch = new ImportBatch([
        'email_window_from' => now()->addHour(),
        'email_window_to'   => now()->addHours(2),
    ]);

    expect($batch->isEmailWindowActive())->toBeFalse();
});

test('isEmailWindowActive is true when now falls within the window', function () {
    $batch = new ImportBatch([
        'email_window_from' => now()->subHour(),
        'email_window_to'   => now()->addHour(),
    ]);

    expect($batch->isEmailWindowActive())->toBeTrue();
});

test('isEmailWindowActive is false after the window has expired', function () {
    $batch = new ImportBatch([
        'email_window_from' => now()->subHours(3),
        'email_window_to'   => now()->subHour(),
    ]);

    expect($batch->isEmailWindowActive())->toBeFalse();
});
