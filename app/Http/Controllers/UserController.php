<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::with('role')->latest()->get()
                ->map(fn ($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role ? ['id' => $u->role->id, 'name' => $u->role->name, 'slug' => $u->role->slug] : null,
                    'created_at' => $u->created_at->toDateString(),
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/create', [
            'roles' => Role::select('id', 'name', 'slug')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::defaults()],
            'role_id' => ['nullable', 'exists:roles,id'],
        ]);

        User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id' => $data['role_id'] ?? null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User created successfully.']);

        return to_route('admin.users.index');
    }

    public function edit(User $user): Response
    {
        $user->loadMissing('role');
        abort_if($user->role?->slug === 'super_admin', 403, 'The Super Admin account cannot be edited.');

        return Inertia::render('admin/users/edit', [
            'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'role_id' => $user->role_id],
            'roles' => Role::select('id', 'name', 'slug')->get(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $user->loadMissing('role');
        abort_if($user->role?->slug === 'super_admin', 403, 'The Super Admin account cannot be edited.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$user->id],
            'password' => ['nullable', Password::defaults()],
            'role_id' => ['nullable', 'exists:roles,id'],
        ]);

        $isSelf = $user->id === $request->user()->id;
        $roleChanged = (int) ($data['role_id'] ?? 0) !== (int) $user->role_id;

        if ($isSelf && $roleChanged) {
            return back()->withErrors(['role_id' => 'You cannot change your own role.']);
        }

        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'role_id' => $data['role_id'] ?? null,
            ...(filled($data['password']) ? ['password' => Hash::make($data['password'])] : []),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User updated successfully.']);

        return to_route('admin.users.index');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $user->loadMissing('role');
        abort_if($user->role?->slug === 'super_admin', 403, 'The Super Admin account cannot be deleted.');

        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own account.']);
        }

        $user->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User deleted successfully.']);

        return to_route('admin.users.index');
    }
}
