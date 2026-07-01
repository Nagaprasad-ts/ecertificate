<?php

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ParticipantController;
use App\Http\Controllers\ParticipantImportController;
use Illuminate\Support\Facades\Route;

// bulk-destroy / delete-all before resource to avoid {participant} capture
Route::delete('participants/bulk-destroy', [ParticipantController::class, 'bulkDestroy'])->name('participants.bulk-destroy');
Route::delete('participants/delete-all',   [ParticipantController::class, 'deleteAll'])->name('participants.delete-all');
Route::resource('participants', ParticipantController::class)->except(['show']);
Route::post('participants/{participant}/resend-email', [ParticipantController::class, 'resendEmail'])->name('participants.resend-email');

// Certificate preview — permission enforced by CertificateController::middleware()
Route::get('certificates/{participant}/preview', [CertificateController::class, 'preview'])->name('certificates.preview');

// Participant import — gated by ParticipantImportController::middleware()
Route::get('participants/import/form',                    [ParticipantImportController::class, 'importForm'])->name('participants.import.form');
Route::post('participants/import',                        [ParticipantImportController::class, 'import'])->name('participants.import');
Route::get('participants/import/{batchId}/results',       [ParticipantImportController::class, 'importResults'])->name('participants.import.results');
Route::post('participants/import/{batchId}/confirm',      [ParticipantImportController::class, 'confirmImport'])->name('participants.import.confirm');
Route::post('participants/import/{batchId}/re-import',    [ParticipantImportController::class, 'reImport'])->name('participants.import.re-import');
Route::delete('participants/import/{batchId}/discard',    [ParticipantImportController::class, 'discardImport'])->name('participants.import.discard');
Route::post('participants/import/{batchId}/set-window',   [ParticipantImportController::class, 'setEmailWindow'])->name('participants.import.set-window');
