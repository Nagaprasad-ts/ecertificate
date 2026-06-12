<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ArtisanCommandsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/artisan-commands/index');
    }
}
