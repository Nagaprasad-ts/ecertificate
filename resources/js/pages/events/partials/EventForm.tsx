import { Link } from '@inertiajs/react';
import type { SyntheticEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Logo = { id: number; logo_name: string; year: number; logo: string };
type Template = { id: number; name: string; template_file: string };

export type EventFormData = {
    event_name: string;
    year: number | string;
    logo_ids: number[];
    template_ids: number[];
};

type Props = {
    data: EventFormData;
    errors: Partial<Record<keyof EventFormData, string>>;
    processing: boolean;
    logos: Logo[];
    templates: Template[];
    submitLabel: string;
    onSubmit: (e: SyntheticEvent) => void;
    onChange: <K extends keyof EventFormData>(key: K, value: EventFormData[K]) => void;
};

function toggleId(ids: number[], id: number): number[] {
    return ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id];
}

export default function EventForm({ data, errors, processing, logos, templates, submitLabel, onSubmit, onChange }: Props) {
    return (
        <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">

            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <Label htmlFor="event_name">Event Name</Label>
                    <Input
                        id="event_name"
                        value={data.event_name}
                        onChange={(e) => onChange('event_name', e.target.value)}
                        placeholder="e.g. Sargam"
                    />
                    <InputError message={errors.event_name} />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="year">Year</Label>
                    <Input
                        id="year"
                        type="number"
                        value={data.year}
                        onChange={(e) => onChange('year', parseInt(e.target.value))}
                        min={2000}
                        max={2100}
                    />
                    <InputError message={errors.year} />
                </div>
            </div>

            {/* Logos */}
            <div className="space-y-2">
                <Label className="text-base font-medium">Logos</Label>
                <InputError message={errors.logo_ids} />
                {logos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No logos found. <Link href="/logos/create" className="underline">Add one</Link>.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-2 rounded-md border p-3 sm:grid-cols-3">
                        {logos.map((logo) => (
                            <label key={logo.id} className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-muted/50">
                                <Checkbox
                                    checked={data.logo_ids.includes(logo.id)}
                                    onCheckedChange={() => onChange('logo_ids', toggleId(data.logo_ids, logo.id))}
                                />
                                <img src={`/storage/${logo.logo}`} alt={logo.logo_name} className="h-7 w-7 object-contain rounded border bg-muted" />
                                <span className="text-sm">{logo.logo_name} <span className="text-xs text-muted-foreground">({logo.year})</span></span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Templates */}
            <div className="space-y-2">
                <Label className="text-base font-medium">Templates</Label>
                <InputError message={errors.template_ids} />
                {templates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No templates found. <Link href="/templates/create" className="underline">Add one</Link>.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-2 rounded-md border p-3">
                        {templates.map((tpl) => (
                            <label key={tpl.id} className="flex cursor-pointer items-center gap-2 rounded p-1.5 hover:bg-muted/50">
                                <Checkbox
                                    checked={data.template_ids.includes(tpl.id)}
                                    onCheckedChange={() => onChange('template_ids', toggleId(data.template_ids, tpl.id))}
                                />
                                <div>
                                    <p className="text-sm font-medium">{tpl.name}</p>
                                    <p className="font-mono text-xs text-muted-foreground">{tpl.template_file}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving…' : submitLabel}
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/events">Cancel</Link>
                </Button>
            </div>
        </form>
    );
}
