import {
    createFileRoute,
    useRouteContext,
    useRouter,
} from "@tanstack/react-router";
import {
    functionalUpdate,
    type OnChangeFn,
    type PaginationState,
} from "@tanstack/react-table";
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

const PAGE_SIZE = 10;

const searchSchema = z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).default(PAGE_SIZE),
    searchTerm: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/admin/users/")({
    component: RouteComponent,
    loaderDeps: ({ search }) => ({
        page: search.page,
        pageSize: search.pageSize,
        search: search.searchTerm,
    }),
    loader: async ({ deps }) => {
        const { users, total } = await listUsers({
            data: {
                limit: deps.pageSize,
                offset: (deps.page - 1) * deps.pageSize,
                search: deps.search,
            },
        });

        return { users, total };
    },
    validateSearch: searchSchema,
});

function RouteComponent() {
    const { users, total } = Route.useLoaderData();
    const { page, pageSize, searchTerm } = Route.useSearch();
    const navigate = Route.useNavigate();
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

    const handleGlobalFilterChange: OnChangeFn<string> = (updaterOrValue) => {
        const nextSearchTerm = functionalUpdate(
            updaterOrValue,
            searchTerm ?? ""
        );

        navigate({
            replace: true,
            search: (previousSearch) => ({
                ...previousSearch,
                page: 1,
                searchTerm: nextSearchTerm === "" ? undefined : nextSearchTerm,
            }),
        });
    };

    const handlePaginationChange: OnChangeFn<PaginationState> = (
        updaterOrValue
    ) => {
        const nextPagination = functionalUpdate(updaterOrValue, {
            pageIndex: page - 1,
            pageSize,
        });
        const nextPage =
            nextPagination.pageSize === pageSize
                ? nextPagination.pageIndex + 1
                : 1;

        navigate({
            search: (previousSearch) => ({
                ...previousSearch,
                page: nextPage,
                pageSize: nextPagination.pageSize,
            }),
        });
    };

    return (
        <div>
            <UserTable
                columns={columns}
                data={users}
                globalFilter={searchTerm ?? ""}
                onBulkBan={handleBulkBan}
                onBulkDelete={handleBulkDelete}
                onBulkRevokeSessions={handleBulkRevokeSessions}
                onBulkUnban={handleBulkUnban}
                onGlobalFilterChange={handleGlobalFilterChange}
                onPaginationChange={handlePaginationChange}
                pageIndex={page - 1}
                pageSize={pageSize}
                total={total}
            />
        </div>
    );
}
