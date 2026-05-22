import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignaturesCreate() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        designation: '',
        signature: null as File | null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/signatures');
    }

    return (
        <>
            <Head title="Add Signature" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Add Signature</h1>

                <form onSubmit={submit} className="max-w-lg space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Dr. John Smith"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                            id="designation"
                            value={data.designation}
                            onChange={(e) => setData('designation', e.target.value)}
                            placeholder="e.g. Principal"
                        />
                        <InputError message={errors.designation} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="signature">Signature Image</Label>
                        <Input
                            id="signature"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('signature', e.target.files?.[0] ?? null)}
                        />
                        <p className="text-xs text-muted-foreground">PNG or JPG with transparent background recommended. Max 2MB.</p>
                        <InputError message={errors.signature} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Signature'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/signatures">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

SignaturesCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Signatures', href: '/signatures' },
        { title: 'Add Signature', href: '/signatures/create' },
    ],
};
