<?php

use App\Http\Controllers\CertificateController;
use App\Http\Controllers\LogoController;
use App\Http\Controllers\SignatureController;
use App\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\Route;

// bulk-destroy before resource to avoid {model} capture
Route::delete('logos/bulk-destroy',      [LogoController::class,      'bulkDestroy'])->name('logos.bulk-destroy');
Route::delete('signatures/bulk-destroy', [SignatureController::class,  'bulkDestroy'])->name('signatures.bulk-destroy');
Route::delete('templates/bulk-destroy',  [TemplateController::class,   'bulkDestroy'])->name('templates.bulk-destroy');

Route::resource('logos',      LogoController::class);
Route::resource('signatures', SignatureController::class);
Route::resource('templates',  TemplateController::class);

Route::get('templates/{template}/preview', [CertificateController::class, 'templatePreview'])
    ->name('templates.preview');
