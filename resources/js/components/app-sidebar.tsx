import { Link, router, usePage } from '@inertiajs/react';
import { Activity, Archive, Bell, CalendarDays, ChevronRight, FileSpreadsheet, KeyRound, LayoutTemplate, Mail, Shield, Terminal, UserCog, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';
import type { AppNotification, Auth, NavItem } from '@/types';

function NotificationBell({ notifications }: { notifications: AppNotification[] }) {
    const [open, setOpen] = useState(false);
    const count = notifications.length;

    function markRead(id: string) {
        router.post(`/notifications/${id}/read`, {}, { preserveScroll: true });
    }

    function markAllRead() {
        router.post('/notifications/read-all', {}, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <Bell className="h-4 w-4" />
                    {count > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                            {count > 9 ? '9+' : count}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent side="right" align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-2.5">
                    <span className="text-sm font-semibold">Notifications</span>
                    {count > 0 && (
                        <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground">
                            Mark all read
                        </button>
                    )}
                </div>
                {count === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">No new notifications</p>
                ) : (
                    <ul className="max-h-72 divide-y overflow-y-auto">
                        {notifications.map((n) => (
                            <li key={n.id} className="flex items-start gap-3 px-4 py-3">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                                <div className="flex-1 text-sm">
                                    <p className="font-medium leading-tight">{n.data.message}</p>
                                    {n.data.reason && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">{n.data.reason}</p>
                                    )}
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        Subject: {n.data.subject}
                                    </p>
                                </div>
                                <button
                                    onClick={() => markRead(n.id)}
                                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
                                    title="Dismiss"
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="border-t px-4 py-2">
                    <Link
                        href="/notifications"
                        className="block text-center text-xs text-primary hover:underline"
                        onClick={() => setOpen(false)}
                    >
                        View all notifications
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}

const coreNavItems: NavItem[] = [
    { title: 'Events',       href: '/events',      icon: CalendarDays },
    { title: 'Participants', href: '/participants', icon: Users },
];

const userMgmtNavItems: NavItem[] = [
    { title: 'Users',       href: '/admin/users',       icon: UserCog },
    { title: 'Roles',       href: '/admin/roles',       icon: Shield },
    { title: 'Permissions', href: '/admin/permissions', icon: KeyRound },
];

const batchesNavItems: NavItem[] = [
    { title: 'Import Batches', href: '/admin/import-batches', icon: FileSpreadsheet, permission: 'batches.view-all' },
    { title: 'Email Logs',     href: '/admin/email-logs',     icon: Mail,            permission: 'email-logs.view' },
];

const developerNavItems: NavItem[] = [
    { title: 'Artisan Commands', href: '/admin/artisan-commands', icon: Terminal, permission: 'artisan-commands.view' },
    { title: 'Queue Monitor',    href: '/horizon',                icon: Activity },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = auth.is_super_admin;
    const permissions = useMemo(() => new Set(auth.permissions), [auth.permissions]);
    const notifications = auth.unread_notifications ?? [];
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={
                    (isSuperAdmin || permissions.has('templates.read'))
                        ? [{ title: 'Templates', href: '/templates', icon: LayoutTemplate }, ...coreNavItems]
                        : coreNavItems
                } />

                {isSuperAdmin && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>User Management</SidebarGroupLabel>
                        <SidebarMenu>
                            {userMgmtNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isCurrentUrl(item.href)} tooltip={{ children: item.title }}>
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {(isSuperAdmin || permissions.has('batches.view-all')) && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Batches & Logs</SidebarGroupLabel>
                        <SidebarMenu>
                            {batchesNavItems
                                .filter((item) => isSuperAdmin || (item.permission !== undefined && permissions.has(item.permission)))
                                .map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={isCurrentUrl(item.href)} tooltip={{ children: item.title }}>
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}

                {(isSuperAdmin || permissions.has('artisan-commands.view')) && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Developer</SidebarGroupLabel>
                        <SidebarMenu>
                            {developerNavItems
                                .filter((item) => isSuperAdmin || (item.permission !== undefined && permissions.has(item.permission)))
                                .map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isCurrentUrl(item.href)} tooltip={{ children: item.title }}>
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                )}
                {(isSuperAdmin || permissions.has('events.read')) && (
                    <Collapsible defaultOpen={isCurrentUrl('/events/archived')} className="group/collapsible">
                        <SidebarGroup className="px-2 py-0">
                            <SidebarGroupLabel asChild>
                                <CollapsibleTrigger className="flex w-full items-center justify-between hover:text-foreground">
                                    Archived
                                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isCurrentUrl('/events/archived')} tooltip={{ children: 'Events' }}>
                                            <Link href="/events/archived" prefetch>
                                                <Archive />
                                                <span>Events</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <div className="flex items-center gap-1 px-2 pb-1">
                    <div className="flex-1">
                        <NavUser />
                    </div>
                    <NotificationBell notifications={notifications} />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
