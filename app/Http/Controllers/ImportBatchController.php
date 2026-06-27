<?php

namespace App\Http\Controllers;

use App\Models\ImportBatch;
use App\Services\ParticipantImportService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class ImportBatchController extends Controller implements HasMiddleware
{
    public function __construct(private readonly ParticipantImportService $importService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:batches.view-all', only: ['index']),
            new Middleware('permission:batches.delete', only: ['destroy']),
        ];
    }

    public function index(): Response
    {
        $batches = ImportBatch::with(['event', 'edition', 'template', 'importedBy'])
            ->latest()
            ->get()
            ->map(fn ($b) => [
                'batch_id' => $b->batch_id,
                'event_name' => $b->event?->event_name ?? '—',
                'event_year' => $b->edition?->year,
                'template_name' => $b->template?->name ?? '—',
                'imported_by_name' => $b->importedBy?->name ?? '—',
                'imported_by_email' => $b->importedBy?->email ?? '—',
                'participant_count' => $b->participant_count,
                'failed_count' => $b->failed_count,
                'imported_at' => $b->created_at->toIso8601String(),
                'updated_at' => $b->updated_at->toIso8601String(),
                'email_window_from' => $b->email_window_from?->toIso8601String(),
                'email_window_to' => $b->email_window_to?->toIso8601String(),
                'window_status' => $b->windowStatus(),
            ]);

        return Inertia::render('admin/import-batches/index', [
            'batches' => $batches,
        ]);
    }

    public function destroy(string $batchId): RedirectResponse
    {
        $batch = ImportBatch::findOrFail($batchId);
        $count = $this->importService->deleteBatch($batch);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Batch deleted. {$count} participant(s) removed.",
        ]);

        return to_route('admin.import-batches.index');
    }
}
