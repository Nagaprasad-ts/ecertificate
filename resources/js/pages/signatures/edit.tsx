import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Signature = {
    id: number;
    name: string;
    designation: string;
    signature: string;
    resignation_date: string;
};

export default function SignaturesEdit({ signature }: { signature: Signature }) {
    const { data, setData, post, errors, processing } = useForm({
        _method: 'put',
        name: signature.name,
        designation: signature.designation,
        signature: null as File | null,
        resignation_date: signature.resignation_date ?? '',
    });

    const [preview, setPreview] = useState<string | null>(null);

    function handleFile(file: File | undefined) {
        if (!file) return;
        setData('signature', file);
        setPreview(URL.createObjectURL(file));
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/signatures/${signature.id}`);
    }

    return (
        <>
            <Head title="Edit Signature" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Edit Signature</h1>

                <form onSubmit={submit} className="max-w-lg space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="designation">Designation</Label>
                        <Input
                            id="designation"
                            value={data.designation}
                            onChange={(e) => setData('designation', e.target.value)}
                        />
                        <InputError message={errors.designation} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="resignation_date">Resignation Date <span className="text-xs text-muted-foreground font-normal">(optional — set when resigned)</span></Label>
                        <Input
                            id="resignation_date"
                            type="date"
                            value={data.resignation_date}
                            onChange={(e) => setData('resignation_date', e.target.value)}
                        />
                        <InputError message={errors.resignation_date} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="signature">Signature Image</Label>
                        <div className="flex items-center gap-4">
                            <img
                                src={preview ?? `/storage/${signature.signature}`}
                                alt={signature.name}
                                className="h-16 w-32 rounded border bg-muted object-contain"
                            />
                            <Input
                                id="signature"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Leave empty to keep the current image.</p>
                        <InputError message={errors.signature} />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Update Signature'}
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

SignaturesEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Signatures', href: '/signatures' },
        { title: 'Edit Signature' },
    ],
};
