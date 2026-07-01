<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Load role + permissions once; derive the slug list from the same instance
        $user = $request->user()?->load('role.permissions');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user'                 => $user,
                'permissions'          => $user?->role?->permissions->pluck('slug') ?? [],
                'is_super_admin'       => $user?->role?->slug === 'super_admin',
                'unread_notifications' => $user
                    ? $user->unreadNotifications()->latest()->take(10)->get()->map(fn ($n) => [
                        'id'         => $n->id,
                        'data'       => $n->data,
                        'created_at' => $n->created_at,
                    ])
                    : [],
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
