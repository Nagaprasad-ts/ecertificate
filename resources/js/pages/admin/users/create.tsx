import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Role = { id: number; name: string; slug: string };

export default function UsersCreate({ roles }: { roles: Role[] }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        password: '',
        role_id: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/users');
    }

    return (
        <>
            <Head title="Add User" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Add User</h1>
                <form onSubmit={submit} className="max-w-lg space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Full name" />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} placeholder="email@example.com" />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        <InputError message={errors.password} />
                    </div>

                    <div className="space-y-1">
                        <Label>Role</Label>
                        <Select value={data.role_id} onValueChange={(v) => setData('role_id', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role…" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((r) => (
                                    <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role_id} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Create User'}</Button>
                        <Button variant="outline" asChild><Link href="/admin/users">Cancel</Link></Button>
                    </div>
                </form>
            </div>
        </>
    );
}

UsersCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/admin/users' },
        { title: 'Add User', href: '/admin/users/create' },
    ],
};
