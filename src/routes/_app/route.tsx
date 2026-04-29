import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getSession } from "#/features/auth/functions";

export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ location }) => {
        const { session } = await getSession();
        if (!session) {
            throw redirect({
                to: "/login",
                search: { redirect: location.href },
            });
        }
    },
    component: AppLayout,
});

function AppLayout() {
    return <Outlet />;
}
