import { Link, useRouteContext, useRouterState } from "@tanstack/react-router";
import { LayoutDashboardIcon, ShieldIcon, UsersIcon } from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "#/components/ui/sidebar.tsx";

const NavContent = () => {
    const { user } = useRouteContext({ from: "/_app" });
    const pathname = useRouterState({
        select: (state) => state.location.pathname,
    });

    if (user.role !== "admin") {
        return null;
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>

            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        isActive={
                            pathname === "/admin" || pathname === "/admin/"
                        }
                        render={<Link to="/admin" />}
                    >
                        <ShieldIcon />
                        <span>Admin Dashboard</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                    <SidebarMenuButton
                        isActive={pathname.startsWith("/admin/users")}
                        render={<Link to="/admin/users" />}
                    >
                        <UsersIcon />
                        <span>Users</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                    <SidebarMenuButton
                        isActive={pathname === "/dashboard"}
                        render={<Link to="/dashboard" />}
                    >
                        <LayoutDashboardIcon />
                        <span>Workspace</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
};

export default NavContent;
