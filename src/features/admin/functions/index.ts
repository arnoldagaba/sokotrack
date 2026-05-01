import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.ts";
import { listUsersInputSchema } from "../schema/index.ts";

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
    .inputValidator(listUsersInputSchema)
    .handler(async ({ data }) => {
        const headers = getRequestHeaders();
        const session = await auth.api.getSession({ headers });
        if (!session) {
            throw redirect({ to: "/login" });
        }
        if (session.user.role !== "admin") {
            throw redirect({ to: "/" });
        }

        const { users, total } = await auth.api.listUsers({
            query: {
                limit: data.limit,
                offset: data.offset,
                searchField: "email",
                searchValue: data.search,
                searchOperator: "contains",
            },
            headers,
        });

        return { users, total };
    });
