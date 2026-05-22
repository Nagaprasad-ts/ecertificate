import { Head, Link, router } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Permission = { id: number; name: string; slug: string; page: string };

export default function PermissionsIndex({ permissions }: { permissions: Record<string, Permission[]> }) {
    const [deleting, setDeleting] = useState<Permission | null>(null);

    function handleDelete() {
        if (!deleting) return;
        router.delete(`/admin/permissions/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <>
            <Head title="Permissions" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Permissions</h1>
                    <Button asChild>
                        <Link href="/admin/permissions/create"><Plus className="mr-2 h-4 w-4" /> Add Permission</Link>
                    </Button>
                </div>

                <div className="space-y-4">
                    {Object.entries(permissions).map(([page, perms]) => (
                        <div key={page} className="rounded-md border">
                            <div className="border-b bg-muted/50 px-4 py-2">
                                <h2 className="text-sm font-semibold capitalize">{page}</h2>
                            </div>
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/20">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Name</th>
                                        <th className="px-4 py-2 text-left font-medium">Slug</th>
                                        <th className="px-4 py-2 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {perms.map((perm) => (
                                        <tr key={perm.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                            <td className="px-4 py-2 font-medium">{perm.name}</td>
                                            <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{perm.slug}</td>
                                            <td className="px-4 py-2">
                                                <div className="flex justify-end">
                                                    <Button variant="destructive" size="sm" onClick={() => setDeleting(perm)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}

                    {Object.keys(permissions).length === 0 && (
                        <p className="py-10 text-center text-muted-foreground">No permissions found.</p>
                    )}
                </div>
            </div>

            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Permission</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <strong>{deleting?.name}</strong> (<code className="text-xs">{deleting?.slug}</code>)?
                        It will be removed from all roles. This cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

PermissionsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Permissions', href: '/admin/permissions' },
    ],
};
