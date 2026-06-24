import { Head, Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ExpectedColumn = { key: string; label: string; required: boolean };

export default function TemplatesCreate() {
    const { data, setData, post, errors, processing } = useForm<{
        name: string;
        template_file: string;
        expected_columns: ExpectedColumn[];
    }>({
        name: '',
        template_file: '',
        expected_columns: [],
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/templates');
    }

    function addColumn() {
        setData('expected_columns', [...data.expected_columns, { key: '', label: '', required: true }]);
    }

    function updateColumn(index: number, field: keyof ExpectedColumn, value: string | boolean) {
        const next = [...data.expected_columns];
        next[index] = { ...next[index], [field]: value };
        setData('expected_columns', next);
    }

    function removeColumn(index: number) {
        setData('expected_columns', data.expected_columns.filter((_, i) => i !== index));
    }

    return (
        <>
            <Head title="Add Template" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Add Template</h1>

                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <div className="space-y-1">
                        <Label htmlFor="name">Template Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Participation Certificate"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="template_file">Template File</Label>
                        <Input
                            id="template_file"
                            value={data.template_file}
                            onChange={(e) => setData('template_file', e.target.value)}
                            placeholder="e.g. sargam/Participation"
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
                            <div key={i} className="flex items-end gap-2">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Column key</Label>
                                    <Input
                                        value={col.key}
                                        onChange={(e) =>
                                            updateColumn(i, 'key', e.target.value.toLowerCase().replace(/\s+/g, '_'))
                                        }
                                        placeholder="department"
                                    />
                                    <InputError message={(errors as Record<string, string>)[`expected_columns.${i}.key`]} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Display label</Label>
                                    <Input
                                        value={col.label}
                                        onChange={(e) => updateColumn(i, 'label', e.target.value)}
                                        placeholder="Department"
                                    />
                                    <InputError message={(errors as Record<string, string>)[`expected_columns.${i}.label`]} />
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5 pb-2">
                                    <Checkbox
                                        id={`req-${i}`}
                                        checked={col.required}
                                        onCheckedChange={(checked) => updateColumn(i, 'required', !!checked)}
                                    />
                                    <Label htmlFor={`req-${i}`} className="text-xs">Required</Label>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => removeColumn(i)}>
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
                            {processing ? 'Saving...' : 'Save Template'}
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

TemplatesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Templates', href: '/templates' },
        { title: 'Add Template', href: '/templates/create' },
    ],
};
