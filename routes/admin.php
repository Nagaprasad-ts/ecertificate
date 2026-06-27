<?php

use App\Http\Controllers\ArtisanCommandsController;
use App\Http\Controllers\EmailLogController;
use App\Http\Controllers\ImportBatchController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// Import batches — gated by ImportBatchController::middleware()
Route::get('admin/import-batches',             [ImportBatchController::class, 'index'])->name('admin.import-batches.index');
Route::delete('admin/import-batches/{batchId}', [ImportBatchController::class, 'destroy'])->name('admin.import-batches.destroy');

// Super-admin: user / role / permission management
Route::middleware('super_admin')->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users',       UserController::class)->except(['show']);
    Route::resource('roles',       RoleController::class)->except(['show']);
    Route::resource('permissions', PermissionController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);
});

// Admin views — gated by controller HasMiddleware
Route::get('admin/email-logs',       [EmailLogController::class,        'index'])->name('admin.email-logs.index');
Route::get('admin/artisan-commands', [ArtisanCommandsController::class, 'index'])->name('admin.artisan-commands.index');
