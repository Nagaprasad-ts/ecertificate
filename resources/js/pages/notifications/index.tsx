import { Head, router } from '@inertiajs/react';
import { Mail, MailOpen } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import type { AppNotification } from '@/types';

type PaginatedNotifications = {
    data: (AppNotification & { read_at: string | null })[];
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

export default function NotificationsIndex({ notifications }: { notifications: PaginatedNotifications }) {
    function markRead(id: string) {
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    }

    function markAllRead() {
        router.post('/notifications/read-all', {}, { preserveScroll: true });
    }

    const hasUnread = notifications.data.some((n) => !n.read_at);

    return (
        <>
            <Head title="Notifications" />
            <div className="p-6">
                <PageHeader
                    title="Notifications"
                    actions={
                        hasUnread ? (
                            <Button variant="outline" size="sm" onClick={markAllRead}>
                                Mark all as read
                            </Button>
                        ) : undefined
                    }
                />

                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
                        <MailOpen className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No notifications yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Message</th>
                                        <th className="px-4 py-3 text-left font-medium">Subject</th>
                                        <th className="px-4 py-3 text-left font-medium">Reason</th>
                                        <th className="px-4 py-3 text-left font-medium">Time</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.data.map((n) => (
                                        <tr
                                            key={n.id}
                                            className={`border-b last:border-0 transition-colors hover:bg-muted/30 ${!n.read_at ? 'bg-primary/5' : ''}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {n.read_at ? (
                                                        <MailOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    ) : (
                                                        <Mail className="h-4 w-4 shrink-0 text-destructive" />
                                                    )}
                                                    <span className={n.read_at ? 'text-muted-foreground' : 'font-medium'}>
                                                        {n.data.message}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{n.data.subject}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{n.data.reason ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {new Date(n.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {!n.read_at && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => markRead(n.id)}
                                                    >
                                                        Mark read
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {notifications.last_page > 1 && (
                            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                <span>Page {notifications.current_page} of {notifications.last_page}</span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!notifications.prev_page_url}
                                        onClick={() => notifications.prev_page_url && router.get(notifications.prev_page_url)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={!notifications.next_page_url}
                                        onClick={() => notifications.next_page_url && router.get(notifications.next_page_url)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Notifications', href: '/notifications' },
    ],
};
