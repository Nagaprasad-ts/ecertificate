import { Head, router, usePage } from '@inertiajs/react';
import { ArchiveRestore, CalendarDays, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

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
    archived_at: string | null;
};

function EditionCount({ count }: { count: number }) {
    return (
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            {count === 0 ? 'No editions yet' : `${count} edition${count !== 1 ? 's' : ''}`}
        </span>
    );
}

export default function ArchivedEventsIndex({ archivedEvents }: { archivedEvents: EventItem[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const canArchive = auth.is_super_admin;
    const canDelete = auth.is_super_admin || auth.permissions.includes('events.delete');

    const [search, setSearch]   = useState('');
    const [restoring, setRestoring] = useState<EventItem | null>(null);
    const [deleting, setDeleting]   = useState<EventItem | null>(null);

    const q       = search.trim().toLowerCase();
    const visible = q ? archivedEvents.filter((e) => e.event_name.toLowerCase().includes(q)) : archivedEvents;

    function handleRestore(e: FormEvent) {
        e.preventDefault();
        if (!restoring) {
            return;
        }
        router.post(`/events/${restoring.id}/unarchive`, {}, { onFinish: () => setRestoring(null) });
    }

    function handleDelete(e: FormEvent) {
        e.preventDefault();
        if (!deleting) {
            return;
        }
        router.delete(`/events/${deleting.id}`, { onFinish: () => setDeleting(null) });
    }

    return (
        <>
            <Head title="Archived Events" />
            <div className="p-6">
                <PageHeader
                    title="Archived Events"
                    search={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search archived events…"
                />

                {archivedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                        <p className="text-muted-foreground">No archived events.</p>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                        <p className="text-muted-foreground">No archived events match <strong>"{search}"</strong>.</p>
                        <button type="button" onClick={() => setSearch('')} className="mt-2 text-sm text-primary hover:underline">
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed bg-muted/20">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/30">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Logo</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Event Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Editions</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((event) => (
                                    <tr key={event.id} className="border-b last:border-0 opacity-70 transition-opacity hover:opacity-100">
                                        <td className="px-4 py-3">
                                            {event.logo ? (
                                                <img
                                                    src={`/storage/${event.logo}`}
                                                    alt={event.event_name}
                                                    className="h-10 w-16 rounded border bg-muted object-contain grayscale"
                                                />
                                            ) : (
                                                <div className="flex h-10 w-16 items-center justify-center rounded border bg-muted text-sm font-bold text-muted-foreground">
                                                    {event.initials}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-muted-foreground">{event.event_name}</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <EditionCount count={event.editions_count} />
                                        </td>
                                        <td className="px-4 py-3">
                                            {(canArchive || canDelete) && (
                                                <div className="flex items-center justify-end gap-2">
                                                    {canArchive && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setRestoring(event)}
                                                            title="Restore event"
                                                        >
                                                            <ArchiveRestore className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                    {canDelete && (
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setDeleting(event)}
                                                            title="Delete permanently"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Restore confirm dialog */}
            <Dialog open={!!restoring} onOpenChange={() => setRestoring(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Restore Event</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Restore <strong>{restoring?.event_name}</strong> to active events?
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRestoring(null)}>Cancel</Button>
                        <Button onClick={handleRestore}>
                            <ArchiveRestore className="mr-2 h-3.5 w-3.5" /> Restore
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete confirm dialog */}
            <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Event Permanently</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete <strong>{deleting?.event_name}</strong>? All editions, participants, and certificates
                        under this event will be irreversibly removed.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

ArchivedEventsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Events', href: '/events' },
        { title: 'Archived Events', href: '/events/archived' },
    ],
};
