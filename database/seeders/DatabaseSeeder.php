<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);

        $superAdmin = Role::where('slug', 'super_admin')->first();

        User::firstOrCreate(
            ['email' => 'superadmin@ecertificate.com'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('superadmin@123'),
                'role_id'  => $superAdmin?->id,
            ]
        );
    }
}
