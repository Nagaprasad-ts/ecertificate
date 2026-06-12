import { Head, router } from '@inertiajs/react';
import { CheckCircle2, Mail, Search, XCircle } from 'lucide-react';
import type { ComponentType } from 'react';

type StatKey = 'total' | 'sent' | 'failed';
interface StatCardConfig {
    key: StatKey;
    label: string;
    icon: ComponentType<{ className?: string }>;
    iconBg?: string;
    iconColor?: string;
    valueColor?: string;
}

const STAT_CARDS: StatCardConfig[] = [
    { key: 'total',  label: 'Total',  icon: Mail },
    { key: 'sent',   label: 'Sent',   icon: CheckCircle2, iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400', valueColor: 'text-green-600 dark:text-green-400' },
    { key: 'failed', label: 'Failed', icon: XCircle,      iconBg: 'bg-red-100 dark:bg-red-900/30',    iconColor: 'text-red-600 dark:text-red-400',    valueColor: 'text-red-600 dark:text-red-400' },
];
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';

function formatShortDate(iso: string | null) {
    if (!iso) {
        return '';
    }
    
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

type LogEntry = {
    id: number;
    batch_id: string | null;
    to_address: string;
    to_name: string;
    subject: string;
    status: 'sent' | 'failed';
    error_message: string | null;
    sent_at: string | null;
    participant: { id: number; certificate_no: string } | null;
};

type PaginatedLogs = {
    data: LogEntry[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
    from: number | null;
    to: number | null;
};

type Edition     = { id: number; year: number };
type EventOption = { id: number; event_name: string; editions: Edition[] };
type BatchSummary = {
    batch_id: string;
    event_name: string;
    year: number | null;
    email_count: number;
    sent_count: number;
    first_sent_at: string | null;
};

type Props = {
    logs: PaginatedLogs;
    events: EventOption[];
    batches: BatchSummary[];
    stats: { total: number; sent: number; failed: number };
    filters: { batch_id?: string; event_id?: string; event_edition_id?: string; status?: string; search?: string };
};

export default function EmailLogsIndex({ logs, events, batches, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

    function toggleError(id: number) {
        setExpandedErrors((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    // Flat edition options for the searchable select
    const editionOptions = events.flatMap((e) =>
        e.editions.map((ed) => ({ value: String(ed.id), label: `${e.event_name} — ${ed.year}` })),
    );

    function applyFilter(patch: Record<string, string | undefined>) {
        router.get('/admin/email-logs', { ...filters, ...patch }, { preserveState: true, replace: true });
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilter({ search: search || undefined });
    }

    function formatDate(iso: string | null) {
        if (!iso) {
            return '—';
        }
        
        return new Date(iso).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    const activeEditionValue = filters.event_edition_id ?? '';

    return (
        <>
            <Head title="Email Logs" />
            <div className="p-6">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Email Logs</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Certificate dispatch history</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-3 gap-4">
                    {STAT_CARDS.map(({ key, label, icon, iconBg, iconColor, valueColor }) => (
                        <StatCard key={key} label={label} value={stats[key]} icon={icon} iconBg={iconBg} iconColor={iconColor} valueColor={valueColor} />
                    ))}
                </div>

                {/* Filters */}
                <div className="mb-4 flex flex-wrap gap-3">
                    {/* Event + Edition */}
                    <SearchableSelect
                        options={editionOptions}
                        value={activeEditionValue}
                        onChange={(id) => applyFilter({ event_edition_id: id || undefined, event_id: undefined })}
                        placeholder="All events & editions"
                        searchPlaceholder="Search event or year…"
                        triggerClassName="w-64"
                    />

                    {/* Batch — searchable with human-readable labels */}
                    <SearchableSelect
                        options={batches.map((b) => ({
                            value: b.batch_id,
                            label: `${b.event_name}${b.year ? ` — ${b.year}` : ''} · ${b.email_count} emails · ${formatShortDate(b.first_sent_at)}`,
                        }))}
                        value={filters.batch_id ?? ''}
                        onChange={(v) => applyFilter({ batch_id: v || undefined })}
                        placeholder="All batches"
                        searchPlaceholder="Search by event or date…"
                        triggerClassName="w-72"
                    />

                    {/* Status */}
                    <Select
                        value={filters.status ?? 'all'}
                        onValueChange={(v) => applyFilter({ status: v === 'all' ? undefined : v })}
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Name / Email search */}
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email…"
                        />
                        <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Recipient</th>
                                <th className="px-4 py-3 text-left font-medium">Batch</th>
                                <th className="px-4 py-3 text-left font-medium">Status</th>
                                <th className="px-4 py-3 text-left font-medium">Sent At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                        No email logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{log.to_name}</p>
                                            <p className="text-xs text-muted-foreground">{log.to_address}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.batch_id ? (() => {
                                                const b = batches.find((x) => x.batch_id === log.batch_id);
                                                
                                                return (
                                                    <button
                                                        type="button"
                                                        className="text-left text-xs text-primary hover:underline"
                                                        onClick={() => applyFilter({ batch_id: log.batch_id ?? undefined, event_edition_id: undefined })}
                                                        title={log.batch_id}
                                                    >
                                                        <span className="font-medium">
                                                            {b ? `${b.event_name}${b.year ? ` — ${b.year}` : ''}` : log.batch_id.slice(0, 8) + '…'}
                                                        </span>
                                                        {b && <span className="block text-muted-foreground">{formatShortDate(b.first_sent_at)}</span>}
                                                    </button>
                                                );
                                            })() : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {log.status === 'sent' ? (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Sent
                                                </Badge>
                                            ) : (
                                                <div>
                                                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 gap-1">
                                                        <XCircle className="h-3 w-3" /> Failed
                                                    </Badge>
                                                    {log.error_message && (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleError(log.id)}
                                                            className={`mt-1 block max-w-xs text-left text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ${expandedErrors.has(log.id) ? 'whitespace-pre-wrap break-words' : 'truncate'}`}
                                                        >
                                                            {log.error_message}
                                                            {!expandedErrors.has(log.id) && (
                                                                <span className="ml-1 font-medium underline underline-offset-2">show more</span>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDate(log.sent_at)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination + count */}
                {logs.total > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {logs.from}–{logs.to} of {logs.total.toLocaleString()} records
                        </p>
                        <div className="flex gap-1">
                            {logs.links.map((link, i) => (
                                <Button
                                    key={i}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

EmailLogsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Email Logs', href: '/admin/email-logs' },
    ],
};
