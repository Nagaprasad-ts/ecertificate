<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:templates.read',   only: ['index', 'show']),
            new Middleware('permission:templates.create', only: ['create', 'store']),
            new Middleware('permission:templates.update', only: ['edit', 'update']),
            new Middleware('permission:templates.delete', only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(): Response
    {
        return Inertia::render('templates/index', [
            'templates' => Template::latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('templates/create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'                        => ['required', 'string', 'max:255'],
            'template_file'               => ['required', 'string', 'max:500'],
            'expected_columns'            => ['nullable', 'array'],
            'expected_columns.*.key'      => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/', 'distinct', 'not_in:name,email,usn,phone'],
            'expected_columns.*.label'    => ['required', 'string', 'max:255'],
            'expected_columns.*.required' => ['required', 'boolean'],
        ]);

        Template::create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Template created successfully.']);

        return to_route('templates.index');
    }

    public function edit(Template $template): Response
    {
        return Inertia::render('templates/edit', [
            'template' => $template,
        ]);
    }

    public function update(Request $request, Template $template): RedirectResponse
    {
        $data = $request->validate([
            'name'                        => ['required', 'string', 'max:255'],
            'template_file'               => ['required', 'string', 'max:500'],
            'expected_columns'            => ['nullable', 'array'],
            'expected_columns.*.key'      => ['required', 'string', 'max:100', 'regex:/^[a-z0-9_]+$/', 'distinct', 'not_in:name,email,usn,phone'],
            'expected_columns.*.label'    => ['required', 'string', 'max:255'],
            'expected_columns.*.required' => ['required', 'boolean'],
        ]);

        $template->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Template updated successfully.']);

        return to_route('templates.index');
    }

    public function destroy(Template $template): RedirectResponse
    {
        $template->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Template deleted successfully.']);

        return to_route('templates.index');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']])['ids'];
        Template::whereIn('id', $ids)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => count($ids) . ' template(s) deleted.']);

        return to_route('templates.index');
    }
}
