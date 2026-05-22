import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBulkSelect } from '@/hooks/use-bulk-select';
import type { Auth } from '@/types';

type Signature = { id: number; name: string; designation: string; signature: string; resignation_date: string };

const VIEW_KEY = 'signatures-view';

export default function SignaturesIndex({ signatures }: { signatures: Signature[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = (auth.user as any).role?.slug === 'super_admin';

    const [view, setView]       = useState<'grid' | 'list'>(() =>
        (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') ?? 'grid',
    );
    const [search, setSearch]         = useState('');
    const [deleting, setDeleting]     = useState<Signature | null>(null);
    const [bulkConfirm, setBulkConfirm] = useState(false);
    const { selected, count, isAllSelected, isIndeterminate, toggleAll, toggle, clear } = useBulkSelect(signatures);

    const q       = search.trim().toLowerCase();
    const visible = q
        ? signatures.filter((s) =>
            s.name.toLowerCase().includes(q) ||
            s.designation.toLowerCase().includes(q),
          )
        : signatures;

    function switchView(v: 'grid' | 'list') {
        setView(v);
        localStorage.setItem(VIEW_KEY, v);
    }

    function handleDelete() {
        if (!deleting) return;
        router.delete(`/signatures/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    function handleBulkDelete() {
        router.delete('/signatures/bulk-destroy', {
            data: { ids: [...selected] },
            onFinish: () => { clear(); setBulkConfirm(false); },
        });
    }

    return (
        <>
            <Head title="Signatures" />
            <div className="p-6">

                <PageHeader
                    title="Signatures"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name or designation…"
                    view={view}
                    onViewChange={switchView}
                    actions={
                        <>
                            {isSuperAdmin && count > 0 && (
                                <Button variant="destructive" onClick={() => setBulkConfirm(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({count})
                                </Button>
                            )}
                            <Button asChild>
                                <Link href="/signatures/create"><Plus className="mr-2 h-4 w-4" /> Add Signature</Link>
                            </Button>
                        </>
                    }
                />

                {signatures.length === 0 ? (
                    <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground shadow-sm">
                        No signatures yet. Add your first signature.
                    </div>
                ) : visible.length === 0 ? (
                    <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground shadow-sm">
                        No signatures match <strong>"{search}"</strong>.
                    </div>
                ) : view === 'grid' ? (
                    /* ── Grid view ── */
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {visible.map((sig) => (
                            <div
                                key={sig.id}
                                className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                            >
                                {/* Checkbox overlay */}
                                {isSuperAdmin && (
                                    <div className="absolute left-3 top-3">
                                        <Checkbox
                                            checked={selected.has(sig.id)}
                                            onCheckedChange={() => toggle(sig.id)}
                                        />
                                    </div>
                                )}

                                {/* Signature image */}
                                <div className="flex h-20 w-full items-center justify-center rounded-lg bg-muted p-2">
                                    <img
                                        src={`/storage/${sig.signature}`}
                                        alt={sig.name}
                                        className="max-h-16 max-w-full object-contain"
                                    />
                                </div>

                                {/* Meta */}
                                <div>
                                    <p className="truncate font-medium leading-tight">{sig.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{sig.designation}</p>
                                    {sig.resignation_date && (
                                        <p className="mt-0.5 text-xs text-muted-foreground/70">Until {sig.resignation_date}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="mt-auto flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/signatures/${sig.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => setDeleting(sig)}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ── List view ── */
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
                                    <th className="px-4 py-3 text-left font-medium">Signature</th>
                                    <th className="px-4 py-3 text-left font-medium">Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Designation</th>
                                    <th className="px-4 py-3 text-left font-medium">Resignation Date</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((sig) => (
                                    <tr key={sig.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                        {isSuperAdmin && (
                                            <td className="px-4 py-3">
                                                <Checkbox checked={selected.has(sig.id)} onCheckedChange={() => toggle(sig.id)} />
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <img src={`/storage/${sig.signature}`} alt={sig.name} className="h-10 w-24 rounded border bg-muted object-contain" />
                                        </td>
                                        <td className="px-4 py-3 font-medium">{sig.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{sig.designation}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{sig.resignation_date ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/signatures/${sig.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleting(sig)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Signature</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Delete signature of <strong>{deleting?.name}</strong>? This cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={bulkConfirm} onOpenChange={setBulkConfirm}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete {count} Signature{count !== 1 ? 's' : ''}?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">This will permanently delete {count} selected signature{count !== 1 ? 's' : ''}. This cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleBulkDelete}>Delete All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

SignaturesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Signatures', href: '/signatures' },
    ],
};
