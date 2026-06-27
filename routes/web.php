<?php

use App\Http\Controllers\CertificateController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Public routes — no login required
Route::get('/certificate/search', [CertificateController::class, 'search'])->name('certificate.search');
Route::get('/certificate/{certificateNo}/data', [CertificateController::class, 'data'])->name('certificate.data');
Route::get('/certificate/{certificateNo}',      [CertificateController::class, 'show'])->name('certificate.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    require __DIR__.'/assets.php';
    require __DIR__.'/events.php';
    require __DIR__.'/participants.php';
    require __DIR__.'/admin.php';
});

require __DIR__.'/settings.php';
