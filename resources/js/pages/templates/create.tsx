import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TemplatesCreate() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        template_file: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/templates');
    }

    return (
        <>
            <Head title="Add Template" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Add Template</h1>

                <form onSubmit={submit} className="max-w-lg space-y-4">
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
                        <Label htmlFor="template_file">Template File / URL</Label>
                        <Input
                            id="template_file"
                            value={data.template_file}
                            onChange={(e) => setData('template_file', e.target.value)}
                            placeholder="e.g. templates/Participation or https://..."
                        />
                        <p className="text-xs text-muted-foreground">
                            Path to the React component (e.g. <code>templates/Participation</code>) or a full URL.
                        </p>
                        <InputError message={errors.template_file} />
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
