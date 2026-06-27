<?php

namespace App\Http\Controllers;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class ArtisanCommandsController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:artisan-commands.view', only: ['index']),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('admin/artisan-commands/index');
    }
}
