import { Separator } from "../ui/separator.tsx";
import { SidebarTrigger } from "../ui/sidebar.tsx";
import ThemeToggle from "./theme-toggle.tsx";

const Header = () => (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center border-b bg-background/95 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 supports-backdrop-filter:bg-background/75">
        <div className="flex w-full items-center justify-between px-4">
            <div className="flex items-center">
                <SidebarTrigger className="mr-2" />
                <Separator
                    className="mr-2 data-[orientation=vertical]:h-7"
                    orientation="vertical"
                />
            </div>

            <div className="flex items-center justify-between">
                <ThemeToggle />
            </div>
        </div>
    </header>
);

export default Header;
