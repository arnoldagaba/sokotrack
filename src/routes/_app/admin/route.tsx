import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "#/features/admin/functions/index.ts";

export const Route = createFileRoute("/_app/admin")({
    beforeLoad: async () => {
        const { session } = await requireAdmin();

        return { session };
    },
});
