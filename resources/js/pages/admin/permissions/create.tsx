import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PermissionsCreate() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        slug: '',
        page: '',
    });

    // Auto-generate slug from page + name
    function handleNameChange(name: string) {
        setData((prev) => ({
            ...prev,
            name,
            slug: prev.page ? `${prev.page}.${name.toLowerCase().replace(/\s+/g, '_')}` : prev.slug,
        }));
    }

    function handlePageChange(page: string) {
        const cleaned = page.toLowerCase().replace(/\s+/g, '_');
        setData((prev) => ({
            ...prev,
            page: cleaned,
            slug: prev.name ? `${cleaned}.${prev.name.toLowerCase().replace(/\s+/g, '_')}` : prev.slug,
        }));
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/permissions');
    }

    return (
        <>
            <Head title="Add Permission" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Add Permission</h1>
                <form onSubmit={submit} className="max-w-lg space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="page">Page</Label>
                        <Input
                            id="page"
                            value={data.page}
                            onChange={(e) => handlePageChange(e.target.value)}
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
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. export"
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
                        <p className="text-xs text-muted-foreground">Format: <code>page.action</code> — auto-generated but editable.</p>
                        <InputError message={errors.slug} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Create Permission'}</Button>
                        <Button variant="outline" asChild><Link href="/admin/permissions">Cancel</Link></Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PermissionsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Permissions', href: '/admin/permissions' },
        { title: 'Add Permission', href: '/admin/permissions/create' },
    ],
};
