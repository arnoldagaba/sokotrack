import { Link } from "@tanstack/react-router";
import { HandshakeIcon } from "lucide-react";
import { SidebarMenuButton } from "#/components/ui/sidebar.tsx";

const NavHeader = () => (
    <SidebarMenuButton
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        render={<Link to="/dashboard" />}
        size="lg"
    >
        <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-primary">
            <HandshakeIcon className="size-4" />
        </div>

        <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">SokoTrack</span>
            <span className="truncate text-muted-foreground text-xs">
                Enterprise
            </span>
        </div>
    </SidebarMenuButton>
);

export default NavHeader;
