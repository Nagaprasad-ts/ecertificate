import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Role = { id: number; name: string; slug: string };
type User = { id: number; name: string; email: string; role: Role | null; created_at: string };

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    super_admin: 'default',
    admin: 'secondary',
    viewer: 'outline',
};

export default function UsersIndex({ users }: { users: User[] }) {
    const [deleting, setDeleting] = useState<User | null>(null);

    function handleDelete() {
        if (!deleting) return;
        router.delete(`/admin/users/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <>
            <Head title="Users" />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Users</h1>
                    <Button asChild>
                        <Link href="/admin/users/create"><Plus className="mr-2 h-4 w-4" /> Add User</Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium">Name</th>
                                <th className="px-4 py-3 text-left font-medium">Email</th>
                                <th className="px-4 py-3 text-left font-medium">Role</th>
                                <th className="px-4 py-3 text-left font-medium">Created</th>
                                <th className="px-4 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No users found.</td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                    <td className="px-4 py-3">
                                        {user.role ? (
                                            <Badge variant={roleBadgeVariant[user.role.slug] ?? 'outline'}>
                                                {user.role.name}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No role</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{user.created_at}</td>
                                    <td className="px-4 py-3">
                                        {user.role?.slug !== 'super_admin' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/users/${user.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => setDeleting(user)}>
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
                    <DialogHeader><DialogTitle>Delete User</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <strong>{deleting?.name}</strong> ({deleting?.email})? This cannot be undone.
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

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/admin/users' },
    ],
};
