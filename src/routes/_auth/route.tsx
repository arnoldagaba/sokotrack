import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "#/features/auth/functions";

export const Route = createFileRoute("/_auth")({
    beforeLoad: async () => {
        const result = await getSession().catch(() => null);
        if (result?.session) {
            throw redirect({ to: "/dashboard" });
        }
    },
});
