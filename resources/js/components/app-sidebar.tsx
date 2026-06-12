import { Link, usePage } from '@inertiajs/react';
import { Activity, CalendarDays, FileSpreadsheet, KeyRound, LayoutTemplate, Mail, Shield, Terminal, UserCog, Users } from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
import type { Auth, NavItem } from '@/types';

const coreNavItems: NavItem[] = [
    { title: 'Events',       href: '/events',        icon: CalendarDays },
    { title: 'Participants', href: '/participants',   icon: Users },
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
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
