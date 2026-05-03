import { createFileRoute, Link } from "@tanstack/react-router";
import {
    ArrowRightIcon,
    ShieldCheckIcon,
    UserCheckIcon,
    UserCogIcon,
    UserPlusIcon,
    UsersIcon,
    UserXIcon,
} from "lucide-react";
import { Badge } from "#/components/ui/badge.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "#/components/ui/table.tsx";
import { getAdminDashboardData } from "#/features/admin/functions/index.ts";
import {
    formatAdminDateOnly,
    getAdminRoleLabel,
    normalizeAdminRole,
} from "#/features/admin/utils.ts";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/_app/admin/")({
    loader: async () => getAdminDashboardData(),
    component: AdminDashboard,
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

const StatCard = ({
    description,
    icon: Icon,
    title,
    value,
}: {
    description: string;
    icon: typeof UsersIcon;
    title: string;
    value: number;
}) => (
    <Card className="bg-linear-to-br from-card via-card to-muted/40">
        <CardHeader>
            <CardDescription>{title}</CardDescription>
            <CardAction>
                <div className="rounded-lg border border-border/60 bg-background/70 p-2">
                    <Icon className="size-4 text-muted-foreground" />
                </div>
            </CardAction>
            <CardTitle className="text-3xl">{value}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
            {description}
        </CardContent>
    </Card>
);

function AdminDashboard() {
    const { recentUsers, summary } = Route.useLoaderData();

    return (
        <div className="space-y-6 pb-8">
            <section className="overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-8 text-slate-50 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-4">
                        <Badge className="border border-white/15 bg-white/10 text-slate-100 hover:bg-white/10">
                            Admin control tower
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="font-heading text-3xl tracking-tight">
                                Keep user access clean, current, and auditable.
                            </h1>
                            <p className="max-w-xl text-slate-300 text-sm/6">
                                Review account growth, spot risky access
                                changes, and move directly into the user records
                                that need attention.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            className="border-white/15 bg-white/10 text-slate-50 hover:bg-white/15"
                            render={<Link to="/admin/users" />}
                            variant="outline"
                        >
                            Review users
                        </Button>
                        <Button
                            className="bg-slate-50 text-slate-950 hover:bg-slate-200"
                            render={<Link to="/admin/users/new" />}
                        >
                            <UserPlusIcon />
                            Create user
                        </Button>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    description="All user accounts currently stored in SokoTrack."
                    icon={UsersIcon}
                    title="Total users"
                    value={summary.totalUsers}
                />
                <StatCard
                    description="Users who can sign in right now without an access block."
                    icon={UserCheckIcon}
                    title="Active users"
                    value={summary.activeUsers}
                />
                <StatCard
                    description="Accounts blocked from access until an admin restores them."
                    icon={UserXIcon}
                    title="Banned users"
                    value={summary.bannedUsers}
                />
                <StatCard
                    description="Users with elevated operational permissions."
                    icon={ShieldCheckIcon}
                    title="Admins"
                    value={summary.adminUsers}
                />
                <StatCard
                    description="Managers and staff currently assigned to user records."
                    icon={UserCogIcon}
                    title="Managers / Staff"
                    value={summary.managerUsers + summary.staffUsers}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card>
                    <CardHeader className="border-b">
                        <CardDescription>
                            Recently added accounts
                        </CardDescription>
                        <CardTitle>Latest user records</CardTitle>
                        <CardAction>
                            <Button
                                render={<Link to="/admin/users" />}
                                variant="ghost"
                            >
                                View all
                                <ArrowRightIcon />
                            </Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Added</TableHead>
                                    <TableHead className="text-right">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUsers.map((user) => {
                                    const role = normalizeAdminRole(user.role);
                                    const accessState =
                                        user.banned === true
                                            ? "banned"
                                            : "active";

                                    return (
                                        <TableRow key={user.id}>
                                            <TableCell className="max-w-0">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {user.name}
                                                    </span>
                                                    <span className="truncate text-muted-foreground text-xs">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={cn(
                                                        "border",
                                                        rolePillClasses[role]
                                                    )}
                                                    variant="outline"
                                                >
                                                    {getAdminRoleLabel(
                                                        user.role
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={cn(
                                                            "border",
                                                            accessPillClasses[
                                                                accessState
                                                            ]
                                                        )}
                                                        variant="outline"
                                                    >
                                                        {accessState ===
                                                        "banned"
                                                            ? "Banned"
                                                            : "Active"}
                                                    </Badge>
                                                    {!user.emailVerified && (
                                                        <Badge variant="secondary">
                                                            Unverified
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatAdminDateOnly(
                                                    user.createdAt
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    render={
                                                        <Link
                                                            params={{
                                                                userId: user.id,
                                                            }}
                                                            to="/admin/users/$userId"
                                                        />
                                                    }
                                                    size="sm"
                                                    variant="ghost"
                                                >
                                                    Open
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-b from-card to-muted/40">
                    <CardHeader className="border-b">
                        <CardDescription>Quick actions</CardDescription>
                        <CardTitle>Administration shortcuts</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                            <div className="mb-1 font-medium">
                                User creation pipeline
                            </div>
                            <p className="text-muted-foreground text-sm/6">
                                Add new staff, managers, or admins with a
                                manually assigned initial password and route
                                them into their detail page immediately.
                            </p>
                            <Button
                                className="mt-4"
                                render={<Link to="/admin/users/new" />}
                            >
                                <UserPlusIcon />
                                Open create user form
                            </Button>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                            <div className="mb-1 font-medium">
                                Access review
                            </div>
                            <p className="text-muted-foreground text-sm/6">
                                The user directory already supports role
                                changes, bans, session revocation, and bulk
                                admin actions when multiple records need the
                                same intervention.
                            </p>
                            <Button
                                className="mt-4"
                                render={<Link to="/admin/users" />}
                                variant="outline"
                            >
                                Review directory
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
