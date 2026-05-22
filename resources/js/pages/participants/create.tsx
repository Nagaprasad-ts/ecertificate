import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Edition  = { id: number; label: string; template_ids: number[] };
type Template = { id: number; name: string };

export default function ParticipantsCreate({
    editions,
    templates,
}: {
    editions: Edition[];
    templates: Template[];
}) {
    const { data, setData, post, errors, processing } = useForm({
        event_edition_id: '',
        template_id:      '',
        name:             '',
        email:            '',
        usn:              '',
        phone_no:         '',
    });

    function handleEditionChange(editionId: string) {
        setData('event_edition_id', editionId);
        setData('template_id', '');   // reset so user picks from the filtered list
    }

    const selectedEdition = editions.find((e) => String(e.id) === data.event_edition_id);
    const visibleTemplates = selectedEdition?.template_ids.length
        ? templates.filter((t) => selectedEdition.template_ids.includes(t.id))
        : templates;

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/participants');
    }

    return (
        <>
            <Head title="Add Participant" />
            <div className="p-6">
                <h1 className="mb-6 text-2xl font-semibold">Add Participant</h1>
                <form onSubmit={submit} className="max-w-lg space-y-4">

                    <div className="space-y-1">
                        <Label>Event Edition <span className="text-destructive">*</span></Label>
                        <Select value={data.event_edition_id} onValueChange={handleEditionChange}>
                            <SelectTrigger><SelectValue placeholder="Select event &amp; year" /></SelectTrigger>
                            <SelectContent>
                                {editions.map((ed) => (
                                    <SelectItem key={ed.id} value={String(ed.id)}>{ed.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.event_edition_id} />
                    </div>

                    <div className="space-y-1">
                        <Label>Template <span className="text-destructive">*</span></Label>
                        <Select value={data.template_id} onValueChange={(v) => setData('template_id', v)}>
                            <SelectTrigger><SelectValue placeholder="Select template" /></SelectTrigger>
                            <SelectContent>
                                {visibleTemplates.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.template_id} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
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
                        <Button type="submit" disabled={processing}>{processing ? 'Saving…' : 'Save Participant'}</Button>
                        <Button variant="outline" asChild><Link href="/participants">Cancel</Link></Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ParticipantsCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Participants', href: '/participants' },
        { title: 'Add Participant', href: '/participants/create' },
    ],
};
