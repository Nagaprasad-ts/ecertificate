import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ExpectedColumn = { key: string; label: string; required: boolean };

type Template = {
    id: number;
    name: string;
    template_file: string;
    expected_columns: ExpectedColumn[] | null;
};

export default function TemplatesEdit({ template }: { template: Template }) {
    const { data, setData, put, errors, processing } = useForm<{
        name: string;
        template_file: string;
        expected_columns: ExpectedColumn[];
    }>({
        name: template.name,
        template_file: template.template_file,
        expected_columns: template.expected_columns ?? [],
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/templates/${template.id}`);
    }

    function toKey(label: string) {
        return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }

    function addColumn() {
        setData('expected_columns', [...data.expected_columns, { key: '', label: '', required: true }]);
    }

    function updateColumnLabel(index: number, label: string) {
        const next = [...data.expected_columns];
        next[index] = { ...next[index], label, key: toKey(label) };
        setData('expected_columns', next);
    }

    function updateColumnRequired(index: number, required: boolean) {
        const next = [...data.expected_columns];
        next[index] = { ...next[index], required };
        setData('expected_columns', next);
    }

    function removeColumn(index: number) {
        setData('expected_columns', data.expected_columns.filter((_, i) => i !== index));
    }

    return (
        <>
            <Head title="Edit Template" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Edit Template</h1>

                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <div className="space-y-1">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="template_file">Template File</Label>
                        <Input
                            id="template_file"
                            value={data.template_file}
                            onChange={(e) => setData('template_file', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Path relative to <code>certificate-templates/</code> (e.g. <code>sargam/Participation</code>).
                        </p>
                        <InputError message={errors.template_file} />
                    </div>

                    <div className="space-y-3 rounded-lg border p-4">
                        <div>
                            <Label>Extra Excel Columns</Label>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                <strong>name</strong>, <strong>email</strong>, <strong>usn</strong>, and{' '}
                                <strong>phone</strong> are always required. Add any extra columns this template needs.
                                Imports with missing required columns or unexpected columns will be rejected.
                            </p>
                        </div>

                        {data.expected_columns.map((col, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Column Name</Label>
                                    <Input
                                        value={col.label}
                                        onChange={(e) => updateColumnLabel(i, e.target.value)}
                                        placeholder="e.g. Race Distance"
                                    />
                                    {col.key && (
                                        <p className="text-xs text-muted-foreground">
                                            Template variable: <code className="font-mono">{`{{${col.key}}}`}</code>
                                        </p>
                                    )}
                                    <InputError message={(errors as Record<string, string>)[`expected_columns.${i}.key`]} />
                                    <InputError message={(errors as Record<string, string>)[`expected_columns.${i}.label`]} />
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5 pt-7">
                                    <Checkbox
                                        id={`req-${i}`}
                                        checked={col.required}
                                        onCheckedChange={(checked) => updateColumnRequired(i, !!checked)}
                                    />
                                    <Label htmlFor={`req-${i}`} className="text-xs">Required</Label>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-5 shrink-0" onClick={() => removeColumn(i)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}

                        <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Column
                        </Button>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Update Template'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/templates">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

TemplatesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Templates', href: '/templates' },
        { title: 'Edit Template' },
    ],
};
