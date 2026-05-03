import { useRouteContext, useRouter } from "@tanstack/react-router";
import type { ColumnDef, Row } from "@tanstack/react-table";
import type { UserWithRole } from "better-auth/plugins";
import {
    EyeIcon,
    LogOutIcon,
    MoreHorizontalIcon,
    Trash2Icon,
    UserRoundSearchIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select.tsx";
import type { Role } from "#/lib/permissions.ts";
import { cn } from "#/lib/utils.ts";
import {
    handleUserBanStatusChange,
    handleUserImpersonation,
    handleUserRemoval,
    handleUserRoleChange,
    handleUserSessionsRevoke,
} from "../functions/actions.ts";
import { TableColumnHeader } from "./table-column-header.tsx";

const ROLE_OPTIONS = [
    { label: "Admin", value: "admin" },
    { label: "Manager", value: "manager" },
    { label: "Staff", value: "staff" },
] as const satisfies readonly { label: string; value: Role }[];

const STATUS_OPTIONS = [
    { label: "Active", value: "active" },
    { label: "Banned", value: "banned" },
] as const;

const roleTriggerClasses: Record<Role, string> = {
    admin: "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15",
    manager:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-300",
    staff: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300",
};

const getStatusTriggerClass = (banned: boolean) =>
    banned
        ? "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15"
        : "border-sky-500/20 bg-sky-500/10 text-sky-700 hover:bg-sky-500/15 dark:text-sky-300";

const normalizeRole = (role: string | null | undefined): Role => {
    if (role === "admin" || role === "manager" || role === "staff") {
        return role;
    }

    return "staff";
};

const getUserLabel = (row: Row<UserWithRole>) =>
    row.original.name || row.original.email || "this user";

const RoleCell = ({ row }: { row: Row<UserWithRole> }) => {
    const router = useRouter();
    const { user } = useRouteContext({ from: "/_app" });
    const [role, setRole] = useState<Role>(normalizeRole(row.original.role));
    const [isPending, setIsPending] = useState(false);
    const [pendingRole, setPendingRole] = useState<Role | null>(null);

    useEffect(() => {
        setRole(normalizeRole(row.original.role));
    }, [row.original.role]);

    const isCurrentUser = user.id === row.original.id;
    const userLabel = getUserLabel(row);
    const confirmRoleChange = async () => {
        if (!pendingRole || pendingRole === role) {
            setPendingRole(null);
            return;
        }

        const previousRole = role;
        setRole(pendingRole);
        setIsPending(true);

        const didUpdate = await handleUserRoleChange(
            row.original.id,
            pendingRole,
            user,
            router
        );

        if (!didUpdate) {
            setRole(previousRole);
        }

        setIsPending(false);
        setPendingRole(null);
    };

    return (
        <>
            <Select
                onValueChange={(value) => {
                    const nextRole = normalizeRole(value);

                    if (isCurrentUser || isPending || nextRole === role) {
                        return;
                    }

                    setPendingRole(nextRole);
                }}
                value={role}
            >
                <SelectTrigger
                    aria-label={`Change role for ${userLabel}`}
                    className={cn(
                        "h-8 min-w-30 border px-2.5 font-medium capitalize shadow-none transition-colors",
                        roleTriggerClasses[role],
                        (isPending || isCurrentUser) &&
                            "cursor-not-allowed opacity-70"
                    )}
                    disabled={isPending || isCurrentUser}
                    size="sm"
                    title={
                        isCurrentUser
                            ? "You cannot change your own role"
                            : undefined
                    }
                >
                    <SelectValue />
                </SelectTrigger>

                <SelectContent align="start">
                    {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <AlertDialog
                onOpenChange={(open) => !open && setPendingRole(null)}
                open={pendingRole !== null}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirm role change?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {`This will change ${userLabel} to ${
                                pendingRole ?? role
                            }.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleChange}>
                            Change Role
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

const BannedStatusCell = ({ row }: { row: Row<UserWithRole> }) => {
    const router = useRouter();
    const { user } = useRouteContext({ from: "/_app" });
    const [status, setStatus] = useState(
        row.original.banned ? "banned" : "active"
    );
    const [isPending, setIsPending] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<"banned" | null>(null);

    useEffect(() => {
        setStatus(row.original.banned ? "banned" : "active");
    }, [row.original.banned]);

    const isCurrentUser = user.id === row.original.id;
    const userLabel = getUserLabel(row);
    const isBanned = status === "banned";
    const updateBanStatus = async (nextStatus: "banned" | "active") => {
        const previousStatus = status;

        setStatus(nextStatus);
        setIsPending(true);

        const didUpdate = await handleUserBanStatusChange(
            row.original.id,
            nextStatus === "banned",
            user,
            router
        );

        if (!didUpdate) {
            setStatus(previousStatus);
        }

        setIsPending(false);
    };
    const confirmBan = async () => {
        if (!pendingStatus) {
            return;
        }

        await updateBanStatus(pendingStatus);
        setPendingStatus(null);
    };

    return (
        <>
            <Select
                onValueChange={async (value) => {
                    if (isCurrentUser || isPending || value === status) {
                        return;
                    }

                    const nextStatus = value === "banned" ? "banned" : "active";

                    if (nextStatus === "banned") {
                        setPendingStatus(nextStatus);
                        return;
                    }

                    await updateBanStatus(nextStatus);
                }}
                value={status}
            >
                <SelectTrigger
                    aria-label={`Change access status for ${userLabel}`}
                    className={cn(
                        "h-8 min-w-28 border px-2.5 font-medium shadow-none transition-colors",
                        getStatusTriggerClass(isBanned),
                        (isPending || isCurrentUser) &&
                            "cursor-not-allowed opacity-70"
                    )}
                    disabled={isPending || isCurrentUser}
                    size="sm"
                    title={
                        isCurrentUser
                            ? "You cannot change your own access status"
                            : undefined
                    }
                >
                    <SelectValue />
                </SelectTrigger>

                <SelectContent align="start">
                    {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <AlertDialog
                onOpenChange={(open) => !open && setPendingStatus(null)}
                open={pendingStatus !== null}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm ban?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {`This will block ${userLabel} from accessing their account until they are unbanned.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmBan}>
                            Ban User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
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
            <TableColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => <RoleCell row={row} />,
    },
    {
        accessorKey: "banned",
        header: ({ column }) => (
            <TableColumnHeader column={column} title="Ban Access" />
        ),
        cell: ({ row }) => <BannedStatusCell row={row} />,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <ActionsCell row={row} />,
    },
];
