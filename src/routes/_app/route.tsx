import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Header from "#/components/shared/header.tsx";
import AppSidebar from "#/components/shared/sidebar/app-sidebar.tsx";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar.tsx";
import { getSession } from "#/features/auth/functions/index.ts";

export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ location }) => {
        const { session } = await getSession();
        if (!session) {
            throw redirect({
                to: "/login",
                search: { redirect: location.href },
            });
        }

        return { user: session.user, session };
    },
    component: AppLayout,
});

function AppLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <Header />

                <main className="px-4 pt-2">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
