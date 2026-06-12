import { Head, Link, router, useForm } from '@inertiajs/react';
import { CalendarDays, LayoutGrid, LayoutList, Pencil, Plus, Search, Settings2, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';

import InputError from '@/components/input-error';
import { MultiSelect } from '@/components/multi-select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LogoData = { id: number; logo_name: string; logo: string };

type Edition = {
    id: number;
    year: number;
    template_ids: number[];
    template_names: string[];
    logo_ids: number[];
    logos: LogoData[];
    participants_count: number;
};

type Template = { id: number; name: string };

type EventData = {
    id: number;
    event_name: string;
    logo: string | null;
    initials: string;
    editions: Edition[];
};

type Props = {
    event: EventData;
    templates: Template[];
};

const VIEW_KEY = 'editions-view';

export default function EventsShow({ event, templates }: Props) {
    const [deletingEdition, setDeletingEdition] = useState<Edition | null>(null);
    const [editingEdition, setEditingEdition]   = useState<Edition | null>(null);
    const [editTemplateIds, setEditTemplateIds] = useState<number[]>([]);
    const [editProcessing, setEditProcessing]   = useState(false);
    const [showForm, setShowForm]               = useState(false);

    function openEditEdition(ed: Edition) {
        setEditingEdition(ed);
        setEditTemplateIds(ed.template_ids);
    }

    function submitEditEdition() {
        if (!editingEdition) return;
        setEditProcessing(true);
        router.patch(
            `/events/${event.id}/editions/${editingEdition.id}`,
            { template_ids: editTemplateIds },
            { onFinish: () => { setEditProcessing(false); setEditingEdition(null); } },
        );
    }

    const [search, setSearch] = useState('');
    const [view, setView]     = useState<'grid' | 'list'>(() =>
        (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') ?? 'list',
    );

    function switchView(v: 'grid' | 'list') {
        setView(v);
        localStorage.setItem(VIEW_KEY, v);
    }

    const q               = search.trim().toLowerCase();
    const visibleEditions = q
        ? event.editions.filter((ed) =>
            String(ed.year).includes(q) ||
            ed.template_names.some((n) => n.toLowerCase().includes(q)),
          )
        : event.editions;

    // ── Add edition form ─────────────────────────────────────────────────────
    const { data, setData, post, errors, processing, reset } = useForm({
        year:         new Date().getFullYear(),
        template_ids: [] as number[],
    });

    const templateOptions = templates.map((t) => ({ value: t.id, label: t.name }));

    function submitEdition(e: React.SyntheticEvent) {
        e.preventDefault();
        post(`/events/${event.id}/editions`, {
            onSuccess: () => { reset(); setShowForm(false); },
        });
    }

    function handleDeleteEdition() {
        if (!deletingEdition) return;
        router.delete(`/events/${event.id}/editions/${deletingEdition.id}`, {
            onFinish: () => setDeletingEdition(null),
        });
    }

    return (
        <>
            <Head title={event.event_name} />
            <div className="space-y-6 p-6">

                {/* ── Event header ── */}
                <div className="flex items-center gap-5">
                    {event.logo ? (
                        <img
                            src={`/storage/${event.logo}`}
                            alt={event.event_name}
                            className="h-16 w-16 rounded-xl border object-contain"
                        />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                            {event.initials}
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-2xl font-semibold">{event.event_name}</h1>
                        <p className="text-sm text-muted-foreground">
                            {event.editions.length === 0
                                ? 'No editions yet'
                                : `${event.editions.length} edition${event.editions.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/events/${event.id}/edit`}>
                                <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                            </Link>
                        </Button>
                        <Button size="sm" onClick={() => setShowForm(true)}>
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Edition
                        </Button>
                    </div>
                </div>

                {/* ── Add edition form ── */}
                {showForm && (
                    <div className="rounded-xl border bg-muted/30 p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-base font-semibold">
                                <Plus className="h-4 w-4" /> Add Edition
                            </h2>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); reset(); }}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Cancel"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={submitEdition} className="space-y-4">
                            <div className="grid grid-cols-[7rem_1fr] gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="year">Year <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        min={2000}
                                        max={2100}
                                        value={data.year}
                                        onChange={(e) => setData('year', Number(e.target.value))}
                                        required
                                    />
                                    <InputError message={errors.year} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label>Templates <span className="text-xs text-muted-foreground">(optional)</span></Label>
                                    <MultiSelect
                                        options={templateOptions}
                                        selected={data.template_ids}
                                        onChange={(ids) => setData('template_ids', ids)}
                                        placeholder="Select templates…"
                                    />
                                    <InputError message={errors.template_ids} />
                                </div>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Adding…' : 'Add Edition'}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Editions list ── */}
                <div className="space-y-4">

                    {/* Sub-header with search + view toggle */}
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold">Editions</h2>
                        <div className="ml-auto flex items-center gap-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by year or template…"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-64 pl-9 pr-8"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex overflow-hidden rounded-md border">
                                <button
                                    type="button"
                                    onClick={() => switchView('grid')}
                                    aria-label="Grid view"
                                    className={`flex items-center px-3 py-1.5 transition-colors ${view === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchView('list')}
                                    aria-label="List view"
                                    className={`flex items-center px-3 py-1.5 transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                                >
                                    <LayoutList className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Empty states */}
                    {event.editions.length === 0 ? (
                        <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                            No editions yet. Add the first one above.
                        </p>
                    ) : visibleEditions.length === 0 ? (
                        <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
                            No editions match <strong>"{search}"</strong>.
                        </p>
                    ) : view === 'grid' ? (
                        /* ── Grid view ── */
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleEditions.map((ed) => (
                                <div key={ed.id} className="relative flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-lg font-bold">{ed.year}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => openEditEdition(ed)}
                                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                                                <Settings2 className="h-4 w-4" />
                                            </button>
                                            <button type="button" onClick={() => setDeletingEdition(ed)}
                                                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Logo thumbnails */}
                                    {ed.logos.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {ed.logos.map((l) => (
                                                <img
                                                    key={l.id}
                                                    src={`/storage/${l.logo}`}
                                                    alt={l.logo_name}
                                                    title={l.logo_name}
                                                    className="h-8 w-8 rounded border bg-muted object-contain p-0.5"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex flex-wrap gap-1">
                                            {ed.template_names.length === 0 ? (
                                                <span className="text-xs">No templates</span>
                                            ) : (
                                                ed.template_names.map((name) => (
                                                    <span key={name} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                        {name}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{ed.participants_count} participant{ed.participants_count !== 1 ? 's' : ''}</span>
                                        </div>
                                    </div>

                                    <Button size="sm" variant="outline" asChild className="mt-auto">
                                        <Link href={`/participants?event_edition_id=${ed.id}`}>Manage Participants</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* ── List view ── */
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Year</th>
                                        <th className="px-4 py-3 text-left font-medium">Logos</th>
                                        <th className="px-4 py-3 text-left font-medium">Templates</th>
                                        <th className="px-4 py-3 text-left font-medium">Participants</th>
                                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visibleEditions.map((ed) => (
                                        <tr key={ed.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-bold">{ed.year}</td>
                                            <td className="px-4 py-3">
                                                {ed.logos.length === 0 ? (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {ed.logos.map((l) => (
                                                            <img
                                                                key={l.id}
                                                                src={`/storage/${l.logo}`}
                                                                alt={l.logo_name}
                                                                title={l.logo_name}
                                                                className="h-7 w-7 rounded border bg-muted object-contain p-0.5"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {ed.template_names.length === 0 ? (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    ) : (
                                                        ed.template_names.map((name) => (
                                                            <span key={name} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                                {name}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {ed.participants_count}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/participants?event_edition_id=${ed.id}`}>Manage</Link>
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => openEditEdition(ed)}>
                                                        <Settings2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button size="sm" variant="destructive" onClick={() => setDeletingEdition(ed)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Edit edition dialog ── */}
            <Dialog open={!!editingEdition} onOpenChange={() => setEditingEdition(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Edition {editingEdition?.year}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Templates <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <MultiSelect
                                options={templateOptions}
                                selected={editTemplateIds}
                                onChange={setEditTemplateIds}
                                placeholder="Select templates…"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingEdition(null)}>Cancel</Button>
                        <Button onClick={submitEditEdition} disabled={editProcessing}>
                            {editProcessing ? 'Saving…' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete edition dialog ── */}
            <Dialog open={!!deletingEdition} onOpenChange={() => setDeletingEdition(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Edition {deletingEdition?.year}?</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        All <strong>{deletingEdition?.participants_count} participant{deletingEdition?.participants_count !== 1 ? 's' : ''}</strong> under this edition will also be permanently deleted.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingEdition(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteEdition}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EventsShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Events', href: '/events' },
        { title: 'Event Detail' },
    ],
};
