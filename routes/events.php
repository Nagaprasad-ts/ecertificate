<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\EventEditionController;
use Illuminate\Support\Facades\Route;

// bulk-destroy and archived before resource to avoid {event} capture
Route::delete('events/bulk-destroy', [EventController::class, 'bulkDestroy'])->name('events.bulk-destroy');
Route::get('events/archived',        [EventController::class, 'archivedIndex'])->name('events.archived');
Route::resource('events', EventController::class);
Route::post('events/{event}/archive',   [EventController::class, 'archive'])->name('events.archive');
Route::post('events/{event}/unarchive', [EventController::class, 'unarchive'])->name('events.unarchive');

// Event editions — nested under events
Route::post('events/{event}/editions',                   [EventEditionController::class, 'store'])->name('event-editions.store');
Route::patch('events/{event}/editions/{edition}',        [EventEditionController::class, 'update'])->name('event-editions.update');
Route::delete('events/{event}/editions/{edition}',       [EventEditionController::class, 'destroy'])->name('event-editions.destroy');
