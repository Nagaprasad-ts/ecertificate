<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Public routes — no login required
Route::get('/certificate/search', [\App\Http\Controllers\ParticipantController::class, 'search'])
    ->name('certificate.search');
Route::get('/certificate/{certificateNo}/data', [\App\Http\Controllers\CertificateController::class, 'data'])->name('certificate.data');
Route::get('/certificate/{certificateNo}', [\App\Http\Controllers\CertificateController::class, 'show'])->name('certificate.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    // ── Asset management — permission-gated via controller middleware ─────────
    // bulk-destroy before resource to avoid {model} capture
    Route::delete('logos/bulk-destroy',      [\App\Http\Controllers\LogoController::class,      'bulkDestroy'])->name('logos.bulk-destroy');
    Route::delete('signatures/bulk-destroy', [\App\Http\Controllers\SignatureController::class,  'bulkDestroy'])->name('signatures.bulk-destroy');
    Route::delete('templates/bulk-destroy',  [\App\Http\Controllers\TemplateController::class,   'bulkDestroy'])->name('templates.bulk-destroy');

    Route::resource('logos',      \App\Http\Controllers\LogoController::class);
    Route::resource('signatures', \App\Http\Controllers\SignatureController::class);
    Route::resource('templates',  \App\Http\Controllers\TemplateController::class);

    Route::get('templates/{template}/preview', [\App\Http\Controllers\CertificateController::class, 'templatePreview'])
        ->name('templates.preview');

    // ── Events ────────────────────────────────────────────────────────────────
    // bulk-destroy and archived before resource to avoid {event} capture
    Route::delete('events/bulk-destroy', [\App\Http\Controllers\EventController::class, 'bulkDestroy'])->name('events.bulk-destroy');
    Route::get('events/archived',        [\App\Http\Controllers\EventController::class, 'archivedIndex'])->name('events.archived');
    Route::resource('events', \App\Http\Controllers\EventController::class);
    Route::post('events/{event}/archive',   [\App\Http\Controllers\EventController::class, 'archive'])->name('events.archive');
    Route::post('events/{event}/unarchive', [\App\Http\Controllers\EventController::class, 'unarchive'])->name('events.unarchive');

    // Event editions — nested under events
    Route::post('events/{event}/editions',                    [\App\Http\Controllers\EventEditionController::class, 'store'])->name('event-editions.store');
    Route::patch('events/{event}/editions/{edition}',         [\App\Http\Controllers\EventEditionController::class, 'update'])->name('event-editions.update');
    Route::delete('events/{event}/editions/{edition}',        [\App\Http\Controllers\EventEditionController::class, 'destroy'])->name('event-editions.destroy');

    // ── Participants ──────────────────────────────────────────────────────────
    // bulk-destroy / delete-all before resource to avoid {participant} capture
    Route::delete('participants/bulk-destroy', [\App\Http\Controllers\ParticipantController::class, 'bulkDestroy'])->name('participants.bulk-destroy');
    Route::delete('participants/delete-all',   [\App\Http\Controllers\ParticipantController::class, 'deleteAll'])->name('participants.delete-all');
    Route::resource('participants', \App\Http\Controllers\ParticipantController::class)->except(['show']);

    // Certificate preview — permission enforced by CertificateController::middleware()
    Route::get('certificates/{participant}/preview', [\App\Http\Controllers\CertificateController::class, 'preview'])->name('certificates.preview');

    // ── Super-admin: user / role / permission management ─────────────────────
    Route::middleware('super_admin')->prefix('admin')->name('admin.')->group(function () {
        Route::resource('users',       \App\Http\Controllers\UserController::class)->except(['show']);
        Route::resource('roles',       \App\Http\Controllers\RoleController::class)->except(['show']);
        Route::resource('permissions', \App\Http\Controllers\PermissionController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
    });

    // ── Permission-gated admin views ──────────────────────────────────────────
    Route::get('admin/email-logs',       [\App\Http\Controllers\EmailLogController::class,       'index'])
        ->name('admin.email-logs.index')
        ->middleware('permission:email-logs.view');
    Route::get('admin/artisan-commands', [\App\Http\Controllers\ArtisanCommandsController::class, 'index'])
        ->name('admin.artisan-commands.index')
        ->middleware('permission:artisan-commands.view');

    // Import-batch admin page — permission-based (not hardcoded to super_admin role)
    Route::get('admin/import-batches', [\App\Http\Controllers\ParticipantController::class, 'importBatchesAdmin'])
        ->name('admin.import-batches.index')
        ->middleware('permission:batches.view-all');

    Route::delete('admin/import-batches/{batchId}', [\App\Http\Controllers\ParticipantController::class, 'deleteBatch'])
        ->name('admin.import-batches.destroy')
        ->middleware('permission:batches.delete');

    // Participant import — requires participants.import permission
    Route::middleware('permission:participants.import')->group(function () {
        Route::get('participants/import/form',                 [\App\Http\Controllers\ParticipantController::class, 'importForm'])->name('participants.import.form');
        Route::post('participants/import',                     [\App\Http\Controllers\ParticipantController::class, 'import'])->name('participants.import');
        Route::get('participants/import/{batchId}/results',    [\App\Http\Controllers\ParticipantController::class, 'importResults'])->name('participants.import.results');
        Route::post('participants/import/{batchId}/confirm',   [\App\Http\Controllers\ParticipantController::class, 'confirmImport'])->name('participants.import.confirm');
        Route::post('participants/import/{batchId}/re-import', [\App\Http\Controllers\ParticipantController::class, 'reImport'])->name('participants.import.re-import');
        Route::delete('participants/import/{batchId}/discard', [\App\Http\Controllers\ParticipantController::class, 'discardImport'])->name('participants.import.discard');
    });

    // Set email window — separate permission (admin-authorization step)
    Route::post('participants/import/{batchId}/set-window', [\App\Http\Controllers\ParticipantController::class, 'setEmailWindow'])
        ->name('participants.import.set-window')
        ->middleware('permission:batches.set-window');
});

require __DIR__.'/settings.php';
