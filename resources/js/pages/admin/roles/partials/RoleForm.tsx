import { Link } from '@inertiajs/react';
import type { SyntheticEvent } from 'react';
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
    onSubmit: (e: SyntheticEvent) => void;
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

function formatLabel(str: string) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function RoleForm({ data, errors, processing, permissions, submitLabel, onSubmit, onChange }: Props) {
    const allPermIds = Object.values(permissions).flat().map((p) => p.id);
    const totalSelected = data.permission_ids.length;
    const totalAvailable = allPermIds.length;
    const everythingSelected = totalAvailable > 0 && totalSelected === totalAvailable;

    return (
        <form onSubmit={onSubmit} className="space-y-8">

            {/* ── Role name ──────────────────────────────────────────────── */}
            <div className="max-w-sm space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Role name</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    placeholder="e.g. Event Manager"
                />
                <InputError message={errors.name} />
                <p className="text-xs text-muted-foreground">
                    A unique name used when assigning this role to users.
                </p>
            </div>

            {/* ── Permissions ────────────────────────────────────────────── */}
            <div className="space-y-4">

                {/* Section header */}
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium">Permissions</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Select what this role can access</p>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                        {totalSelected > 0 && (
                            <span className="text-muted-foreground">
                                <span className="font-medium text-foreground">{totalSelected}</span>
                                {' '}of {totalAvailable} selected
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => onChange('permission_ids', allPermIds)}
                            disabled={everythingSelected}
                            className="text-primary underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-40"
                        >
                            Select all
                        </button>
                        <span className="text-border">·</span>
                        <button
                            type="button"
                            onClick={() => onChange('permission_ids', [])}
                            disabled={totalSelected === 0}
                            className="text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-40"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                <InputError message={errors.permission_ids} />

                {/* Group cards */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(permissions).map(([page, perms]) => {
                        const pageIds = perms.map((p) => p.id);
                        const selectedCount = pageIds.filter((id) => data.permission_ids.includes(id)).length;
                        const allChosen = selectedCount === pageIds.length;
                        const someChosen = selectedCount > 0 && !allChosen;
                        const hasAny = selectedCount > 0;

                        return (
                            <div
                                key={page}
                                className={[
                                    'overflow-hidden rounded-lg border transition-colors',
                                    hasAny
                                        ? 'border-primary/25 bg-primary/[0.025]'
                                        : 'border-border bg-card',
                                ].join(' ')}
                            >
                                {/* Group header */}
                                <label
                                    htmlFor={`page-${page}`}
                                    className={[
                                        'flex cursor-pointer items-center justify-between px-3 py-2.5 border-b',
                                        hasAny ? 'border-primary/15' : 'border-border',
                                    ].join(' ')}
                                >
                                    <span className="flex items-center gap-2">
                                        <Checkbox
                                            id={`page-${page}`}
                                            checked={allChosen}
                                            ref={(el) => {
                                                if (el) (el as any).indeterminate = someChosen;
                                            }}
                                            onCheckedChange={() =>
                                                onChange('permission_ids', togglePage(data.permission_ids, perms))
                                            }
                                        />
                                        <span className="text-sm font-medium capitalize">{page}</span>
                                    </span>
                                    {hasAny && (
                                        <span className="text-[11px] font-medium tabular-nums text-primary">
                                            {selectedCount}/{pageIds.length}
                                        </span>
                                    )}
                                </label>

                                {/* Individual permissions */}
                                <div className="px-3 py-1.5">
                                    {perms.map((perm) => {
                                        const action = perm.slug.split('.')[1] ?? perm.name;
                                        const isChecked = data.permission_ids.includes(perm.id);
                                        return (
                                            <label
                                                key={perm.id}
                                                className="flex cursor-pointer items-center gap-2.5 rounded px-1.5 py-[7px] transition-colors hover:bg-muted/60"
                                            >
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={() =>
                                                        onChange('permission_ids', toggleId(data.permission_ids, perm.id))
                                                    }
                                                />
                                                <span
                                                    className={[
                                                        'text-sm',
                                                        isChecked ? 'text-foreground' : 'text-muted-foreground',
                                                    ].join(' ')}
                                                >
                                                    {formatLabel(action)}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Actions ────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 border-t pt-6">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving…' : submitLabel}
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/admin/roles">Cancel</Link>
                </Button>
            </div>
        </form>
    );
}
