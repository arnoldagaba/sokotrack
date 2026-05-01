import { createFileRoute } from "@tanstack/react-router";
import { columns } from "#/features/admin/components/columns.tsx";
import UserTable from "#/features/admin/components/user-table.tsx";
import { listUsers } from "#/features/admin/functions/index.ts";

export const Route = createFileRoute("/_app/admin/users/")({
    component: RouteComponent,
    loader: async () => {
        const { users, total } = await listUsers();

        return { users, total };
    },
});

function RouteComponent() {
    const { users, total } = Route.useLoaderData();

    return <UserTable columns={columns} data={users} />;
}
