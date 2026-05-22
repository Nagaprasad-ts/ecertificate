import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Logo = {
    id: number;
    year: number;
    logo_name: string;
    logo: string;
};

export default function LogosEdit({ logo }: { logo: Logo }) {
    const { data, setData, post, errors, processing } = useForm({
        _method: 'put',
        logo_name: logo.logo_name,
        year: logo.year,
        logo: null as File | null,
    });

    const [preview, setPreview] = useState<string | null>(null);

    function handleFile(file: File | undefined) {
        if (!file) return;
        setData('logo', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/logos/${logo.id}`);
    }

    return (
        <>
            <Head title="Edit Logo" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Edit Logo</h1>

                <form onSubmit={submit} className="max-w-lg space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="logo_name">Logo Name</Label>
                        <Input
                            id="logo_name"
                            value={data.logo_name}
                            onChange={(e) => setData('logo_name', e.target.value)}
                        />
                        <InputError message={errors.logo_name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="year">Year</Label>
                        <Input
                            id="year"
                            type="number"
                            value={data.year}
                            onChange={(e) => setData('year', parseInt(e.target.value))}
                            min={2000}
                            max={2100}
                        />
                        <InputError message={errors.year} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="logo">Logo Image</Label>
                        <div className="flex items-center gap-4">
                            <img
                                src={preview ?? `/storage/${logo.logo}`}
                                alt={logo.logo_name}
                                className="h-16 w-16 rounded border bg-muted object-contain"
                            />
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Leave empty to keep the current image.</p>
                        <InputError message={errors.logo} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Update Logo'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/logos">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

LogosEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Logos', href: '/logos' },
        { title: 'Edit Logo' },
    ],
};
