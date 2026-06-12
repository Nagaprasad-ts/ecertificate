<?php

namespace App\Http\Controllers;

use App\Models\Logo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LogoController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:logos.read',   only: ['index', 'show']),
            new Middleware('permission:logos.create', only: ['create', 'store']),
            new Middleware('permission:logos.update', only: ['edit', 'update']),
            new Middleware('permission:logos.delete', only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('logos/index', [
            'logos' => Logo::latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('logos/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'logo_name' => ['required', 'string', 'max:255'],
            'year'      => ['required', 'integer', 'min:2000', 'max:2100'],
            'logo'      => ['required', 'image', 'max:2048'],
        ]);

        $data['logo'] = $request->file('logo')->store('logos', 'public');

        Logo::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Logo created successfully.']);

        return to_route('logos.index');
    }

    public function edit(Logo $logo): Response
    {
        return Inertia::render('logos/edit', [
            'logo' => $logo,
        ]);
    }

    public function update(Request $request, Logo $logo): RedirectResponse
    {
        $data = $request->validate([
            'logo_name' => ['required', 'string', 'max:255'],
            'year'      => ['required', 'integer', 'min:2000', 'max:2100'],
            'logo'      => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            Storage::disk('public')->delete($logo->logo);
            $data['logo'] = $request->file('logo')->store('logos', 'public');
        } else {
            unset($data['logo']);
        }

        $logo->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Logo updated successfully.']);

        return to_route('logos.index');
    }

    public function destroy(Logo $logo): RedirectResponse
    {
        Storage::disk('public')->delete($logo->logo);
        $logo->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Logo deleted successfully.']);

        return to_route('logos.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'];
        Logo::whereIn('id', $ids)->get()->each(fn($logo) => Storage::disk('public')->delete($logo->logo));
        Logo::whereIn('id', $ids)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => count($ids) . ' logo(s) deleted.']);

        return to_route('logos.index');
    }
}
