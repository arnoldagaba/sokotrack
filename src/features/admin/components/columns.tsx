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
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "#/components/ui/alert-dialog.tsx";
import { Badge } from "#/components/ui/badge.tsx";
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

const roleVariants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
> = {
    admin: "destructive",
    manager: "secondary",
    staff: "default",
};

const RoleBadge = ({ role }: { role: string | null | undefined }) => {
    const variant = roleVariants[role ?? ""] ?? "outline";
    return (
        <Badge className="capitalize" variant={variant}>
            {role ?? "unknown"}
        </Badge>
    );
};

const ActionsCell = ({ row }: { row: Row<UserWithRole> }) => {
    const router = useRouter();
    const { user } = useRouteContext({ from: "/_app" });
    const userId = row.original.id;
    const [openDialog, setOpenDialog] = useState<string | null>(null);

    const handleAction = (action: () => void) => {
        setOpenDialog(null);
        action();
    };

    return (
        <>
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
                            onClick={() => setOpenDialog("revoke")}
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
                                    onClick={() => setOpenDialog("ban")}
                                >
                                    <UserXIcon /> Ban user
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => setOpenDialog("remove")}
                                >
                                    <Trash2Icon /> Remove user
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                onOpenChange={(open) => !open && setOpenDialog(null)}
                open={openDialog === "revoke"}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Revoke all sessions?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will log the user out of all devices. They will
                            need to sign in again on each device.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                handleAction(() =>
                                    handleUserSessionsRevoke(userId, router)
                                )
                            }
                        >
                            Revoke Sessions
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                onOpenChange={(open) => !open && setOpenDialog(null)}
                open={openDialog === "ban"}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ban user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will prevent the user from accessing their
                            account. You can unban them later from the admin
                            panel.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                handleAction(() =>
                                    handleUserBan(userId, user, router)
                                )
                            }
                        >
                            Ban User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                onOpenChange={(open) => !open && setOpenDialog(null)}
                open={openDialog === "remove"}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The user and all their
                            data will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() =>
                                handleAction(() =>
                                    handleUserRemoval(userId, user, router)
                                )
                            }
                        >
                            Remove User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

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
        accessorKey: "emailVerified",
        header: ({ column }) => (
            <TableColumnHeader column={column} title="Email Verified" />
        ),
    },
    {
        accessorKey: "role",
        header: ({ column }) => (
            <TableColumnHeader column={column} title="User Role" />
        ),
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
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
        cell: ({ row }) => <ActionsCell row={row} />,
    },
];
