import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import RoleForm from './partials/RoleForm';

type Permission = { id: number; name: string; slug: string; page: string };

export default function RolesCreate({ permissions }: { permissions: Record<string, Permission[]> }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        permission_ids: [] as number[],
    });

    function submit(e: SyntheticEvent) {
        e.preventDefault();
        post('/admin/roles');
    }

    return (
        <>
            <Head title="Create Role" />
            <div className="p-6">
                <Link
                    href="/admin/roles"
                    className="mb-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to roles
                </Link>

                <div className="mb-8">
                    <h1 className="text-xl font-semibold">Create role</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Define a role and assign the permissions it grants.
                    </p>
                </div>

                <RoleForm
                    data={data}
                    errors={errors}
                    processing={processing}
                    permissions={permissions}
                    submitLabel="Create role"
                    onSubmit={submit}
                    onChange={(key, value) => setData(key, value)}
                />
            </div>
        </>
    );
}

RolesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles', href: '/admin/roles' },
        { title: 'Create Role', href: '/admin/roles/create' },
    ],
};
