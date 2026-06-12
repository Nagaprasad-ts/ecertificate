<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HasPermission
{
    /**
     * Grant access only when the authenticated user holds the given permission slug.
     *
     * Usage in routes:  ->middleware('permission:batches.view-all')
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user()?->loadMissing('role.permissions');

        if ($user?->role?->slug === 'super_admin') {
            return $next($request);
        }

        if (! $user?->hasPermission($permission)) {
            abort(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
