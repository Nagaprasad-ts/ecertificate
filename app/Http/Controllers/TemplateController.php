<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
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
        $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'template_file' => ['required', 'string', 'max:500'],
        ]);

        Template::create($request->only('name', 'template_file'));

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
        $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'template_file' => ['required', 'string', 'max:500'],
        ]);

        $template->update($request->only('name', 'template_file'));

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
