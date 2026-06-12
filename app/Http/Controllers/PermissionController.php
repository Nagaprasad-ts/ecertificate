<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/permissions/index', [
            'permissions' => Permission::orderBy('page')->orderBy('name')->get()->groupBy('page'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/permissions/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:permissions,slug', 'regex:/^[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*$/'],
            'page' => ['required', 'string', 'max:100'],
        ]);

        $data['page'] = str()->headline($data['page']);

        Permission::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Permission created successfully.']);

        return to_route('admin.permissions.index');
    }

    public function edit(Permission $permission): Response
    {
        return Inertia::render('admin/permissions/edit', [
            'permission' => $permission->only('id', 'name', 'slug', 'page'),
        ]);
    }

    public function update(Request $request, Permission $permission): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:permissions,slug,' . $permission->id, 'regex:/^[a-z][a-z0-9_-]*\.[a-z][a-z0-9_-]*$/'],
            'page' => ['required', 'string', 'max:100'],
        ]);

        $data['page'] = str()->headline($data['page']);

        $permission->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Permission updated successfully.']);

        return to_route('admin.permissions.index');
    }

    public function destroy(Permission $permission): RedirectResponse
    {
        $permission->roles()->detach();
        $permission->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Permission deleted successfully.']);

        return to_route('admin.permissions.index');
    }
}
