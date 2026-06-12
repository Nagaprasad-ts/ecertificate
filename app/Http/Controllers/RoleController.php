<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/roles/index', [
            'roles' => Role::withCount(['permissions', 'users'])->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/roles/create', [
            'permissions' => Permission::orderBy('page')->orderBy('name')->get()
                ->groupBy('page'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'           => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permission_ids' => ['nullable', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
        ]);

        $role->permissions()->sync($data['permission_ids'] ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role created successfully.']);

        return to_route('admin.roles.index');
    }

    public function edit(Role $role): Response
    {
        return Inertia::render('admin/roles/edit', [
            'role'        => $role->only('id', 'name', 'slug'),
            'permissions' => Permission::orderBy('page')->orderBy('name')->get()->groupBy('page'),
            'assigned'    => $role->permissions()->pluck('permissions.id'),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        if ($role->slug === 'super_admin') {
            return back()->withErrors(['role' => 'The Super Admin role cannot be modified.']);
        }

        $data = $request->validate([
            'name'             => ['required', 'string', 'max:255', 'unique:roles,name,' . $role->id],
            'permission_ids'   => ['nullable', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ]);

        $role->update([
            'name' => $data['name'],
        ]);

        $role->permissions()->sync($data['permission_ids'] ?? []);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role updated successfully.']);

        return to_route('admin.roles.index');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->slug === 'super_admin') {
            return back()->withErrors(['role' => 'The Super Admin role cannot be deleted.']);
        }

        if ($role->users()->exists()) {
            return back()->withErrors(['role' => 'Cannot delete a role that has users assigned to it.']);
        }

        $role->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Role deleted successfully.']);

        return to_route('admin.roles.index');
    }
}
