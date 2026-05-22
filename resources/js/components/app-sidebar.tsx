import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, FileSpreadsheet, Image, KeyRound, LayoutGrid, LayoutTemplate, PenLine, Shield, UserCog, Users } from 'lucide-react';
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

const mainNavItems: NavItem[] = [
    { title: 'Getting Started', href: dashboard(),  icon: LayoutGrid },
    { title: 'Logos',        href: '/logos',         icon: Image },
    { title: 'Signatures',   href: '/signatures',    icon: PenLine },
    { title: 'Templates',    href: '/templates',     icon: LayoutTemplate },
    { title: 'Events',       href: '/events',        icon: CalendarDays },
    { title: 'Participants', href: '/participants',   icon: Users },
];

const adminNavItems: NavItem[] = [
    { title: 'Users',           href: '/admin/users',           icon: UserCog },
    { title: 'Roles',           href: '/admin/roles',           icon: Shield },
    { title: 'Permissions',     href: '/admin/permissions',     icon: KeyRound },
    { title: 'Import Batches', href: '/admin/import-batches', icon: FileSpreadsheet },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isSuperAdmin = auth.permissions.includes('batches.view-all');
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
                <NavMain items={mainNavItems} />

                {isSuperAdmin && (
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Admin</SidebarGroupLabel>
                        <SidebarMenu>
                            {adminNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
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
