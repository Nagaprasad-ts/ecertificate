import { Head, Link, router, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { FormEvent, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Edition     = { id: number; label: string; template_ids: number[] };
type Template    = { id: number; name: string };
type Participant = {
    id: number;
    event_edition_id: number;
    template_id: number;
    name: string;
    email: string;
    usn: string | null;
    phone_no: string | null;
    certificate_no: string;
};

export default function ParticipantsEdit({
    participant,
    editions,
    templates,
}: {
    participant: Participant;
    editions: Edition[];
    templates: Template[];
}) {
    const { data, setData, put, errors, processing } = useForm({
        name:     participant.name,
        email:    participant.email,
        usn:      participant.usn ?? '',
        phone_no: participant.phone_no ?? '',
    });

    const currentEdition  = editions.find((e) => e.id === participant.event_edition_id);
    const currentTemplate = templates.find((t) => t.id === participant.template_id);

    const emailChanged = data.email.trim() !== participant.email.trim();
    const [resending, setResending] = useState(false);

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/participants/${participant.id}`);
    }

    function resendEmail() {
        setResending(true);
        router.post(
            `/participants/${participant.id}/resend-email`,
            { email: data.email },
            { onFinish: () => setResending(false) },
        );
    }

    return (
        <>
            <Head title="Edit Participant" />
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Edit Participant</h1>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">Cert: {participant.certificate_no}</p>
                </div>

                <form onSubmit={submit} className="max-w-lg space-y-4">
                    <div className="space-y-1">
                        <Label>Event Edition</Label>
                        <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                            {currentEdition?.label ?? '—'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label>Template</Label>
                        <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3 text-sm text-muted-foreground">
                            {currentTemplate?.name ?? '—'}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="flex-1"
                            />
                            {emailChanged && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={resendEmail}
                                    disabled={resending || processing}
                                    title="Save new email and resend certificate"
                                >
                                    <Send className="mr-2 h-3.5 w-3.5" />
                                    {resending ? 'Sending…' : 'Resend Email'}
                                </Button>
                            )}
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="usn">USN</Label>
                            <Input id="usn" value={data.usn} onChange={(e) => setData('usn', e.target.value)} />
                            <InputError message={errors.usn} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="phone_no">Phone No</Label>
                            <Input id="phone_no" value={data.phone_no} onChange={(e) => setData('phone_no', e.target.value)} />
                            <InputError message={errors.phone_no} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Update Participant'}</Button>
                        <Button variant="outline" asChild><Link href="/participants">Cancel</Link></Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ParticipantsEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Participants', href: '/participants' },
        { title: 'Edit Participant' },
    ],
};
