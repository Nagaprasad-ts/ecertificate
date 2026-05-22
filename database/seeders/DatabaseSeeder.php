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

        $users = [
            [
                'name'     => 'Super Admin',
                'email'    => 'superadmin@ecertificate.com',
                'password' => Hash::make('superadmin@123'),
                'role'     => 'super_admin',
            ],
            [
                'name'     => 'Admin',
                'email'    => 'admin@ecertificate.com',
                'password' => Hash::make('admin@123'),
                'role'     => 'admin',
            ],
            [
                'name'     => 'Viewer',
                'email'    => 'viewer@ecertificate.com',
                'password' => Hash::make('viewer@123'),
                'role'     => 'viewer',
            ],
        ];

        foreach ($users as $data) {
            $role = Role::where('slug', $data['role'])->first();

            User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => $data['password'],
                    'role_id'  => $role?->id,
                ]
            );
        }
    }
}
