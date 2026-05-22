import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, CheckCircle2, Clock, Eye, Lock, Mail, ShieldCheck, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Auth } from '@/types';

type ImportedRow = {
    id: number;
    name: string;
    email: string;
    usn: string | null;
    phone_no: string | null;
    certificate_no: string;
};

type FailedRow = {
    row: number;
    name: string;
    email: string;
    reason: string;
};

type BatchInfo = {
    event_name: string;
    event_year: number | null;
    participant_count: number;
    failed_count: number;
    email_window_from: string | null;  // ISO string
    email_window_to: string | null;    // ISO string
    window_status: 'not_set' | 'upcoming' | 'active' | 'expired';
};

function fmt(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

// datetime-local input needs "YYYY-MM-DDTHH:mm"
function toLocalInput(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ImportResults({
    batchId,
    imported,
    failures,
    notFound,
    batch,
}: {
    batchId: string;
    imported: ImportedRow[];
    failures: FailedRow[];
    notFound: boolean;
    batch: BatchInfo | null;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const canSetWindow = auth.permissions.includes('batches.set-window');

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [discardOpen, setDiscardOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const windowForm = useForm({
        email_window_from: toLocalInput(batch?.email_window_from ?? null),
        email_window_to:   toLocalInput(batch?.email_window_to ?? null),
    });

    const windowStatus = batch?.window_status ?? 'not_set';
    const canSend = windowStatus === 'active';
    const total = imported.length + failures.length;

    function handleConfirm() {
        setSubmitting(true);
        router.post(`/participants/import/${batchId}/confirm`, {}, {
            onFinish: () => { setSubmitting(false); setConfirmOpen(false); },
        });
    }

    function handleDiscard() {
        setSubmitting(true);
        router.delete(`/participants/import/${batchId}/discard`, {
            onFinish: () => { setSubmitting(false); setDiscardOpen(false); },
        });
    }

    function handleSetWindow(e: React.FormEvent) {
        e.preventDefault();
        windowForm.post(`/participants/import/${batchId}/set-window`);
    }

    if (notFound) {
        return (
            <>
                <Head title="Import Results" />
                <div className="flex flex-col items-center justify-center p-6 py-20 text-center">
                    <XCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h2 className="mb-2 text-xl font-semibold">Batch not found</h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                        This import batch has already been confirmed, discarded, or never existed.
                    </p>
                    <Button asChild><Link href="/participants">Go to Participants</Link></Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Import Results" />
            <div className="p-6">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold">Import Results</h1>
                        {batch?.event_name && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {batch.event_name}{batch.event_year ? ` (${batch.event_year})` : ''} — {total} row{total !== 1 ? 's' : ''} processed
                            </p>
                        )}
                    </div>

                    {imported.length > 0 && (
                        <div className="flex shrink-0 gap-2">
                            <Button variant="destructive" onClick={() => setDiscardOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Discard
                            </Button>
                            <Button
                                onClick={() => setConfirmOpen(true)}
                                disabled={!canSend}
                                title={!canSend ? 'Email sending is not authorized yet' : undefined}
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Send Certificates &amp; Confirm ({imported.length})
                            </Button>
                        </div>
                    )}
                </div>

                {/* ── Email window status card ─────────────────────────────── */}
                <div className="mb-6">
                    <EmailWindowCard
                        status={windowStatus}
                        from={batch?.email_window_from ?? null}
                        to={batch?.email_window_to ?? null}
                    />
                </div>

                {/* ── Super-admin: set / edit email window ─────────────────── */}
                {canSetWindow && imported.length > 0 && (
                    <div className="mb-8 rounded-md border bg-muted/30 p-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            {windowStatus === 'not_set' ? 'Authorize email sending window' : 'Update email sending window'}
                        </div>
                        <form onSubmit={handleSetWindow} className="flex flex-wrap items-end gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="wf">From</Label>
                                <Input
                                    id="wf"
                                    type="datetime-local"
                                    value={windowForm.data.email_window_from}
                                    onChange={(e) => windowForm.setData('email_window_from', e.target.value)}
                                    className="w-56"
                                />
                                <InputError message={windowForm.errors.email_window_from} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="wt">To</Label>
                                <Input
                                    id="wt"
                                    type="datetime-local"
                                    value={windowForm.data.email_window_to}
                                    onChange={(e) => windowForm.setData('email_window_to', e.target.value)}
                                    className="w-56"
                                />
                                <InputError message={windowForm.errors.email_window_to} />
                            </div>
                            <Button type="submit" disabled={windowForm.processing}>
                                {windowForm.processing ? 'Saving…' : windowStatus === 'not_set' ? 'Set Window' : 'Update Window'}
                            </Button>
                        </form>
                        <p className="mt-2 text-xs text-muted-foreground">
                            The "Send Certificates &amp; Confirm" button will only be active between these dates.
                        </p>
                    </div>
                )}

                {/* ── Summary cards ───────────────────────────────────────── */}
                <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-950/20">
                        <div className="mb-1 flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
                        </div>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-400">{imported.length}</p>
                    </div>

                    <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/20">
                        <div className="mb-1 flex items-center gap-2 text-red-700 dark:text-red-400">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Failed</span>
                        </div>
                        <p className="text-3xl font-bold text-red-700 dark:text-red-400">{failures.length}</p>
                    </div>
                </div>

                {/* ── Failed rows ─────────────────────────────────────────── */}
                {failures.length > 0 && (
                    <div className="mb-8">
                        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-red-700 dark:text-red-400">
                            <XCircle className="h-4 w-4" /> Failed Rows
                            <span className="text-xs font-normal text-muted-foreground">(will not be imported)</span>
                        </h2>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Row #</th>
                                        <th className="px-4 py-3 text-left font-medium">Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Email</th>
                                        <th className="px-4 py-3 text-left font-medium">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {failures.map((f, i) => (
                                        <tr key={i} className="border-b last:border-0 bg-red-50/40 dark:bg-red-950/10">
                                            <td className="px-4 py-3 font-mono text-xs">{f.row}</td>
                                            <td className="px-4 py-3">{f.name || <span className="italic text-muted-foreground">—</span>}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{f.email || '—'}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="destructive" className="font-normal">{f.reason}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Pending participants ─────────────────────────────────── */}
                {imported.length > 0 && (
                    <div>
                        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
                            <CheckCircle2 className="h-4 w-4 text-green-600" /> Pending Participants
                            <span className="text-xs font-normal text-muted-foreground">(awaiting email authorization)</span>
                        </h2>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Email</th>
                                        <th className="px-4 py-3 text-left font-medium">USN</th>
                                        <th className="px-4 py-3 text-left font-medium">Phone</th>
                                        <th className="px-4 py-3 text-left font-medium">Certificate No</th>
                                        <th className="px-4 py-3 text-right font-medium">Preview</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {imported.map((p) => (
                                        <tr key={p.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-3 font-medium">{p.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{p.usn ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{p.phone_no ?? '—'}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.certificate_no}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="outline" size="sm" asChild title="Preview certificate">
                                                    <Link href={`/certificates/${p.id}/preview`} target="_blank">
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                            <Button onClick={() => setConfirmOpen(true)} disabled={!canSend}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Certificates &amp; Confirm ({imported.length})
                            </Button>
                            {!canSend && (
                                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Lock className="h-3.5 w-3.5" />
                                    {windowStatus === 'not_set' && 'Waiting for admin to authorize a send window'}
                                    {windowStatus === 'upcoming' && `Opens ${fmt(batch?.email_window_from ?? null)}`}
                                    {windowStatus === 'expired' && 'Send window has expired — ask admin to set a new one'}
                                </span>
                            )}
                            <Button variant="ghost" asChild>
                                <Link href="/participants">Back to Participants</Link>
                            </Button>
                        </div>
                    </div>
                )}

                {imported.length === 0 && failures.length === 0 && !notFound && (
                    <p className="py-10 text-center text-muted-foreground">
                        The file was empty — no rows to process.
                    </p>
                )}
            </div>

            {/* ── Confirm dialog ──────────────────────────────────────────── */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Send Certificates &amp; Confirm?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will permanently save <strong>{imported.length} participant{imported.length !== 1 ? 's' : ''}</strong> and
                        send their certificate emails. This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={submitting}>
                            {submitting ? 'Sending…' : 'Yes, Send & Confirm'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Discard dialog ──────────────────────────────────────────── */}
            <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Discard This Import?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        All <strong>{imported.length} pending row{imported.length !== 1 ? 's' : ''}</strong> will be
                        permanently deleted and no certificates will be sent.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDiscardOpen(false)} disabled={submitting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDiscard} disabled={submitting}>
                            {submitting ? 'Discarding…' : 'Yes, Discard'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ── Email window status card ─────────────────────────────────────────────────

function EmailWindowCard({
    status,
    from,
    to,
}: {
    status: 'not_set' | 'upcoming' | 'active' | 'expired';
    from: string | null;
    to: string | null;
}) {
    if (status === 'not_set') {
        return (
            <div className="flex items-center gap-3 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                    <strong>Pending authorization.</strong> An administrator must set an email send window before certificates can be sent.
                </div>
            </div>
        );
    }

    if (status === 'upcoming') {
        return (
            <div className="flex items-center gap-3 rounded-md border border-blue-300 bg-blue-50 px-4 py-3 dark:border-blue-700 dark:bg-blue-950/30">
                <CalendarClock className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <div className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Send window scheduled.</strong> Certificates can be sent between{' '}
                    <strong>{fmt(from)}</strong> and <strong>{fmt(to)}</strong>.
                    The button will enable automatically when the window opens.
                </div>
            </div>
        );
    }

    if (status === 'active') {
        return (
            <div className="flex items-center gap-3 rounded-md border border-green-300 bg-green-50 px-4 py-3 dark:border-green-700 dark:bg-green-950/30">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                <div className="text-sm text-green-800 dark:text-green-300">
                    <strong>Send window is open.</strong> You can send certificates now. Window closes at <strong>{fmt(to)}</strong>.
                </div>
            </div>
        );
    }

    // expired
    return (
        <div className="flex items-center gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 dark:border-red-700 dark:bg-red-950/30">
            <Clock className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
            <div className="text-sm text-red-800 dark:text-red-300">
                <strong>Send window expired</strong> ({fmt(from)} – {fmt(to)}).
                Contact an administrator to set a new window.
            </div>
        </div>
    );
}

ImportResults.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Participants', href: '/participants' },
        { title: 'Import', href: '/participants/import/form' },
        { title: 'Results', href: '#' },
    ],
};
