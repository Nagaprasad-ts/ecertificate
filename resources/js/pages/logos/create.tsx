import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LogosCreate() {
    const { data, setData, post, errors, processing } = useForm({
        logo_name: '',
        year: new Date().getFullYear(),
        logo: null as File | null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/logos');
    }

    return (
        <>
            <Head title="Add Logo" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Add Logo</h1>

                <form onSubmit={submit} className="max-w-lg space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="logo_name">Logo Name</Label>
                        <Input
                            id="logo_name"
                            value={data.logo_name}
                            onChange={(e) => setData('logo_name', e.target.value)}
                            placeholder="e.g. College Logo"
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
                        <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('logo', e.target.files?.[0] ?? null)}
                        />
                        <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 2MB</p>
                        <InputError message={errors.logo} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Logo'}
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

LogosCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Logos', href: '/logos' },
        { title: 'Add Logo', href: '/logos/create' },
    ],
};
