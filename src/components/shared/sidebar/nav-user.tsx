import {
    useNavigate,
    useRouteContext,
    useRouter,
} from "@tanstack/react-router";
import {
    ChevronsUpDownIcon,
    LogOutIcon,
    SettingsIcon,
    Undo2Icon,
    UserCircleIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
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

const WHITESPACE_PATTERN = /\s+/;

const NavUser = () => {
    const { session, user } = useRouteContext({ from: "/_app" });
    const { isMobile } = useSidebar();
    const navigate = useNavigate();
    const router = useRouter();
    const [isStoppingImpersonation, setIsStoppingImpersonation] =
        useState(false);
    const isImpersonating = session.session.impersonatedBy != null;

    const handleLogout = async (): Promise<void> => {
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        navigate({ to: "/login", replace: true });
                    },
                },
            });
        } catch {
            // surface feedback (toast/banner) so logout failures are visible
        }
    };

    const handleStopImpersonation = async (): Promise<void> => {
        if (!isImpersonating || isStoppingImpersonation) {
            return;
        }

        setIsStoppingImpersonation(true);

        try {
            await authClient.admin.stopImpersonating();
            await router.invalidate({ sync: true });
            toast.success("Returned to your admin session");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to stop impersonation";
            toast.error(message);
        } finally {
            setIsStoppingImpersonation(false);
        }
    };

    const initials =
        (user.name ?? "")
            .trim()
            .split(WHITESPACE_PATTERN)
            .filter(Boolean)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .slice(0, 2)
            .join("") || "U";

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
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
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

                            {isImpersonating ? (
                                <>
                                    <DropdownMenuSeparator />

                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            disabled={isStoppingImpersonation}
                                            onClick={handleStopImpersonation}
                                        >
                                            <Undo2Icon />
                                            Stop impersonation
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </>
                            ) : null}

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
