<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

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
