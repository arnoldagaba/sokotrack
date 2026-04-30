import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { adminMiddleware } from "#/features/admin/middleware/index.ts";
import { auth } from "#/lib/auth.ts";

export const requireAdmin = createServerFn({ method: "GET" }).handler(
    async () => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({ headers });
        if (!session) {
            throw redirect({ to: "/login" });
        }

        if (session.user.role !== "admin") {
            throw redirect({ to: "/" });
        }

        return { session };
    }
);

export const listUsers = createServerFn({ method: "GET" })
    .middleware([adminMiddleware])
    .handler(async () =>
        auth.api.listUsers({
            query: { limit: 50, offset: 0 },
            headers: new Headers(),
        })
    );
