import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import RoleForm from './partials/RoleForm';

type Permission = { id: number; name: string; slug: string; page: string };

export default function RolesCreate({ permissions }: { permissions: Record<string, Permission[]> }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        permission_ids: [] as number[],
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/roles');
    }

    return (
        <>
            <Head title="Add Role" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Add Role</h1>
                <RoleForm
                    data={data}
                    errors={errors}
                    processing={processing}
                    permissions={permissions}
                    submitLabel="Create Role"
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
        { title: 'Add Role', href: '/admin/roles/create' },
    ],
};
