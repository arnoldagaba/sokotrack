import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "#/components/ui/sidebar.tsx";
import NavContent from "./nav-content.tsx";
import NavHeader from "./nav-header.tsx";
import NavUser from "./nav-user.tsx";

const AppSidebar = () => (
    <Sidebar collapsible="icon">
        <SidebarHeader>
            <NavHeader />
        </SidebarHeader>

        <SidebarContent>
            <NavContent />
        </SidebarContent>

        <SidebarFooter>
            <NavUser />
        </SidebarFooter>
    </Sidebar>
);

export default AppSidebar;
