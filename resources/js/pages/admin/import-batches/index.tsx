import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    Clock,
    Eye,
    FileSpreadsheet,
    ShieldCheck,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type Batch = {
    batch_id: string;
    event_name: string;
    event_year: number | null;
    imported_by_name: string;
    imported_by_email: string;
    participant_count: number;
    failed_count: number;
    imported_at: string;
    email_window_from: string | null;
    email_window_to: string | null;
    window_status: 'not_set' | 'upcoming' | 'active' | 'expired';
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function toLocalInput(iso: string | null) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function initials(name: string) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS = {
    not_set: {
        accent:     'bg-amber-400',
        badge:      'bg-amber-50 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-700',
        icon:       AlertTriangle,
        label:      'Awaiting Auth',
        windowText: null,
    },
    upcoming: {
        accent:     'bg-blue-400',
        badge:      'bg-blue-50 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-700',
        icon:       CalendarClock,
        label:      'Scheduled',
        windowText: 'Opens',
    },
    active: {
        accent:     'bg-green-400',
        badge:      'bg-green-50 text-green-700 ring-1 ring-green-300 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-700',
        icon:       CheckCircle2,
        label:      'Window Open',
        windowText: 'Closes',
    },
    expired: {
        accent:     'bg-red-400',
        badge:      'bg-red-50 text-red-700 ring-1 ring-red-300 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-700',
        icon:       Clock,
        label:      'Expired',
        windowText: 'Closed',
    },
} as const;

// ── Avatar ────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
    'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700',
    'bg-fuchsia-100 text-fuchsia-700',
];

function avatarColor(name: string) {
    let hash = 0;
    for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── BatchCard ─────────────────────────────────────────────────────────────────

function BatchCard({ batch, onDelete }: { batch: Batch; onDelete: () => void }) {
    const [showForm, setShowForm] = useState(batch.window_status === 'not_set');

    const form = useForm({
        email_window_from: toLocalInput(batch.email_window_from),
        email_window_to:   toLocalInput(batch.email_window_to),
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/participants/import/${batch.batch_id}/set-window`, {
            onSuccess: () => setShowForm(false),
        });
    }

    const s = STATUS[batch.window_status];
    const StatusIcon = s.icon;

    return (
        <div className="flex overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
            {/* Left status accent bar */}
            <div className={`w-1.5 shrink-0 ${s.accent}`} />

            <div className="flex min-w-0 flex-1 flex-col">
                {/* ── Header ────────────────────────────────────────────── */}
                <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <FileSpreadsheet className="h-4.5 w-4.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-[15px] font-semibold leading-snug">
                                {batch.event_name}
                                {batch.event_year && (
                                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                                        ({batch.event_year})
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {timeAgo(batch.imported_at)} · {fmt(batch.imported_at)}
                            </p>
                        </div>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.badge}`}>
                        <StatusIcon className="h-3 w-3" />
                        {s.label}
                    </span>
                </div>

                <Separator />

                {/* ── Body ──────────────────────────────────────────────── */}
                <div className="flex flex-1 flex-col gap-4 p-4">

                    {/* Importer */}
                    <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(batch.imported_by_name)}`}>
                            {initials(batch.imported_by_name)}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight">{batch.imported_by_name}</p>
                            <p className="truncate text-xs text-muted-foreground">{batch.imported_by_email}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-green-200 bg-green-50/60 px-3 py-2.5 dark:border-green-800 dark:bg-green-950/20">
                            <div className="flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <p className="mt-0.5 text-2xl font-bold text-green-700 dark:text-green-400">
                                {batch.participant_count}
                            </p>
                        </div>
                        <div className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-2.5 dark:border-red-800 dark:bg-red-950/20">
                            <div className="flex items-center gap-1.5">
                                <XCircle className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                                <p className="text-xs text-muted-foreground">Failed</p>
                            </div>
                            <p className="mt-0.5 text-2xl font-bold text-red-600 dark:text-red-400">
                                {batch.failed_count}
                            </p>
                        </div>
                    </div>

                    {/* Email window display */}
                    {batch.window_status !== 'not_set' && (
                        <div className="rounded-lg border bg-muted/30 px-3 py-3">
                            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                                <CalendarClock className="h-3 w-3" /> Email Window
                            </p>
                            <div className="space-y-1 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">From</span>
                                    <span className="font-medium">{fmt(batch.email_window_from)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">To</span>
                                    <span className="font-medium">{fmt(batch.email_window_to)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Set / update window form */}
                    {showForm ? (
                        <form onSubmit={submit} className="rounded-lg border bg-muted/20 p-3 space-y-3">
                            <p className="flex items-center gap-1.5 text-xs font-semibold">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                {batch.window_status === 'not_set' ? 'Authorize send window' : 'Update send window'}
                            </p>

                            {/* Stacked inputs — no more truncation */}
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">From</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.data.email_window_from}
                                        onChange={(e) => form.setData('email_window_from', e.target.value)}
                                        className="h-9 w-full text-sm"
                                    />
                                    <InputError message={form.errors.email_window_from} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">To</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.data.email_window_to}
                                        onChange={(e) => form.setData('email_window_to', e.target.value)}
                                        className="h-9 w-full text-sm"
                                    />
                                    <InputError message={form.errors.email_window_to} />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button type="submit" size="sm" disabled={form.processing} className="flex-1">
                                    {form.processing ? 'Saving…' : 'Save Window'}
                                </Button>
                                {batch.window_status !== 'not_set' && (
                                    <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {batch.window_status === 'expired' ? 'Set New Window' : 'Update Window'}
                        </button>
                    )}
                </div>

                <Separator />

                {/* ── Footer actions ─────────────────────────────────────── */}
                <div className="flex gap-2 px-4 py-3">
                    <Button asChild className="flex-1" size="sm">
                        <Link href={`/participants/import/${batch.batch_id}/results`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            View Results
                            <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-60" />
                        </Link>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ImportBatchesAdmin({ batches }: { batches: Batch[] }) {
    const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);

    function handleDeleteBatch() {
        if (!deletingBatch) return;
        router.delete(`/admin/import-batches/${deletingBatch.batch_id}`, {
            onFinish: () => setDeletingBatch(null),
        });
    }

    const totalPending = batches.reduce((s, b) => s + b.participant_count, 0);
    const byStatus = {
        not_set:  batches.filter((b) => b.window_status === 'not_set').length,
        upcoming: batches.filter((b) => b.window_status === 'upcoming').length,
        active:   batches.filter((b) => b.window_status === 'active').length,
        expired:  batches.filter((b) => b.window_status === 'expired').length,
    };

    return (
        <>
            <Head title="Pending Import Batches" />
            <div className="p-6">

                {/* ── Page header ─────────────────────────────────────────── */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Import Batches</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Authorize email send windows and monitor pending imports.
                    </p>
                </div>

                {/* ── Stats row ───────────────────────────────────────────── */}
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {/* Total */}
                    <div className="col-span-2 flex items-center gap-4 rounded-xl border bg-card px-5 py-4 sm:col-span-1">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground">Total</p>
                            <p className="text-3xl font-bold">{batches.length}</p>
                            <p className="text-xs text-muted-foreground">{totalPending} participants</p>
                        </div>
                    </div>
                    <StatCard label="Awaiting Auth" value={byStatus.not_set}  icon={AlertTriangle} color="amber" />
                    <StatCard label="Scheduled"     value={byStatus.upcoming} icon={CalendarClock} color="blue"  />
                    <StatCard label="Window Open"   value={byStatus.active}   icon={CheckCircle2}  color="green" />
                    <StatCard label="Expired"       value={byStatus.expired}  icon={Clock}         color="red"   />
                </div>

                {/* ── Cards grid ──────────────────────────────────────────── */}
                {batches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
                            <CheckCircle2 className="h-7 w-7 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold">All caught up!</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            No pending import batches at the moment.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {batches.map((batch) => (
                            <BatchCard
                                key={batch.batch_id}
                                batch={batch}
                                onDelete={() => setDeletingBatch(batch)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={!!deletingBatch} onOpenChange={() => setDeletingBatch(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Batch?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will permanently delete the <strong>{deletingBatch?.event_name} ({deletingBatch?.event_year})</strong> batch
                        and all <strong>{deletingBatch?.participant_count} participant(s)</strong> associated with it. This cannot be undone.
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

// ── StatCard ──────────────────────────────────────────────────────────────────

type Color = 'amber' | 'blue' | 'green' | 'red';

function StatCard({
    label, value, icon: Icon, color,
}: { label: string; value: number; icon: React.ElementType; color: Color }) {
    const styles: Record<Color, { wrap: string; icon: string }> = {
        amber: { wrap: 'border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20',   icon: 'text-amber-600 dark:text-amber-400' },
        blue:  { wrap: 'border-blue-200 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/20',       icon: 'text-blue-600 dark:text-blue-400' },
        green: { wrap: 'border-green-200 bg-green-50/60 dark:border-green-800 dark:bg-green-950/20',   icon: 'text-green-600 dark:text-green-400' },
        red:   { wrap: 'border-red-200 bg-red-50/60 dark:border-red-800 dark:bg-red-950/20',           icon: 'text-red-600 dark:text-red-400' },
    };
    const st = styles[color];
    return (
        <div className={`rounded-xl border px-4 py-4 ${st.wrap}`}>
            <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${st.icon}`} />
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
            </div>
            <p className={`mt-1 text-3xl font-bold ${st.icon}`}>{value}</p>
        </div>
    );
}

ImportBatchesAdmin.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Import Batches', href: '/admin/import-batches' },
    ],
};
