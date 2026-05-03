import {
    createFileRoute,
    useRouteContext,
    useRouter,
} from "@tanstack/react-router";
import { z } from "zod";
import { columns } from "#/features/admin/components/columns.tsx";
import UserTable from "#/features/admin/components/user-table.tsx";
import {
    handleBulkUserBan,
    handleBulkUserRemoval,
    handleBulkUserSessionsRevoke,
    handleBulkUserUnban,
} from "#/features/admin/functions/actions.ts";
import { listUsers } from "#/features/admin/functions/index.ts";

const searchSchema = z.object({
    page: z.number().int().min(1).default(1),
    searchTerm: z.string().optional().catch(undefined),
});

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_app/admin/users/")({
    component: RouteComponent,
    loaderDeps: ({ search }) => ({
        page: search.page,
        search: search.searchTerm,
    }),
    loader: async ({ deps }) => {
        const { users, total } = await listUsers({
            data: {
                limit: PAGE_SIZE,
                offset: (deps.page - 1) * PAGE_SIZE,
                search: deps.search,
            },
        });

        return { users, total };
    },
    validateSearch: searchSchema,
});

function RouteComponent() {
    const { users, total } = Route.useLoaderData();
    const router = useRouter();
    const { user: currentUser } = useRouteContext({ from: "/_app" });

    const handleBulkBan = (userIds: string[]) => {
        handleBulkUserBan(userIds, currentUser, router);
    };

    const handleBulkUnban = (userIds: string[]) => {
        handleBulkUserUnban(userIds, currentUser, router);
    };

    const handleBulkDelete = (userIds: string[]) => {
        handleBulkUserRemoval(userIds, currentUser, router);
    };

    const handleBulkRevokeSessions = (userIds: string[]) => {
        handleBulkUserSessionsRevoke(userIds, router);
    };

    return (
        <div>
            <UserTable
                columns={columns}
                data={users}
                onBulkBan={handleBulkBan}
                onBulkDelete={handleBulkDelete}
                onBulkRevokeSessions={handleBulkRevokeSessions}
                onBulkUnban={handleBulkUnban}
                total={total}
            />
        </div>
    );
}
