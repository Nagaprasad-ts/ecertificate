<?php

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// Webhook — excluded from CSRF in bootstrap/app.php
Route::post('/webhooks/ses', [WebhookController::class, 'sesNotification']);

// Public routes — no login required
Route::get('/certificate/search', [CertificateController::class, 'search'])->name('certificate.search');
Route::get('/certificate/{certificateNo}/data', [CertificateController::class, 'data'])->name('certificate.data');
Route::get('/certificate/{certificateNo}',      [CertificateController::class, 'show'])->name('certificate.show');

Route::middleware(['auth'])->group(function () {
    Route::get('/notifications', function () {
        $notifications = Auth::user()->notifications()->latest()->paginate(20);
        return inertia('notifications/index', compact('notifications'));
    })->name('notifications.index');

    Route::post('/notifications/{id}/read', function (string $id) {
        Auth::user()->notifications()->where('id', $id)->update(['read_at' => now()]);
        return back();
    })->name('notifications.read');

    Route::post('/notifications/read-all', function () {
        Auth::user()->unreadNotifications()->update(['read_at' => now()]);
        return back();
    })->name('notifications.read-all');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    require __DIR__.'/assets.php';
    require __DIR__.'/events.php';
    require __DIR__.'/participants.php';
    require __DIR__.'/admin.php';
});

require __DIR__.'/settings.php';
