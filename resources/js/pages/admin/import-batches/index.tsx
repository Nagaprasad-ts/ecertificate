import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarClock,
    CheckCircle2,
    Clock,
    Eye,
    FileSpreadsheet,
    LayoutGrid,
    LayoutList,
    LayoutTemplate,
    Search,
    ShieldCheck,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { StatCard } from '@/components/ui/stat-card';

// ── Types ─────────────────────────────────────────────────────────────────────

type WindowStatus = 'not_set' | 'upcoming' | 'active' | 'expired';

type Batch = {
    batch_id: string;
    event_name: string;
    event_year: number | null;
    template_name: string;
    imported_by_name: string;
    imported_by_email: string;
    participant_count: number;
    failed_count: number;
    imported_at: string;
    updated_at: string;
    email_window_from: string | null;
    email_window_to: string | null;
    window_status: WindowStatus;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const VIEW_KEY = 'import-batches-view';

function fmt(iso: string | null) {
    if (!iso) {
        return '—';
    }

    return new Date(iso).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function toLocalInput(iso: string | null) {
    if (!iso) {
        return '';
    }

    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function initials(name: string) {

    return name.split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

const AVATAR_COLORS = [
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
];

function avatarColor(name: string) {
    let h = 0;
    
    for (const c of name) {
        h = c.charCodeAt(0) + ((h << 5) - h);
    }

    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Status config ─────────────────────────────────────────────────────────────

const WS: Record<WindowStatus, { label: string; icon: React.ElementType; badge: string; bar: string }> = {
    not_set:  { label: 'Awaiting Auth', icon: AlertTriangle, badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-700',  bar: 'bg-amber-400' },
    upcoming: { label: 'Scheduled',     icon: CalendarClock, badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-700',          bar: 'bg-blue-400' },
    active:   { label: 'Window Open',   icon: CheckCircle2,  badge: 'bg-green-50 text-green-700 ring-1 ring-green-300 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-700',    bar: 'bg-green-400' },
    expired:  { label: 'Expired',       icon: Clock,         badge: 'bg-red-50 text-red-700 ring-1 ring-red-300 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-700',                bar: 'bg-red-400' },
};

// ── Filterable stat card (shared StatCard + button wrapper) ───────────────────

function FilterStatCard({
    label, value, icon, iconBg, iconColor, valueColor, active, onClick,
}: {
    label: string; value: number;
    icon: React.ElementType; iconBg?: string; iconColor?: string; valueColor?: string;
    active?: boolean; onClick?: () => void;
}) {
    return (
        <button type="button" onClick={onClick}
            className={`rounded-xl transition-all hover:shadow-md ${active ? 'ring-2 ring-primary' : ''}`}
        >
            <StatCard label={label} value={value} icon={icon as React.ComponentType<{ className?: string }>}
                iconBg={iconBg} iconColor={iconColor} valueColor={valueColor} />
        </button>
    );
}

// ── Window action (shared) ────────────────────────────────────────────────────

function WindowAction({ batch, onSetWindow }: { batch: Batch; onSetWindow: (b: Batch) => void }) {
    if (batch.failed_count > 0) {
        return (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                Fix {batch.failed_count} failed row{batch.failed_count !== 1 ? 's' : ''} first
            </p>
        );
    }

    return (
        <button type="button" onClick={() => onSetWindow(batch)}
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
            <ShieldCheck className="h-3 w-3" />
            {batch.window_status === 'not_set' ? 'Set window' : 'Update window'}
        </button>
    );
}

// ── Card view ─────────────────────────────────────────────────────────────────

function BatchCard({ batch, onDelete, onSetWindow }: {
    batch: Batch;
    onDelete: (b: Batch) => void;
    onSetWindow: (b: Batch) => void;
}) {
    const ws = WS[batch.window_status];
    const WsIcon = ws.icon;

    return (
        <div className="flex overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
            {/* Status accent bar */}
            <div className={`w-1.5 shrink-0 ${ws.bar}`} />

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <FileSpreadsheet className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-semibold leading-snug">{batch.event_name}</p>
                            <p className="text-xs text-muted-foreground">{batch.event_year ?? '—'}</p>
                        </div>
                    </div>
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ws.badge}`}>
                        <WsIcon className="h-3 w-3" />
                        {ws.label}
                    </span>
                </div>

                <Separator />

                <div className="flex flex-1 flex-col gap-4 p-4">
                    {/* Template */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{batch.template_name}</span>
                    </div>

                    {/* Imported by */}
                    <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(batch.imported_by_name)}`}>
                            {initials(batch.imported_by_name)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight">{batch.imported_by_name}</p>
                            <p className="truncate text-xs text-muted-foreground">{batch.imported_by_email}</p>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-green-200 bg-green-50/60 px-3 py-2 dark:border-green-800 dark:bg-green-950/20">
                            <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                <p className="text-xs text-muted-foreground">Participants</p>
                            </div>
                            <p className="mt-0.5 text-2xl font-bold text-green-700 dark:text-green-400">{batch.participant_count}</p>
                        </div>
                        <div className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 dark:border-red-800 dark:bg-red-950/20">
                            <div className="flex items-center gap-1.5">
                                <XCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                                <p className="text-xs text-muted-foreground">Failed</p>
                            </div>
                            <p className="mt-0.5 text-2xl font-bold text-red-600 dark:text-red-400">{batch.failed_count}</p>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                        <p>Created: <span className="text-foreground">{fmt(batch.imported_at)}</span></p>
                        <p>Updated: <span className="text-foreground">{fmt(batch.updated_at)}</span></p>
                    </div>

                    {/* Email window */}
                    <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
                        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                            <CalendarClock className="h-3 w-3" /> Email Window
                        </p>
                        {batch.email_window_from ? (
                            <div className="space-y-0.5 text-xs">
                                <p className="text-muted-foreground">From: <span className="text-foreground">{fmt(batch.email_window_from)}</span></p>
                                <p className="text-muted-foreground">To: <span className="text-foreground">{fmt(batch.email_window_to)}</span></p>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">Not set</p>
                        )}
                        <WindowAction batch={batch} onSetWindow={onSetWindow} />
                    </div>
                </div>

                <Separator />

                {/* Footer */}
                <div className="flex gap-2 px-4 py-3">
                    <Button asChild className="flex-1" size="sm">
                        <Link href={`/participants/import/${batch.batch_id}/results`} target="_blank">
                            <Eye className="mr-2 h-3.5 w-3.5" /> View Results
                        </Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(batch)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Set-window dialog ─────────────────────────────────────────────────────────

function SetWindowDialog({ batch, open, onClose }: { batch: Batch; open: boolean; onClose: () => void }) {
    const form = useForm({
        email_window_from: toLocalInput(batch.email_window_from),
        email_window_to:   toLocalInput(batch.email_window_to),
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/participants/import/${batch.batch_id}/set-window`, { onSuccess: onClose });
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        {batch.window_status === 'not_set' ? 'Authorize send window' : 'Update send window'}
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                    {batch.event_name}{batch.event_year ? ` — ${batch.event_year}` : ''}
                </p>
                <form onSubmit={submit} className="space-y-4 pt-1">
                    <div className="space-y-1">
                        <Label>From</Label>
                        <Input type="datetime-local" value={form.data.email_window_from}
                            onChange={(e) => form.setData('email_window_from', e.target.value)} />
                        <InputError message={form.errors.email_window_from} />
                    </div>
                    <div className="space-y-1">
                        <Label>To</Label>
                        <Input type="datetime-local" value={form.data.email_window_to}
                            onChange={(e) => form.setData('email_window_to', e.target.value)} />
                        <InputError message={form.errors.email_window_to} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? 'Saving…' : 'Save Window'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ImportBatchesAdmin({ batches }: { batches: Batch[] }) {
    const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);
    const [windowBatch,   setWindowBatch]   = useState<Batch | null>(null);
    const [search,        setSearch]        = useState('');
    const [statusFilter,  setStatusFilter]  = useState<WindowStatus | 'all'>('all');
    const [userFilter,    setUserFilter]    = useState<string>('all');
    const [view, setView] = useState<'grid' | 'list'>(() =>
        (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') ?? 'grid',
    );

    function switchView(v: 'grid' | 'list') {
        setView(v);
        localStorage.setItem(VIEW_KEY, v);
    }

    // Unique users derived from batches (stable, no duplicates)
    const userOptions = useMemo(() => {
        const seen = new Map<string, string>();
        batches.forEach((b) => {
            if (!seen.has(b.imported_by_email)) {
                seen.set(b.imported_by_email, b.imported_by_name);
            }
        });
        
        return Array.from(seen.entries()).map(([email, name]) => ({ email, name }));
    }, [batches]);

    // Stats
    // const totalParticipants = batches.reduce((s, b) => s + b.participant_count, 0);
    const byStatus = {
        not_set:  batches.filter((b) => b.window_status === 'not_set').length,
        upcoming: batches.filter((b) => b.window_status === 'upcoming').length,
        active:   batches.filter((b) => b.window_status === 'active').length,
        expired:  batches.filter((b) => b.window_status === 'expired').length,
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return batches.filter((b) => {
            const matchesSearch = !q || [b.event_name, b.template_name, b.imported_by_name, b.imported_by_email]
                .some((v) => v?.toLowerCase().includes(q));
            const matchesStatus = statusFilter === 'all' || b.window_status === statusFilter;
            const matchesUser   = userFilter   === 'all' || b.imported_by_email === userFilter;

            return matchesSearch && matchesStatus && matchesUser;
        });
    }, [batches, search, statusFilter, userFilter]);

    function handleDeleteBatch() {
        if (!deletingBatch) {
            return;
        }

        router.delete(`/admin/import-batches/${deletingBatch.batch_id}`, {
            onFinish: () => setDeletingBatch(null),
        });
    }

    type StatConfig = {
        key: WindowStatus | 'all';
        label: string;
        value: number;
        icon: React.ElementType;
        iconBg?: string;
        iconColor?: string;
        valueColor?: string;
    };

    const STATS: StatConfig[] = [
        { key: 'all',      label: 'Total Batches', value: batches.length,    icon: FileSpreadsheet },
        { key: 'not_set',  label: 'Awaiting Auth', value: byStatus.not_set,  icon: AlertTriangle, iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', valueColor: 'text-amber-600 dark:text-amber-400' },
        { key: 'active',   label: 'Window Open',   value: byStatus.active,   icon: CheckCircle2,  iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400', valueColor: 'text-green-600 dark:text-green-400' },
        { key: 'upcoming', label: 'Scheduled',     value: byStatus.upcoming, icon: CalendarClock, iconBg: 'bg-blue-100 dark:bg-blue-900/30',   iconColor: 'text-blue-600 dark:text-blue-400',   valueColor: 'text-blue-600 dark:text-blue-400' },
        { key: 'expired',  label: 'Expired',       value: byStatus.expired,  icon: Clock,         iconBg: 'bg-red-100 dark:bg-red-900/30',     iconColor: 'text-red-600 dark:text-red-400',     valueColor: 'text-red-600 dark:text-red-400' },
    ];

    return (
        <>
            <Head title="Import Batches" />
            <div className="p-6">

                {/* Header */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Import Batches</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">All import history — authorize windows and manage batches</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {STATS.map(({ key, label, value, icon, iconBg, iconColor, valueColor }) => (
                        <FilterStatCard key={key} label={label} value={value} icon={icon}
                            iconBg={iconBg} iconColor={iconColor} valueColor={valueColor}
                            active={statusFilter === key}
                            onClick={() => setStatusFilter((prev) => prev === key ? 'all' : key as WindowStatus | 'all')}
                        />
                    ))}
                </div>

                {/* Filters + view toggle */}
                <div className="mb-4 flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by event, template, or importer…"
                            className="pl-9" />
                    </div>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WindowStatus | 'all')}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="not_set">Awaiting Auth</SelectItem>
                            <SelectItem value="upcoming">Scheduled</SelectItem>
                            <SelectItem value="active">Window Open</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={userFilter} onValueChange={setUserFilter}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="All users" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All users</SelectItem>
                            {userOptions.map(({ email, name }) => (
                                <SelectItem key={email} value={email}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* View toggle */}
                    <div className="flex overflow-hidden rounded-md border">
                        <button type="button" onClick={() => switchView('grid')} aria-label="Card view"
                            className={`flex items-center px-3 py-1.5 transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => switchView('list')} aria-label="List view"
                            className={`flex items-center px-3 py-1.5 transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                            <LayoutList className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                        <FileSpreadsheet className="mb-3 h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium text-muted-foreground">
                            {batches.length === 0 ? 'No import batches yet.' : 'No batches match your filters.'}
                        </p>
                    </div>
                )}

                {/* ── Card view ── */}
                {view === 'grid' && filtered.length > 0 && (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((batch) => (
                            <BatchCard key={batch.batch_id} batch={batch}
                                onDelete={setDeletingBatch}
                                onSetWindow={setWindowBatch}
                            />
                        ))}
                    </div>
                )}

                {/* ── List view ── */}
                {view === 'list' && filtered.length > 0 && (
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Event / Edition / Template</th>
                                    <th className="px-4 py-3 text-left font-medium">Imported By</th>
                                    <th className="px-4 py-3 text-center font-medium">Participants</th>
                                    <th className="px-4 py-3 text-left font-medium">Created / Updated</th>
                                    <th className="px-4 py-3 text-left font-medium">Email Window</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((batch) => {
                                    const ws = WS[batch.window_status];
                                    const WsIcon = ws.icon;
                                    
                                    return (
                                        <tr key={batch.batch_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">

                                            {/* Event / Edition / Template */}
                                            <td className="px-4 py-3">
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="w-16 shrink-0 font-medium text-muted-foreground">Event</span>
                                                        <span className="font-semibold text-foreground text-sm">{batch.event_name}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="w-16 shrink-0 font-medium text-muted-foreground">Edition</span>
                                                        <span>{batch.event_year ?? '—'}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="w-16 shrink-0 font-medium text-muted-foreground">Template</span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <LayoutTemplate className="h-3 w-3 shrink-0 text-muted-foreground" />
                                                            {batch.template_name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Imported By */}
                                            <td className="px-4 py-3">
                                                <div className="inline-flex items-center gap-2">
                                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(batch.imported_by_name)}`}>
                                                        {initials(batch.imported_by_name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium leading-tight">{batch.imported_by_name}</p>
                                                        <p className="text-xs text-muted-foreground">{batch.imported_by_email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Participants */}
                                            <td className="px-4 py-3 text-center">
                                                <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span className="text-lg font-bold text-foreground">{batch.participant_count}</span>
                                                </div>
                                                {batch.failed_count > 0 && (
                                                    <div className="mt-0.5 flex items-center justify-center gap-1 text-xs text-red-600 dark:text-red-400">
                                                        <XCircle className="h-3 w-3" />
                                                        {batch.failed_count} failed
                                                    </div>
                                                )}
                                            </td>

                                            {/* Created / Updated */}
                                            <td className="px-4 py-3 text-xs">
                                                <p className="text-muted-foreground">
                                                    <span className="font-medium text-foreground">Created</span><br />{fmt(batch.imported_at)}
                                                </p>
                                                <p className="mt-1.5 text-muted-foreground">
                                                    <span className="font-medium text-foreground">Updated</span><br />{fmt(batch.updated_at)}
                                                </p>
                                            </td>

                                            {/* Email Window */}
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${ws.badge}`}>
                                                    <WsIcon className="h-3 w-3" />
                                                    {ws.label}
                                                </span>
                                                {batch.email_window_from && (
                                                    <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                                                        <p>From: <span className="text-foreground">{fmt(batch.email_window_from)}</span></p>
                                                        <p>To:&nbsp;&nbsp;<span className="text-foreground">{fmt(batch.email_window_to)}</span></p>
                                                    </div>
                                                )}
                                                <WindowAction batch={batch} onSetWindow={setWindowBatch} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="inline-flex gap-2">
                                                    <Button asChild size="sm" variant="outline" title="View results">
                                                        <Link href={`/participants/import/${batch.batch_id}/results`} target="_blank">
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
                                                    <Button size="sm" variant="destructive" title="Delete batch" onClick={() => setDeletingBatch(batch)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {filtered.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        Showing {filtered.length} of {batches.length} batch{batches.length !== 1 ? 'es' : ''}
                    </p>
                )}
            </div>

            {/* Set-window dialog */}
            {windowBatch && (
                <SetWindowDialog batch={windowBatch} open={!!windowBatch} onClose={() => setWindowBatch(null)} />
            )}

            {/* Delete confirm dialog */}
            <Dialog open={!!deletingBatch} onOpenChange={() => setDeletingBatch(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Batch?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will permanently delete the{' '}
                        <strong>{deletingBatch?.event_name}{deletingBatch?.event_year ? ` (${deletingBatch.event_year})` : ''}</strong>{' '}
                        batch and all <strong>{deletingBatch?.participant_count} participant(s)</strong> associated with it.
                        This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingBatch(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteBatch}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ImportBatchesAdmin.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Import Batches', href: '/admin/import-batches' },
    ],
};
