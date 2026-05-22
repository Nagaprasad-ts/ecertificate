import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
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

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/admin/roles/${role.id}`);
    }

    return (
        <>
            <Head title="Edit Role" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Edit Role — <span className="text-muted-foreground font-normal">{role.name}</span></h1>
                <RoleForm
                    data={data}
                    errors={errors}
                    processing={processing}
                    permissions={permissions}
                    submitLabel="Update Role"
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
