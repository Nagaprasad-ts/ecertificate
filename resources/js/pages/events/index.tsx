import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Auth } from '@/types';

type EventItem = {
    id: number;
    event_name: string;
    logo: string | null;
    initials: string;
    editions_count: number;
};

const VIEW_KEY = 'events-view';

export default function EventsIndex({ events }: { events: EventItem[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = (auth.user as Record<string, unknown> & { role?: { slug: string } })?.role?.slug === 'super_admin';

    const [view, setView]           = useState<'grid' | 'list'>(() =>
        (localStorage.getItem(VIEW_KEY) as 'grid' | 'list') ?? 'grid',
    );
    const [search, setSearch]       = useState('');
    const [deleting, setDeleting]   = useState<EventItem | null>(null);

    function switchView(v: 'grid' | 'list') {
        setView(v);
        localStorage.setItem(VIEW_KEY, v);
    }

    const q       = search.trim().toLowerCase();
    const visible = q
        ? events.filter((e) => e.event_name.toLowerCase().includes(q))
        : events;

    function handleDelete() {
        if (!deleting) {
            return;
        }
        
        router.delete(`/events/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <>
            <Head title="Events" />
            <div className="p-6">

                <PageHeader
                    title="Events"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search events…"
                    view={view}
                    onViewChange={switchView}
                    actions={
                        <Button asChild>
                            <Link href="/events/create">
                                <Plus className="mr-2 h-4 w-4" /> New Event
                            </Link>
                        </Button>
                    }
                />

                {/* ── Empty states ── */}
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                        <p className="text-muted-foreground">No events yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/events/create"><Plus className="mr-2 h-4 w-4" /> Create your first event</Link>
                        </Button>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                        <p className="text-muted-foreground">No events match <strong>"{search}"</strong>.</p>
                        <button type="button" onClick={() => setSearch('')} className="mt-2 text-sm text-primary hover:underline">
                            Clear search
                        </button>
                    </div>

                ) : view === 'grid' ? (
                    /* ── Grid view ── */
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {visible.map((event) => (
                            <Link
                                key={event.id}
                                href={`/events/${event.id}`}
                                className="group relative flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                            >
                                {/* Logo or initials */}
                                {event.logo ? (
                                    <img
                                        src={`/storage/${event.logo}`}
                                        alt={event.event_name}
                                        className="h-24 w-full rounded-xl object-contain"
                                    />
                                ) : (
                                    <div className="flex h-24 w-full items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
                                        {event.initials}
                                    </div>
                                )}

                                <div className="w-full text-center">
                                    <p className="font-semibold leading-tight">{event.event_name}</p>
                                    <span className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {event.editions_count === 0
                                            ? 'No editions yet'
                                            : `${event.editions_count} edition${event.editions_count !== 1 ? 's' : ''}`}
                                    </span>
                                </div>

                                {/* Delete — super admin only */}
                                {isSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={(e) => { 
                                            e.preventDefault(); setDeleting(event); 
                                        }}
                                        className="absolute right-2 top-2 hidden rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </Link>
                        ))}
                    </div>

                ) : (
                    /* ── List view ── */
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Logo</th>
                                    <th className="px-4 py-3 text-left font-medium">Event Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Editions</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((event) => (
                                    <tr key={event.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            {event.logo ? (
                                                <img
                                                    src={`/storage/${event.logo}`}
                                                    alt={event.event_name}
                                                    className="h-10 w-16 rounded border bg-muted object-contain"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-16 items-center justify-center rounded border bg-primary/10 text-sm font-bold text-primary">
                                                    {event.initials}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium">{event.event_name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {event.editions_count === 0
                                                    ? 'No editions yet'
                                                    : `${event.editions_count} edition${event.editions_count !== 1 ? 's' : ''}`}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/events/${event.id}`}><Pencil className="h-3.5 w-3.5" /></Link>
                                                </Button>
                                                {isSuperAdmin && (
                                                    <Button variant="destructive" size="sm" onClick={() => setDeleting(event)}>
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Event</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Delete <strong>{deleting?.event_name}</strong>? All editions and participants under this event will also be permanently deleted.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

EventsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Events', href: '/events' },
    ],
};
