<?php

use App\Models\Event;

test('scopeActive excludes archived events', function () {
    Event::create(['event_name' => 'Live Event']);
    Event::create(['event_name' => 'Old Event', 'archived_at' => now()->subDay()]);

    $active = Event::active()->pluck('event_name');

    expect($active)->toContain('Live Event')
        ->not->toContain('Old Event');
});

test('scopeArchived returns only archived events', function () {
    Event::create(['event_name' => 'Live Event']);
    Event::create(['event_name' => 'Old Event', 'archived_at' => now()->subDay()]);

    $archived = Event::archived()->pluck('event_name');

    expect($archived)->toContain('Old Event')
        ->not->toContain('Live Event');
});

test('isArchived is false for an active event', function () {
    $event = Event::create(['event_name' => 'Live']);

    expect($event->isArchived())->toBeFalse();
});

test('isArchived is true for an archived event', function () {
    $event = Event::create(['event_name' => 'Gone', 'archived_at' => now()]);

    expect($event->isArchived())->toBeTrue();
});

test('initials accessor uses first letter of each word for multi-word name', function () {
    $event = new Event(['event_name' => 'National Coding Contest']);

    expect($event->initials)->toBe('NC');
});

test('initials accessor uses first two chars for single-word name', function () {
    $event = new Event(['event_name' => 'Hackathon']);

    expect($event->initials)->toBe('HA');
});

test('initials returns ?? for empty name', function () {
    $event = new Event(['event_name' => '']);

    expect($event->initials)->toBe('??');
});
