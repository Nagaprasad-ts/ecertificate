<?php

namespace App\Http\Controllers;

use App\Models\Signature;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SignatureController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:signatures.read',   only: ['index', 'show']),
            new Middleware('permission:signatures.create', only: ['create', 'store']),
            new Middleware('permission:signatures.update', only: ['edit', 'update']),
            new Middleware('permission:signatures.delete', only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('signatures/index', [
            'signatures' => Signature::latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('signatures/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'designation'     => ['required', 'string', 'max:255'],
            'signature'       => ['required', 'image', 'max:2048'],
            'resignation_date' => ['nullable', 'date'],
        ]);

        $data['signature'] = $request->file('signature')->store('signatures', 'public');

        Signature::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Signature created successfully.']);

        return to_route('signatures.index');
    }

    public function edit(Signature $signature): Response
    {
        return Inertia::render('signatures/edit', [
            'signature' => $signature,
        ]);
    }

    public function update(Request $request, Signature $signature): RedirectResponse
    {
        $data = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'designation'     => ['required', 'string', 'max:255'],
            'signature'       => ['nullable', 'image', 'max:2048'],
            'resignation_date' => ['nullable', 'date'],
        ]);

        if ($request->hasFile('signature')) {
            Storage::disk('public')->delete($signature->signature);
            $data['signature'] = $request->file('signature')->store('signatures', 'public');
        } else {
            unset($data['signature']);
        }

        $signature->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Signature updated successfully.']);

        return to_route('signatures.index');
    }

    public function destroy(Signature $signature): RedirectResponse
    {
        Storage::disk('public')->delete($signature->signature);
        $signature->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Signature deleted successfully.']);

        return to_route('signatures.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'];
        Signature::whereIn('id', $ids)->get()->each(fn($sig) => Storage::disk('public')->delete($sig->signature));
        Signature::whereIn('id', $ids)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => count($ids) . ' signature(s) deleted.']);

        return to_route('signatures.index');
    }
}
