import { Link } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Permission = { id: number; name: string; slug: string; page: string };

export type RoleFormData = {
    name: string;
    permission_ids: number[];
};

type Props = {
    data: RoleFormData;
    errors: Partial<Record<string, string>>;
    processing: boolean;
    permissions: Record<string, Permission[]>;
    submitLabel: string;
    onSubmit: (e: FormEvent) => void;
    onChange: (key: keyof RoleFormData, value: any) => void;
};

function toggleId(ids: number[], id: number) {
    return ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
}

function togglePage(ids: number[], pagePerms: Permission[]) {
    const pageIds = pagePerms.map((p) => p.id);
    const allSelected = pageIds.every((id) => ids.includes(id));
    return allSelected
        ? ids.filter((id) => !pageIds.includes(id))
        : [...new Set([...ids, ...pageIds])];
}

export default function RoleForm({ data, errors, processing, permissions, submitLabel, onSubmit, onChange }: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
            <div className="space-y-1">
                <Label htmlFor="name">Role Name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="e.g. Editor"
                />
                <InputError message={errors.name} />
            </div>

            <div className="space-y-3">
                <Label className="text-base font-medium">Permissions</Label>
                <InputError message={errors.permission_ids} />

                {Object.entries(permissions).map(([page, perms]) => {
                    const pageIds = perms.map((p) => p.id);
                    const allSelected = pageIds.every((id) => data.permission_ids.includes(id));
                    const someSelected = pageIds.some((id) => data.permission_ids.includes(id));

                    return (
                        <div key={page} className="rounded-md border p-3">
                            <div className="mb-2 flex items-center gap-2">
                                <Checkbox
                                    id={`page-${page}`}
                                    checked={allSelected}
                                    ref={(el) => { if (el) (el as any).indeterminate = !allSelected && someSelected; }}
                                    onCheckedChange={() => onChange('permission_ids', togglePage(data.permission_ids, perms))}
                                />
                                <label htmlFor={`page-${page}`} className="cursor-pointer text-sm font-semibold capitalize">
                                    {page}
                                </label>
                            </div>
                            <div className="ml-6 grid grid-cols-2 gap-1 sm:grid-cols-4">
                                {perms.map((perm) => (
                                    <label key={perm.id} className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-muted/50">
                                        <Checkbox
                                            checked={data.permission_ids.includes(perm.id)}
                                            onCheckedChange={() => onChange('permission_ids', toggleId(data.permission_ids, perm.id))}
                                        />
                                        <span className="text-xs capitalize">{perm.slug.split('.')[1]}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={processing}>{processing ? 'Saving…' : submitLabel}</Button>
                <Button variant="outline" asChild><Link href="/admin/roles">Cancel</Link></Button>
            </div>
        </form>
    );
}
