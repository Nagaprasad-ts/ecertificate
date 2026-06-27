import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import RoleForm from './partials/RoleForm';

type Permission = { id: number; name: string; slug: string; page: string };
type Role = { id: number; name: string; slug: string };

export default function RolesEdit({
    role, permissions, assigned,
}: {
    role: Role;
    permissions: Record<string, Permission[]>;
    assigned: number[];
}) {
    const { data, setData, put, errors, processing } = useForm({
        name: role.name,
        permission_ids: assigned as number[],
    });

    function submit(e: SyntheticEvent) {
        e.preventDefault();
        put(`/admin/roles/${role.id}`);
    }

    return (
        <>
            <Head title={`Edit Role — ${role.name}`} />
            <div className="p-6">
                <Link
                    href="/admin/roles"
                    className="mb-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to roles
                </Link>

                <div className="mb-8">
                    <h1 className="text-xl font-semibold">
                        Edit role
                        <span className="ml-2 font-normal text-muted-foreground">— {role.name}</span>
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update the role name or adjust its permissions.
                    </p>
                </div>

                <RoleForm
                    data={data}
                    errors={errors}
                    processing={processing}
                    permissions={permissions}
                    submitLabel="Save changes"
                    onSubmit={submit}
                    onChange={(key, value) => setData(key, value)}
                />
            </div>
        </>
    );
}

RolesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles', href: '/admin/roles' },
        { title: 'Edit Role' },
    ],
};
