import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
        event_edition_id: String(participant.event_edition_id),
        template_id:      String(participant.template_id),
        name:             participant.name,
        email:            participant.email,
        usn:              participant.usn ?? '',
        phone_no:         participant.phone_no ?? '',
    });

    const selectedEdition = editions.find((e) => String(e.id) === data.event_edition_id);
    const visibleTemplates = selectedEdition?.template_ids.length
        ? templates.filter((t) => selectedEdition.template_ids.includes(t.id))
        : templates;

    function submit(e: FormEvent) {
        e.preventDefault();
        put(`/participants/${participant.id}`);
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
                        <Select value={data.event_edition_id} onValueChange={(v) => setData('event_edition_id', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {editions.map((ed) => (
                                    <SelectItem key={ed.id} value={String(ed.id)}>{ed.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.event_edition_id} />
                    </div>

                    <div className="space-y-1">
                        <Label>Template</Label>
                        <Select value={data.template_id} onValueChange={(v) => setData('template_id', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {visibleTemplates.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.template_id} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
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
