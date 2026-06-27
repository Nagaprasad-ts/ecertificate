<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature', 'Unit');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

// Create a user whose role has the given permission slugs.
function userWithPermission(string ...$slugs): User
{
    static $counter = 0;
    $role = Role::create(['name' => 'Role '.++$counter, 'slug' => 'role-'.$counter]);
    foreach ($slugs as $slug) {
        $perm = Permission::firstOrCreate(['slug' => $slug], ['name' => $slug, 'page' => 'test']);
        $role->permissions()->attach($perm->id);
    }

    return User::factory()->create(['role_id' => $role->id]);
}

// Create a super-admin user (bypasses all permission checks).
function superAdmin(): User
{
    $role = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin']);

    return User::factory()->create(['role_id' => $role->id]);
}
