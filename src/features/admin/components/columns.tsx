import { useRouteContext, useRouter } from "@tanstack/react-router";
import type { ColumnDef, Row } from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins";
import {
    EyeIcon,
    LogOutIcon,
    MoreHorizontalIcon,
    Trash2Icon,
    UserRoundSearchIcon,
    UserXIcon,
} from "lucide-react";
import { Button } from "#/components/ui/button.tsx";
import { Checkbox } from "#/components/ui/checkbox.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import {
    handleUserBan,
    handleUserImpersonation,
    handleUserRemoval,
    handleUserSessionsRevoke,
} from "../functions/actions.ts";
import { TableColumnHeader } from "./table-column-header.tsx";

const ActionsCell = ({ row }: { row: Row<UserWithRole> }) => {
    {
        const router = useRouter();
        const { user } = useRouteContext({ from: "/_app" });
        const userId = row.original.id;

        return (
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button className="h-8 w-8 p-0" variant="ghost">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                    }
                />

                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onClick={() =>
                                router.navigate({
                                    to: "/admin/users/$userId",
                                    params: { userId },
                                })
                            }
                        >
                            <EyeIcon /> View user
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() =>
                                handleUserSessionsRevoke(userId, router)
                            }
                        >
                            <LogOutIcon /> Revoke all sessions
                        </DropdownMenuItem>

                        {user.id !== userId && (
                            <>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleUserImpersonation(userId, user)
                                    }
                                >
                                    <UserRoundSearchIcon /> Impersonate user
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    onClick={() => handleUserBan(userId, user)}
                                >
                                    <UserXIcon /> Ban user
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() =>
                                        handleUserRemoval(userId, user)
                                    }
                                >
                                    <Trash2Icon /> Remove user
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
}

export const columns: ColumnDef<UserWithRole>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                aria-label="Select all"
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                aria-label="Select row"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <TableColumnHeader column={column} title="Full Name" />
        ),
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <TableColumnHeader column={column} title="Email" />
        ),
    },
    {
        accessorKey: "role",
        header: ({ column }) => (
            <TableColumnHeader column={column} title="User Role" />
        ),
    },
    {
        accessorKey: "banned",
        header: ({ column }) => (
            <TableColumnHeader column={column} title="Banned" />
        ),
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionsCell row={row} />
    },
];
