import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Permission = { id: number; name: string; slug: string; page: string };

export default function PermissionsEdit({ permission }: { permission: Permission }) {
    const { data, setData, put, errors, processing } = useForm({
        name: permission.name,
        slug: permission.slug,
        page: permission.page,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/admin/permissions/${permission.id}`);
    }

    return (
        <>
            <Head title="Edit Permission" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Edit Permission</h1>
                <form onSubmit={submit} className="max-w-lg space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="page">Page</Label>
                        <Input
                            id="page"
                            value={data.page}
                            onChange={(e) => setData('page', e.target.value)}
                            placeholder="e.g. reports"
                        />
                        <p className="text-xs text-muted-foreground">The resource/page this permission belongs to.</p>
                        <InputError message={errors.page} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="name">Action Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Export Reports"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            placeholder="e.g. reports.export"
                            className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">Format: <code>page.action</code></p>
                        <InputError message={errors.slug} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Save Changes'}</Button>
                        <Button variant="outline" asChild><Link href="/admin/permissions">Cancel</Link></Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PermissionsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Permissions', href: '/admin/permissions' },
        { title: 'Edit Permission', href: '#' },
    ],
};
