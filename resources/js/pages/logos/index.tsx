import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBulkSelect } from '@/hooks/use-bulk-select';
import type { Auth } from '@/types';

type Logo = { id: number; year: number; logo_name: string; logo: string };

const VIEW_KEY = 'logos-view';

export default function LogosIndex({ logos }: { logos: Logo[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = (auth.user as any).role?.slug === 'super_admin';

    const [view, setView]       = useState<'grid' | 'list'>(() =>
        (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') ?? 'grid',
    );
    const [search, setSearch]         = useState('');
    const [deleting, setDeleting]     = useState<Logo | null>(null);
    const [bulkConfirm, setBulkConfirm] = useState(false);
    const { selected, count, isAllSelected, isIndeterminate, toggleAll, toggle, clear } = useBulkSelect(logos);

    const q       = search.trim().toLowerCase();
    const visible = q
        ? logos.filter((l) => l.logo_name.toLowerCase().includes(q) || String(l.year).includes(q))
        : logos;

    function switchView(v: 'grid' | 'list') {
        setView(v);
        localStorage.setItem(VIEW_KEY, v);
    }

    function handleDelete() {
        if (!deleting) return;
        router.delete(`/logos/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    function handleBulkDelete() {
        router.delete('/logos/bulk-destroy', {
            data: { ids: [...selected] },
            onFinish: () => { clear(); setBulkConfirm(false); },
        });
    }

    return (
        <>
            <Head title="Logos" />
            <div className="p-6">

                <PageHeader
                    title="Logos"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name or year…"
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
                                <Link href="/logos/create"><Plus className="mr-2 h-4 w-4" /> Add Logo</Link>
                            </Button>
                        </>
                    }
                />

                {logos.length === 0 ? (
                    <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground shadow-sm">
                        No logos yet. Add your first logo.
                    </div>
                ) : visible.length === 0 ? (
                    <div className="rounded-xl border bg-card py-16 text-center text-muted-foreground shadow-sm">
                        No logos match <strong>"{search}"</strong>.
                    </div>
                ) : view === 'grid' ? (
                    /* ── Grid view ── */
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {visible.map((logo) => (
                            <div
                                key={logo.id}
                                className="group relative flex flex-col items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                            >
                                {/* Checkbox overlay */}
                                {isSuperAdmin && (
                                    <div className="absolute left-3 top-3">
                                        <Checkbox
                                            checked={selected.has(logo.id)}
                                            onCheckedChange={() => toggle(logo.id)}
                                        />
                                    </div>
                                )}

                                {/* Logo image */}
                                <div className="flex h-24 w-full items-center justify-center rounded-lg bg-muted p-2">
                                    <img
                                        src={`/storage/${logo.logo}`}
                                        alt={logo.logo_name}
                                        className="max-h-20 max-w-full object-contain"
                                    />
                                </div>

                                {/* Meta */}
                                <div className="w-full text-center">
                                    <p className="truncate font-medium leading-tight">{logo.logo_name}</p>
                                    <p className="text-xs text-muted-foreground">{logo.year}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex w-full gap-2">
                                    <Button variant="outline" size="sm" className="flex-1" asChild>
                                        <Link href={`/logos/${logo.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => setDeleting(logo)}>
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
                                    <th className="px-4 py-3 text-left font-medium">Logo</th>
                                    <th className="px-4 py-3 text-left font-medium">Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Year</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((logo) => (
                                    <tr key={logo.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                        {isSuperAdmin && (
                                            <td className="px-4 py-3">
                                                <Checkbox checked={selected.has(logo.id)} onCheckedChange={() => toggle(logo.id)} />
                                            </td>
                                        )}
                                        <td className="px-4 py-3">
                                            <img src={`/storage/${logo.logo}`} alt={logo.logo_name} className="h-10 w-10 rounded border bg-muted object-contain" />
                                        </td>
                                        <td className="px-4 py-3 font-medium">{logo.logo_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{logo.year}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/logos/${logo.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleting(logo)}>
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

            {/* Single delete */}
            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Logo</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.logo_name}</strong>? This cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk delete */}
            <Dialog open={bulkConfirm} onOpenChange={setBulkConfirm}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete {count} Logo{count !== 1 ? 's' : ''}?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">This will permanently delete the selected {count} logo{count !== 1 ? 's' : ''}. This cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleBulkDelete}>Delete All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

LogosIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Logos', href: '/logos' },
    ],
};
