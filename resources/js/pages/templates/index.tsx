import { Head, Link, router, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBulkSelect } from '@/hooks/use-bulk-select';
import type { Auth } from '@/types';

type Template = { id: number; name: string; template_file: string };

export default function TemplatesIndex({ templates }: { templates: Template[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const canCreate = auth.is_super_admin || auth.permissions.includes('templates.create');
    const canUpdate = auth.is_super_admin || auth.permissions.includes('templates.update');
    const canDelete = auth.is_super_admin || auth.permissions.includes('templates.delete');

    const [search, setSearch]         = useState('');
    const [deleting, setDeleting]     = useState<Template | null>(null);
    const [bulkConfirm, setBulkConfirm] = useState(false);
    const { selected, count, isAllSelected, isIndeterminate, toggleAll, toggle, clear } = useBulkSelect(templates);

    const q       = search.trim().toLowerCase();
    const visible = q
        ? templates.filter((t) =>
            t.name.toLowerCase().includes(q) ||
            t.template_file.toLowerCase().includes(q),
          )
        : templates;

    function handleDelete() {
        if (!deleting) return;
        router.delete(`/templates/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    function handleBulkDelete() {
        router.delete('/templates/bulk-destroy', {
            data: { ids: [...selected] },
            onFinish: () => { clear(); setBulkConfirm(false); },
        });
    }

    return (
        <>
            <Head title="Templates" />
            <div className="p-6">
                <PageHeader
                    title="Templates"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search by name or file…"
                    actions={
                        <>
                            {canDelete && count > 0 && (
                                <Button variant="destructive" onClick={() => setBulkConfirm(true)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Selected ({count})
                                </Button>
                            )}
                            {canCreate && (
                                <Button asChild>
                                    <Link href="/templates/create"><Plus className="mr-2 h-4 w-4" /> Add Template</Link>
                                </Button>
                            )}
                        </>
                    }
                />

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                {canDelete && (
                                    <th className="w-10 px-4 py-3">
                                        <Checkbox
                                            checked={isAllSelected}
                                            ref={(el) => { if (el) (el as any).indeterminate = isIndeterminate; }}
                                            onCheckedChange={toggleAll}
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Template File</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.length === 0 ? (
                                <tr>
                                    <td colSpan={canDelete ? 4 : 3} className="px-4 py-10 text-center text-muted-foreground">
                                        No templates yet. Add your first template.
                                    </td>
                                </tr>
                            ) : visible.length === 0 ? (
                                <tr>
                                    <td colSpan={canDelete ? 4 : 3} className="px-4 py-10 text-center text-muted-foreground">
                                        No templates match <strong>"{search}"</strong>.
                                    </td>
                                </tr>
                            ) : (
                                visible.map((tpl) => (
                                    <tr key={tpl.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                        {canDelete && (
                                            <td className="px-4 py-3">
                                                <Checkbox checked={selected.has(tpl.id)} onCheckedChange={() => toggle(tpl.id)} />
                                            </td>
                                        )}
                                        <td className="px-4 py-3 font-medium">{tpl.name}</td>
                                        <td className="max-w-sm truncate px-4 py-3 font-mono text-xs text-muted-foreground">{tpl.template_file}</td>
                                        <td className="px-4 py-3">
                                            {(canUpdate || canDelete) && (
                                                <div className="flex items-center justify-end gap-2">
                                                    {canUpdate && (
                                                        <Button variant="secondary" size="sm" asChild>
                                                            <Link href={`/templates/${tpl.id}/preview`} target="_blank"><Eye className="h-3.5 w-3.5" /></Link>
                                                        </Button>
                                                    )}
                                                    {canUpdate && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/templates/${tpl.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button variant="destructive" size="sm" onClick={() => setDeleting(tpl)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Template</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">Delete <strong>{deleting?.name}</strong>? This cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={bulkConfirm} onOpenChange={setBulkConfirm}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete {count} Template{count !== 1 ? 's' : ''}?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">This will permanently delete {count} selected template{count !== 1 ? 's' : ''}. This cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkConfirm(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleBulkDelete}>Delete All</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

TemplatesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Templates', href: '/templates' },
    ],
};
