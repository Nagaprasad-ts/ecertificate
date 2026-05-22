import { Head, Link, useForm } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type EventData = {
    id: number;
    event_name: string;
    logo: string | null;
    initials: string;
};

export default function EventsEdit({ event }: { event: EventData }) {
    const { data, setData, post, errors, processing } = useForm<{
        event_name: string;
        logo: File | null;
        remove_logo: boolean;
        _method: string;
    }>({
        event_name:  event.event_name,
        logo:        null,
        remove_logo: false,
        _method:     'PUT',
    });

    const fileRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(
        event.logo ? `/storage/${event.logo}` : null,
    );

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setData('logo', file);
        setData('remove_logo', false);
        setPreview(file ? URL.createObjectURL(file) : null);
    }

    function removeLogo() {
        setData('logo', null);
        setData('remove_logo', true);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post(`/events/${event.id}`, { forceFormData: true });
    }

    return (
        <>
            <Head title="Edit Event" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Edit Event</h1>

                <form onSubmit={submit} className="max-w-md space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="event_name">Event Name <span className="text-destructive">*</span></Label>
                        <Input
                            id="event_name"
                            value={data.event_name}
                            onChange={(e) => setData('event_name', e.target.value)}
                            required
                        />
                        <InputError message={errors.event_name} />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Logo <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
                        >
                            {preview ? (
                                <img src={preview} alt="Logo" className="h-20 w-20 rounded-lg object-contain" />
                            ) : (
                                <>
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Click to upload a new logo</p>
                                </>
                            )}
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                        {preview && (
                            <button type="button" onClick={removeLogo} className="text-xs text-muted-foreground underline">
                                Remove logo
                            </button>
                        )}
                        <InputError message={errors.logo} />
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save Changes'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={`/events/${event.id}`}>Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

EventsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Events', href: '/events' },
        { title: 'Edit Event' },
    ],
};
