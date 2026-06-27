<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmailLogController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:email-logs.view', only: ['index']),
        ];
    }

    public function index(Request $request): Response
    {
        // Filter options passed to the frontend
        $events = Event::orderBy('event_name')
            ->with(['editions' => fn ($q) => $q->orderBy('year', 'desc')])
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'event_name' => $e->event_name,
                'editions' => $e->editions->map(fn ($ed) => [
                    'id' => $ed->id,
                    'year' => $ed->year,
                ]),
            ]);

        // Build query
        $query = EmailLog::query()
            ->with('participant')
            ->latest('sent_at');

        if ($request->filled('batch_id')) {
            $query->where('batch_id', $request->batch_id);
        }

        if ($request->filled('event_edition_id')) {
            $query->where('event_edition_id', $request->event_edition_id);
        } elseif ($request->filled('event_id')) {
            $query->where('event_id', $request->event_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn ($q) => $q->where('to_address', 'like', "%{$search}%")
                ->orWhere('to_name', 'like', "%{$search}%")
                ->orWhere('batch_id', 'like', "%{$search}%")
            );
        }

        $logs = $query->paginate(50)->withQueryString();

        // Summary stats for current filter
        $statsQuery = EmailLog::query();
        if ($request->filled('batch_id')) {
            $statsQuery->where('batch_id', $request->batch_id);
        }
        if ($request->filled('event_edition_id')) {
            $statsQuery->where('event_edition_id', $request->event_edition_id);
        } elseif ($request->filled('event_id')) {
            $statsQuery->where('event_id', $request->event_id);
        }

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'sent' => (clone $statsQuery)->where('status', 'sent')->count(),
            'failed' => (clone $statsQuery)->where('status', 'failed')->count(),
        ];

        // Enriched batch list — join with import_batches + events for readable labels
        $batches = EmailLog::select(
            'email_logs.batch_id',
            DB::raw('COUNT(*) as email_count'),
            DB::raw('SUM(CASE WHEN email_logs.status = "sent" THEN 1 ELSE 0 END) as sent_count'),
            DB::raw('MIN(email_logs.sent_at) as first_sent_at'),
            'events.event_name',
            'event_editions.year',
        )
            ->leftJoin('import_batches', 'import_batches.batch_id', '=', 'email_logs.batch_id')
            ->leftJoin('events', 'events.id', '=', 'import_batches.event_id')
            ->leftJoin('event_editions', 'event_editions.id', '=', 'email_logs.event_edition_id')
            ->whereNotNull('email_logs.batch_id')
            ->groupBy('email_logs.batch_id', 'events.event_name', 'event_editions.year')
            ->orderByDesc('first_sent_at')
            ->get()
            ->map(fn ($row) => [
            'batch_id' => $row->batch_id,
            'event_name' => $row->event_name ?? 'Unknown event',
            'year' => $row->year,
            'email_count' => (int) $row->email_count,
            'sent_count' => (int) $row->sent_count,
            'first_sent_at' => $row->first_sent_at,
        ]);

        return Inertia::render('admin/email-logs/index', [
            'logs' => $logs,
            'events' => $events,
            'batches' => $batches,
            'stats' => $stats,
            'filters' => $request->only('batch_id', 'event_id', 'event_edition_id', 'status', 'search'),
        ]);
    }
}
