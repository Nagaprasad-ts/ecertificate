<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Discovers all routes, creates permission rows, prunes stale ones,
        // and gives super_admin every permission. Roles beyond super_admin
        // are created and managed via Admin → Roles in the UI.
        Artisan::call('permissions:sync', ['--prune-orphans' => true]);
    }
}
