<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        $pages = ['events', 'logos', 'signatures', 'templates', 'participants', 'users'];
        $actions = ['create', 'read', 'update', 'delete'];

        // Create all standard CRUD permissions
        $permissions = [];
        foreach ($pages as $page) {
            foreach ($actions as $action) {
                $permissions["{$page}.{$action}"] = Permission::firstOrCreate(
                    ['slug' => "{$page}.{$action}"],
                    ['name' => ucfirst($action) . ' ' . ucfirst($page), 'page' => ucfirst($page)]
                );
            }
        }

        // Batches — custom permissions (not CRUD)
        $batchPermissions = [
            'batches.view-all'   => Permission::firstOrCreate(
                ['slug' => 'batches.view-all'],
                ['name' => 'View All Import Batches', 'page' => 'Batches']
            ),
            'batches.set-window' => Permission::firstOrCreate(
                ['slug' => 'batches.set-window'],
                ['name' => 'Set Email Window', 'page' => 'Batches']
            ),
        ];

        // Super Admin — all permissions including batches
        $superAdmin = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin']);
        $superAdmin->permissions()->sync(
            collect($permissions)->merge($batchPermissions)->pluck('id')
        );

        // Admin — all except user management (no batches admin access)
        $admin = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $adminPermissions = collect($permissions)
            ->filter(fn ($p) => $p->page !== 'Users')
            ->pluck('id');
        $admin->permissions()->sync($adminPermissions);

        // Viewer — read only (no batches admin access)
        $viewer = Role::firstOrCreate(['slug' => 'viewer'], ['name' => 'Viewer']);
        $viewerPermissions = collect($permissions)
            ->filter(fn ($p) => str_ends_with($p->slug, '.read'))
            ->pluck('id');
        $viewer->permissions()->sync($viewerPermissions);
    }
}
