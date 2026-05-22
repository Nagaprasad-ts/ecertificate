import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBulkSelect } from '@/hooks/use-bulk-select';
import type { Auth } from '@/types';

type PendingBatch = {
    batch_id: string;
    event_name: string;
    count: number;
    imported_at: string;
    email_window_from: string | null;
    email_window_to: string | null;
    window_status: 'not_set' | 'upcoming' | 'active' | 'expired';
};
type Edition = { id: number; label: string };
type Participant = {
    id: number; name: string; email: string; usn: string | null;
    phone_no: string | null; certificate_no: string; edition_label: string;
};
type PaginatedParticipants = { data: Participant[]; links: { url: string | null; label: string; active: boolean }[] };

export default function ParticipantsIndex({
    participants, editions, filters, pendingBatches,
}: {
    participants: PaginatedParticipants;
    editions: Edition[];
    filters: { event_edition_id?: string; search?: string };
    pendingBatches: PendingBatch[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = auth.permissions.includes('batches.view-all');

    const [deleting, setDeleting] = useState<Participant | null>(null);
    const [bulkConfirm, setBulkConfirm] = useState(false);
    const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
    const [search, setSearch] = useState(filters.search ?? '');
    const { selected, count, isAllSelected, isIndeterminate, toggleAll, toggle, clear } = useBulkSelect(participants.data);

    function applyFilter(key: string, value: string) {
        router.get('/participants', { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true, replace: true });
    }



    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        applyFilter('search', search);
    }

    function handleDelete() {
        if (!deleting) return;
        router.delete(`/participants/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    function handleBulkDelete() {
        router.delete('/participants/bulk-destroy', {
            data: { ids: [...selected] },
            onFinish: () => { clear(); setBulkConfirm(false); },
        });
    }

    function handleDeleteAll() {
        router.delete('/participants/delete-all', {
            data: { event_edition_id: filters.event_edition_id, search: filters.search },
            onFinish: () => { clear(); setDeleteAllConfirm(false); },
        });
    }

    return (
        <>
            <Head title="Participants" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Participants</h1>
                    <div className="flex items-center gap-2">
                        {isSuperAdmin && count > 0 && (
                            <Button variant="destructive" onClick={() => setBulkConfirm(true)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({count})
                            </Button>
                        )}
                        {isSuperAdmin && (
                            <Button variant="destructive" onClick={() => setDeleteAllConfirm(true)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete All
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href="/participants/import/form"><Upload className="mr-2 h-4 w-4" /> Import Excel</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/participants/create"><Plus className="mr-2 h-4 w-4" /> Add Participant</Link>
                        </Button>
                    </div>
                </div>

                {/* Pending batches — visible to the importing user only */}
                {pendingBatches.length > 0 && (
                    <div className="mb-4 space-y-2">
                        {pendingBatches.map((batch) => {
                            const isActive = batch.window_status === 'active';
                            const borderColor = isActive
                                ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30'
                                : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30';
                            const textColor = isActive
                                ? 'text-green-800 dark:text-green-300'
                                : 'text-amber-800 dark:text-amber-300';
                            const statusLabel = {
                                not_set:  '— waiting for admin to authorize send window',
                                upcoming: '— send window scheduled',
                                active:   '— send window is OPEN now',
                                expired:  '— send window expired, contact admin',
                            }[batch.window_status];

                            return (
                                <div key={batch.batch_id} className={`flex items-center justify-between gap-4 rounded-md border px-4 py-3 ${borderColor}`}>
                                    <div className={`flex items-center gap-3 text-sm ${textColor}`}>
                                        <AlertTriangle className="h-4 w-4 shrink-0" />
                                        <span>
                                            <strong>{batch.count} participant{batch.count !== 1 ? 's' : ''}</strong> from{' '}
                                            <strong>{batch.event_name}</strong> are pending{statusLabel}.
                                        </span>
                                    </div>
                                    <Button size="sm" asChild className="shrink-0">
                                        <Link href={`/participants/import/${batch.batch_id}/results`}>Resume →</Link>
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Filters */}
                <div className="mb-4 flex gap-3">
                    <Select value={filters.event_edition_id ?? 'all'} onValueChange={(v) => applyFilter('event_edition_id', v)}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="All Editions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Editions</SelectItem>
                            {editions.map((ed) => (
                                <SelectItem key={ed.id} value={String(ed.id)}>{ed.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, USN, phone…" />
                        <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
                    </form>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                {isSuperAdmin && (
                                    <th className="w-10 px-4 py-3">
                                        <Checkbox
                                            checked={isAllSelected}
                                            ref={(el) => { if (el) (el as any).indeterminate = isIndeterminate; }}
                                            onCheckedChange={toggleAll}
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">USN</th>
                                <th className="px-4 py-3 text-left font-medium">Phone</th>
                                <th className="px-4 py-3 text-left font-medium">Event</th>
                                <th className="px-4 py-3 text-left font-medium">Certificate No</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.data.length === 0 ? (
                                <tr>
                                    <td colSpan={isSuperAdmin ? 8 : 7} className="px-4 py-10 text-center text-muted-foreground">
                                        No participants found.
                                    </td>
                                </tr>
                            ) : (
                                participants.data.map((p) => (
                                    <tr key={p.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                        {isSuperAdmin && (
                                            <td className="px-4 py-3">
                                                <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
                                            </td>
                                        )}
                                        <td className="px-4 py-3 font-medium">{p.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.usn ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.phone_no ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.edition_label}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.certificate_no}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/participants/${p.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleting(p)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex gap-1">
                    {participants.links.map((link, i) => (
                        <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm"
                            disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            {/* Single delete */}
            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Participant</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <strong>{deleting?.name}</strong>? Their certificate <code className="text-xs">{deleting?.certificate_no}</code> will be removed permanently.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete all */}
            <Dialog open={deleteAllConfirm} onOpenChange={setDeleteAllConfirm}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete All Participants?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will permanently delete <strong>every participant</strong>
                        {filters.event_id || filters.search ? ' matching the current filters' : ' in the entire system'}.
                        This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteAllConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteAll}>Yes, Delete All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk delete */}
            <Dialog open={bulkConfirm} onOpenChange={setBulkConfirm}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete {count} Participant{count !== 1 ? 's' : ''}?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        This will permanently delete {count} selected participant{count !== 1 ? 's' : ''} and their certificates. This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleBulkDelete}>Delete All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ParticipantsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Participants', href: '/participants' },
    ],
};
