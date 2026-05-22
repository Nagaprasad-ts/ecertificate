import { Head, Link, useForm } from '@inertiajs/react';
import { FileSpreadsheet } from 'lucide-react';
import { FormEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Edition  = { id: number; label: string; template_ids: number[] };
type Template = { id: number; name: string };

export default function ParticipantsImport({
    editions,
    templates,
}: {
    editions: Edition[];
    templates: Template[];
}) {
    const { data, setData, post, errors, processing } = useForm({
        event_edition_id: '',
        template_id:      '',
        file:             null as File | null,
    });

    function handleEditionChange(editionId: string) {
        setData('event_edition_id', editionId);
        setData('template_id', '');
    }

    const selectedEdition = editions.find((e) => String(e.id) === data.event_edition_id);
    const visibleTemplates = selectedEdition?.template_ids.length
        ? templates.filter((t) => selectedEdition.template_ids.includes(t.id))
        : templates;

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/participants/import');
    }

    return (
        <>
            <Head title="Import Participants" />
            <div className="p-6">
                <h1 className="mb-2 text-2xl font-semibold">Import Participants</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Upload an Excel / CSV file. Required columns: <code>name</code>, <code>email</code>.
                    Optional: <code>usn</code>, <code>phone</code>. Any extra columns are stored as JSON.
                </p>

                <form onSubmit={submit} className="space-y-6">

                    {/* Row 1 — Edition + Template side by side */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Event Edition <span className="text-destructive">*</span></Label>
                            <Select value={data.event_edition_id} onValueChange={handleEditionChange}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select event &amp; year" /></SelectTrigger>
                                <SelectContent>
                                    {editions.map((ed) => (
                                        <SelectItem key={ed.id} value={String(ed.id)}>{ed.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.event_edition_id} />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Template <span className="text-destructive">*</span></Label>
                            <Select value={data.template_id} onValueChange={(v) => setData('template_id', v)}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select template" /></SelectTrigger>
                                <SelectContent>
                                    {visibleTemplates.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.template_id} />
                        </div>
                    </div>

                    {/* Row 2 — File upload + preview side by side */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="file">Excel / CSV File</Label>
                            <Input
                                id="file"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                            />
                            <p className="text-xs text-muted-foreground">Max 10 MB. Accepted: .xlsx, .xls, .csv</p>
                            <InputError message={errors.file} />
                        </div>

                        {/* Expected columns reference */}
                        <div className="rounded-md border bg-muted/40 p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                <FileSpreadsheet className="h-4 w-4" /> Expected columns
                            </div>
                            <table className="w-full text-xs text-muted-foreground">
                                <thead><tr className="border-b">
                                    <th className="pb-1 text-left">name</th>
                                    <th className="pb-1 text-left">email</th>
                                    <th className="pb-1 text-left">usn</th>
                                    <th className="pb-1 text-left">phone</th>
                                    <th className="pb-1 text-left">… extra cols</th>
                                </tr></thead>
                                <tbody><tr>
                                    <td className="pt-1">Jane Doe</td>
                                    <td className="pt-1">jane@example.com</td>
                                    <td className="pt-1">1NH22CS001</td>
                                    <td className="pt-1">9876543210</td>
                                    <td className="pt-1 italic">→ saved as JSON</td>
                                </tr></tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>{processing ? 'Importing…' : 'Import'}</Button>
                        <Button variant="outline" asChild><Link href="/participants">Cancel</Link></Button>
                    </div>
                </form>
            </div>
        </>
    );
}

ParticipantsImport.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Participants', href: '/participants' },
        { title: 'Import', href: '/participants/import/form' },
    ],
};
