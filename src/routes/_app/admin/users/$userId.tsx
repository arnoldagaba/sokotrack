import {
    createFileRoute,
    Link,
    useRouteContext,
    useRouter,
} from "@tanstack/react-router";
import {
    AlertTriangleIcon,
    ArrowLeftIcon,
    BanIcon,
    LogOutIcon,
    MailCheckIcon,
    ShieldCheckIcon,
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
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "#/components/ui/avatar.tsx";
import { Badge } from "#/components/ui/badge.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card.tsx";
import { Field, FieldDescription, FieldLabel } from "#/components/ui/field.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table.tsx";
import {
    handleUserBanStatusChange,
    handleUserImpersonation,
    handleUserRemoval,
    handleUserRoleChange,
    handleUserSessionsRevoke,
} from "#/features/admin/functions/actions.ts";
import {
    getUserById,
    listUserSessions,
} from "#/features/admin/functions/index.ts";
import {
    formatAdminDate,
    formatAdminDateOnly,
    getAdminRoleLabel,
    getUserInitials,
    normalizeAdminRole,
} from "#/features/admin/utils.ts";
import type { Role } from "#/lib/permissions.ts";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/_app/admin/users/$userId")({
    loader: async ({ params }) => {
        const [user, { sessions }] = await Promise.all([
            getUserById({ data: { userId: params.userId } }),
            listUserSessions({ data: { userId: params.userId } }),
        ]);

        return { sessions, user };
    },
    component: RouteComponent,
});

const rolePillClasses = {
    admin: "border-destructive/20 bg-destructive/10 text-destructive",
    manager:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    staff: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
} as const;

const accessPillClasses = {
    active: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    banned: "border-destructive/20 bg-destructive/10 text-destructive",
} as const;

const formatSessionAgent = (userAgent: string | null) => {
    if (!userAgent) {
        return "Unknown device";
    }

    return userAgent.length > 80 ? `${userAgent.slice(0, 77)}...` : userAgent;
};

function RouteComponent() {
    const { user, sessions } = Route.useLoaderData();
    const router = useRouter();
    const { user: currentUser } = useRouteContext({ from: "/_app" });
    const [selectedRole, setSelectedRole] = useState<Role>(
        normalizeAdminRole(user.role)
    );
    const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);
    const [openDialog, setOpenDialog] = useState<"ban" | "delete" | null>(null);

    useEffect(() => {
        setSelectedRole(normalizeAdminRole(user.role));
    }, [user.role]);

    const isCurrentUser = currentUser.id === user.id;
    const accessState = user.banned === true ? "banned" : "active";

    const applyRoleUpdate = async () => {
        if (selectedRole === normalizeAdminRole(user.role)) {
            return;
        }

        setIsRoleSubmitting(true);
        await handleUserRoleChange(user.id, selectedRole, currentUser, router);
        setIsRoleSubmitting(false);
    };

    const revokeSessions = async () => {
        await handleUserSessionsRevoke(user.id, router);
    };

    const toggleBanState = async (nextBanned: boolean) => {
        const didUpdate = await handleUserBanStatusChange(
            user.id,
            nextBanned,
            currentUser,
            router
        );
        if (didUpdate) {
            setOpenDialog(null);
        }
    };
    };

    const removeUser = async () => {
        await handleUserRemoval(user.id, currentUser, router);
        setOpenDialog(null);
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="space-y-2">
                <Button
                    className="-ml-2"
                    render={<Link to="/admin/users" />}
                    variant="ghost"
                >
                    <ArrowLeftIcon />
                    Back to users
                </Button>

                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div className="flex items-start gap-4">
                        <Avatar className="size-16 rounded-2xl border">
                            <AvatarImage
                                alt={user.name ?? user.email}
                                src={user.image ?? undefined}
                            />
                            <AvatarFallback className="rounded-2xl text-lg">
                                {getUserInitials(user.name, user.email)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="font-heading text-3xl tracking-tight">
                                    {user.name}
                                </h1>
                                <Badge
                                    className={cn(
                                        "border",
                                        rolePillClasses[
                                            normalizeAdminRole(user.role)
                                        ]
                                    )}
                                    variant="outline"
                                >
                                    {getAdminRoleLabel(user.role)}
                                </Badge>
                                <Badge
                                    className={cn(
                                        "border",
                                        accessPillClasses[accessState]
                                    )}
                                    variant="outline"
                                >
                                    {accessState === "banned"
                                        ? "Banned"
                                        : "Active"}
                                </Badge>
                                <Badge
                                    variant={
                                        user.emailVerified
                                            ? "secondary"
                                            : "outline"
                                    }
                                >
                                    {user.emailVerified
                                        ? "Email verified"
                                        : "Email unverified"}
                                </Badge>
                            </div>

                            <div className="text-muted-foreground text-sm">
                                {user.email}
                            </div>
                            <div className="text-muted-foreground text-sm">
                                Added {formatAdminDateOnly(user.createdAt)} and
                                last updated {formatAdminDate(user.updatedAt)}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            disabled={isCurrentUser}
                            onClick={() =>
                                handleUserImpersonation(user.id, currentUser)
                            }
                            variant="outline"
                        >
                            <UserRoundSearchIcon />
                            Impersonate
                        </Button>
                        <Button onClick={revokeSessions} variant="outline">
                            <LogOutIcon />
                            Revoke sessions
                        </Button>
                    </div>
                </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="bg-linear-to-br from-card to-muted/40">
                    <CardHeader>
                        <CardDescription>Access status</CardDescription>
                        <CardTitle className="text-2xl">
                            {accessState === "banned" ? "Blocked" : "Clear"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        {user.banned
                            ? user.banReason ||
                              "This user is currently prevented from signing in."
                            : "This user can access the application."}
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-card to-muted/40">
                    <CardHeader>
                        <CardDescription>Role assignment</CardDescription>
                        <CardTitle className="text-2xl">
                            {getAdminRoleLabel(user.role)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Current permission envelope applied to this account.
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-card to-muted/40">
                    <CardHeader>
                        <CardDescription>Active sessions</CardDescription>
                        <CardTitle className="text-2xl">
                            {sessions.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Every listed session can be revoked in one action.
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-br from-card to-muted/40">
                    <CardHeader>
                        <CardDescription>Email posture</CardDescription>
                        <CardTitle className="text-2xl">
                            {user.emailVerified ? "Verified" : "Pending"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground text-sm">
                        Verification state as stored on the user record.
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card>
                    <CardHeader className="border-b">
                        <CardDescription>Session inventory</CardDescription>
                        <CardTitle>Current and historical sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Started</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Device</TableHead>
                                    <TableHead>Network</TableHead>
                                    <TableHead>Impersonation</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell>
                                            {formatAdminDate(session.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            {formatAdminDate(session.expiresAt)}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">
                                            {formatSessionAgent(
                                                session.userAgent
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {session.ipAddress ||
                                                "Not captured"}
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            {session.impersonatedByUser ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {session
                                                            .impersonatedByUser
                                                            .name ||
                                                            session
                                                                .impersonatedByUser
                                                                .email}
                                                    </span>
                                                    <span className="truncate text-muted-foreground text-xs">
                                                        {
                                                            session
                                                                .impersonatedByUser
                                                                .email
                                                        }
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Direct sign-in
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card>
                        <CardHeader className="border-b">
                            <CardDescription>Role management</CardDescription>
                            <CardTitle>Adjust permissions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <Field>
                                <FieldLabel htmlFor="user-role-select">
                                    Assigned role
                                </FieldLabel>
                                <Select
                                    onValueChange={(value) =>
                                        setSelectedRole(value as Role)
                                    }
                                    value={selectedRole}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        disabled={isCurrentUser}
                                        id="user-role-select"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">
                                            Staff
                                        </SelectItem>
                                        <SelectItem value="manager">
                                            Manager
                                        </SelectItem>
                                        <SelectItem value="admin">
                                            Admin
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldDescription>
                                    {isCurrentUser
                                        ? "You cannot modify your own role from the admin console."
                                        : "Apply a new role to change what this user can do across the product."}
                                </FieldDescription>
                            </Field>

                            <Button
                                disabled={
                                    isCurrentUser ||
                                    isRoleSubmitting ||
                                    selectedRole ===
                                        normalizeAdminRole(user.role)
                                }
                                onClick={applyRoleUpdate}
                            >
                                <ShieldCheckIcon />
                                Update role
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b">
                            <CardDescription>Access controls</CardDescription>
                            <CardTitle>Moderate sign-in access</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="rounded-2xl border border-border/60 bg-muted/40 p-4 text-sm/6">
                                {user.banned ? (
                                    <>
                                        <div className="font-medium">
                                            This account is currently banned.
                                        </div>
                                        <div className="mt-1 text-muted-foreground">
                                            Ban expires:{" "}
                                            {user.banExpires
                                                ? formatAdminDate(
                                                      user.banExpires
                                                  )
                                                : "No automatic expiry"}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-medium">
                                            This account is active.
                                        </div>
                                        <div className="mt-1 text-muted-foreground">
                                            Banning the user blocks future
                                            sign-ins until access is restored.
                                        </div>
                                    </>
                                )}
                            </div>

                            {user.banned ? (
                                <Button
                                    disabled={isCurrentUser}
                                    onClick={() => toggleBanState(false)}
                                    variant="outline"
                                >
                                    <MailCheckIcon />
                                    Restore access
                                </Button>
                            ) : (
                                <Button
                                    disabled={isCurrentUser}
                                    onClick={() => setOpenDialog("ban")}
                                    variant="destructive"
                                >
                                    <BanIcon />
                                    Ban user
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-destructive/30">
                        <CardHeader className="border-b">
                            <CardDescription>Danger zone</CardDescription>
                            <CardTitle>High-impact actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm/6">
                                Removing a user deletes the account record and
                                cannot be undone from this screen.
                            </div>
                            <Button
                                className="w-full justify-start"
                                disabled={isCurrentUser}
                                onClick={() => setOpenDialog("delete")}
                                variant="destructive"
                            >
                                <Trash2Icon />
                                Remove user
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <AlertDialog
                onOpenChange={(open) => !open && setOpenDialog(null)}
                open={openDialog === "ban"}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Ban this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This blocks {user.name || user.email} from signing
                            in until an admin restores access.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => toggleBanState(true)}>
                            <BanIcon />
                            Ban user
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                onOpenChange={(open) => !open && setOpenDialog(null)}
                open={openDialog === "delete"}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this user?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This permanently removes {user.name || user.email}.
                            Existing sessions will stop working and the account
                            will disappear from the directory.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={removeUser}>
                            <AlertTriangleIcon />
                            Remove user
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
