<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role?->slug !== 'super_admin') {
            abort(403, 'Super Admin access required.');
        }

        return $next($request);
    }
}
