import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Role = { id: number; name: string; slug: string; permissions_count: number; users_count: number };

export default function RolesIndex({ roles }: { roles: Role[] }) {
    const [deleting, setDeleting] = useState<Role | null>(null);

    function handleDelete() {
        if (!deleting) return;
        router.delete(`/admin/roles/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <>
            <Head title="Roles" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Roles</h1>
                    <Button asChild>
                        <Link href="/admin/roles/create"><Plus className="mr-2 h-4 w-4" /> Add Role</Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Slug</th>
                                <th className="px-4 py-3 text-center font-medium">Permissions</th>
                                <th className="px-4 py-3 text-center font-medium">Users</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No roles found.</td>
                                </tr>
                            ) : roles.map((role) => (
                                <tr key={role.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{role.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{role.slug}</td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">{role.permissions_count}</td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">{role.users_count}</td>
                                    <td className="px-4 py-3">
                                        {role.slug !== 'super_admin' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/roles/${role.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleting(role)} disabled={role.users_count > 0}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Role</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete role <strong>{deleting?.name}</strong>? Its permissions will be detached. This cannot be undone.
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

RolesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles', href: '/admin/roles' },
    ],
};
