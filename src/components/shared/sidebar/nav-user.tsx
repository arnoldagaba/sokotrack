import { useNavigate, useRouteContext } from "@tanstack/react-router";
import {
    ChevronsUpDownIcon,
    LogOutIcon,
    SettingsIcon,
    UserCircleIcon,
} from "lucide-react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "#/components/ui/avatar.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "#/components/ui/sidebar.tsx";
import { authClient } from "#/lib/auth-client.ts";

const NavUser = () => {
    const { user } = useRouteContext({ from: "/_app" });
    const { isMobile } = useSidebar();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    navigate({ to: "/login", replace: true });
                },
            },
        });
    };

    const initials = user.name
        .split(" ")
        .map((n) => n.toUpperCase())
        .join("");

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                size="lg"
                            >
                                <Avatar className="size-8 rounded-lg">
                                    <AvatarImage
                                        alt={user.name}
                                        src={user.image ?? undefined}
                                    />
                                    <AvatarFallback className="rounded-lg">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {user.name}
                                    </span>
                                    <span className="truncate text-muted-foreground text-xs">
                                        {user.email}
                                    </span>
                                </div>

                                <ChevronsUpDownIcon className="ml-auto size-4" />
                            </SidebarMenuButton>
                        }
                    />

                    <DropdownMenuContent
                        align="end"
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-lfet text-sm">
                                    <Avatar className="size-8 rounded-lg">
                                        <AvatarImage
                                            alt={user.name}
                                            src={user.image ?? undefined}
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">
                                            {user.name}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => navigate({ to: "/profile" })}
                                >
                                    <UserCircleIcon /> Profile
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() =>
                                        navigate({ to: "/settings" })
                                    }
                                >
                                    <SettingsIcon /> Settings
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => handleLogout()}
                                >
                                    <LogOutIcon /> Log out
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
};

export default NavUser;
