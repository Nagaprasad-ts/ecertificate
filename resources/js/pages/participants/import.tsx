import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Circle, FileSpreadsheet, Info, MinusCircle, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import type { SyntheticEvent } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EditionOption   = { id: number; year: number; template_ids: number[] };
type EventOption     = { id: number; event_name: string; editions: EditionOption[] };
type ExpectedColumn  = { key: string; label: string; required: boolean };
type Template        = { id: number; name: string; expected_columns: ExpectedColumn[] | null };

const BASE_COLUMNS: ExpectedColumn[] = [
    { key: 'name',  label: 'Name',  required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'usn',   label: 'USN',   required: true },
    { key: 'phone', label: 'Phone', required: true },
];

function parseSchemaError(message?: string): { missing: string[]; unknown: string[] } | null {
    if (!message) {
        return null;
    }
    
    const missingMatch = message.match(/Missing required column\(s\):\s*([^]*?)(?=\s+Unexpected|$)/);
    const unknownMatch = message.match(/Unexpected column\(s\) not defined for this template:\s*(.+?)$/);
    const missing = missingMatch?.[1]?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
    const unknown = unknownMatch?.[1]?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
    
    if (!missing.length && !unknown.length) {
        return null;
    }
    
    return { missing, unknown };
}

export default function ParticipantsImport({
    events,
    templates,
}: {
    events: EventOption[];
    templates: Template[];
}) {
    const { data, setData, post, errors, processing } = useForm({
        event_id:         '',
        event_edition_id: '',
        template_id:      '',
        file:             null as File | null,
    });

    const selectedEvent     = events.find((e) => String(e.id) === data.event_id);
    const availableEditions = selectedEvent?.editions ?? [];
    const selectedEdition   = availableEditions.find((ed) => String(ed.id) === data.event_edition_id);
    const visibleTemplates  = selectedEdition?.template_ids.length
        ? templates.filter((t) => selectedEdition.template_ids.includes(t.id))
        : templates;
    const selectedTemplate  = templates.find((t) => String(t.id) === data.template_id);

    const allColumns: ExpectedColumn[] = selectedTemplate
        ? [...BASE_COLUMNS, ...(selectedTemplate.expected_columns ?? [])]
        : BASE_COLUMNS;

    const schemaError = useMemo(() => parseSchemaError(errors.file), [errors.file]);
    const missingSet  = useMemo(() => new Set(schemaError?.missing ?? []), [schemaError]);
    const hasSchemaError = !!schemaError && (schemaError.missing.length > 0 || schemaError.unknown.length > 0);

    function handleEventChange(eventId: string) {
        setData((prev) => ({ ...prev, event_id: eventId, event_edition_id: '', template_id: '' }));
    }

    function handleEditionChange(editionId: string) {
        setData((prev) => ({ ...prev, event_edition_id: editionId, template_id: '' }));
    }

    function submit(e: SyntheticEvent) {
        e.preventDefault();
        post('/participants/import');
    }

    return (
        <>
            <Head title="Import Participants" />
            <div className="p-6">
                <h1 className="mb-1 text-2xl font-semibold">Import Participants</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Select an event, edition, and template — the required columns for the upload will update automatically.
                </p>

                <form onSubmit={submit} className="space-y-6">

                    {/* Row 1 — Event · Edition · Template */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label>Event <span className="text-destructive">*</span></Label>
                            <SearchableSelect
                                options={events.map((e) => ({ value: String(e.id), label: e.event_name }))}
                                value={data.event_id}
                                onChange={handleEventChange}
                                placeholder="Select event"
                                searchPlaceholder="Search events…"
                                emptyMessage="No events found"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Year / Edition <span className="text-destructive">*</span></Label>
                            <Select
                                value={data.event_edition_id}
                                onValueChange={handleEditionChange}
                                disabled={!selectedEvent}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={selectedEvent ? 'Select year' : 'Select event first'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableEditions.map((ed) => (
                                        <SelectItem key={ed.id} value={String(ed.id)}>{ed.year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.event_edition_id} />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Template <span className="text-destructive">*</span></Label>
                            <Select
                                value={data.template_id}
                                onValueChange={(v) => setData('template_id', v)}
                                disabled={!selectedEdition}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder={selectedEdition ? 'Select template' : 'Select edition first'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {visibleTemplates.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.template_id} />
                        </div>
                    </div>

                    {/* Row 2 — File upload */}
                    <div className="space-y-1.5 sm:max-w-md">
                        <Label htmlFor="file">Excel / CSV File</Label>
                        <Input
                            id="file"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={(e) => setData('file', e.target.files?.[0] ?? null)}
                        />
                        <p className="text-xs text-muted-foreground">Max 10 MB. Accepted: .xlsx, .xls, .csv</p>
                        {!hasSchemaError && <InputError message={errors.file} />}
                    </div>

                    {hasSchemaError && schemaError && (
                        <div className="rounded-lg border border-destructive bg-destructive-foreground p-4">
                            <div className="mb-4 flex items-start gap-3">
                                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                                <div>
                                    <p className="text-base font-semibold text-destructive">
                                        Your file doesn't match the selected template
                                    </p>
                                    <p className="mt-0.5 text-sm text-muted-foreground">
                                        Fix the columns below and re-upload — nothing has been imported.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {schemaError.missing.length > 0 && (
                                    <div className="rounded-md border bg-background p-4">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <MinusCircle className="h-4 w-4 text-destructive" />
                                            Missing required {schemaError.missing.length === 1 ? 'column' : 'columns'}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {schemaError.missing.map((key) => (
                                                <span
                                                    key={key}
                                                    className="inline-flex items-center rounded-md border bg-muted px-2.5 py-1 font-mono text-sm font-medium text-foreground"
                                                >
                                                    {key}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            Add {schemaError.missing.length === 1 ? 'this header' : 'these headers'} to row 1 of your sheet.
                                        </p>
                                    </div>
                                )}

                                {schemaError.unknown.length > 0 && (
                                    <div className="rounded-md border bg-background p-4">
                                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <XCircle className="h-4 w-4 text-muted-foreground" />
                                            Unexpected {schemaError.unknown.length === 1 ? 'column' : 'columns'}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {schemaError.unknown.map((key) => (
                                                <span
                                                    key={key}
                                                    className="inline-flex items-center rounded-md border bg-muted px-2.5 py-1 font-mono text-sm font-medium text-foreground"
                                                >
                                                    {key}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            Remove from your sheet, or add to the template's expected columns first.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>{processing ? 'Importing…' : 'Import'}</Button>
                        <Button variant="outline" asChild><Link href="/participants">Cancel</Link></Button>
                    </div>

                    {/* Dynamic column reference */}
                    <div className="rounded-lg border bg-card p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                {selectedTemplate ? `Required columns for "${selectedTemplate.name}"` : 'Expected columns'}
                            </span>
                        </div>

                        {!selectedTemplate && (
                            <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                Select a template above to see which columns your file must contain.
                            </div>
                        )}

                        {selectedTemplate && (
                            <div className="space-y-1.5">
                                <div className="grid gap-1.5 sm:grid-cols-2">
                                    {allColumns.map((col) => {
                                        const isMissing = missingSet.has(col.key);
                                        
                                        return (
                                            <div
                                                key={col.key}
                                                className={`flex items-center justify-between rounded-md px-2 py-1.5 ${isMissing ? 'bg-destructive/5 ring-1 ring-destructive/30' : 'hover:bg-muted/40'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isMissing ? (
                                                        <MinusCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                                                    ) : col.required ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                                                    ) : (
                                                        <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                                                    )}
                                                    <span className="font-mono text-xs">{col.key}</span>
                                                    <span className="text-xs text-muted-foreground">— {col.label}</span>
                                                </div>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        isMissing
                                                            ? 'bg-destructive text-destructive-foreground'
                                                            : col.required
                                                                ? 'bg-destructive/10 text-destructive'
                                                                : 'bg-muted text-muted-foreground'
                                                    }`}
                                                >
                                                    {isMissing ? 'missing' : col.required ? 'required' : 'optional'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Uploads with extra or missing required columns will be rejected.
                                </p>
                            </div>
                        )}
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
