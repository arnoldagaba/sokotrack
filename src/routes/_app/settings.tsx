import { revalidateLogic } from "@tanstack/react-form";
import { createFileRoute, useRouteContext, useRouter } from "@tanstack/react-router";
import {
    KeyRoundIcon,
    LaptopMinimalCheckIcon,
    MailCheckIcon,
    ShieldEllipsisIcon,
    TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "#/components/ui/badge.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card.tsx";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "#/components/ui/field.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import {
    changeCurrentUserPassword,
    listCurrentUserSessions,
    revokeOtherCurrentUserSessions,
} from "#/features/auth/functions/index.ts";
import {
    changePasswordSchema,
    type ChangePasswordInput,
} from "#/features/auth/schema/index.ts";
import {
    formatAdminDate,
    getAdminRoleLabel,
} from "#/features/admin/utils.ts";
import { useAppForm } from "#/hooks/form.ts";
import { authClient } from "#/lib/auth-client.ts";

export const Route = createFileRoute("/_app/settings")({
    loader: async () => listCurrentUserSessions(),
    component: RouteComponent,
});

const formatLoginMethodLabel = (method: string | null | undefined) => {
    if (!method) {
        return "Not recorded on this device";
    }

    if (method === "email") {
        return "Email and password";
    }

    if (method === "google") {
        return "Google sign-in";
    }

    return method
        .split(/[-_]/)
        .filter(Boolean)
        .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
        .join(" ");
};

const formatSessionAgent = (userAgent: string | null) => {
    if (!userAgent) {
        return "Unknown device";
    }

    return userAgent.length > 88 ? `${userAgent.slice(0, 85)}...` : userAgent;
};

const SessionList = ({
    sessions,
}: {
    sessions: Array<{
        createdAt: Date;
        expiresAt: Date;
        id: string;
        ipAddress: string | null;
        isCurrent: boolean;
        updatedAt: Date;
        userAgent: string | null;
    }>;
}) => {
    return (
        <div className="space-y-3">
            {sessions.map((accountSession) => (
                <div
                    className="rounded-2xl border border-border/60 bg-background/70 p-4"
                    key={accountSession.id}
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="font-medium">
                                    {formatSessionAgent(accountSession.userAgent)}
                                </div>
                                {accountSession.isCurrent ? (
                                    <Badge variant="secondary">
                                        Current session
                                    </Badge>
                                ) : null}
                            </div>
                            <div className="text-muted-foreground text-sm">
                                {accountSession.ipAddress || "IP not captured"}
                            </div>
                        </div>

                        <div className="text-muted-foreground text-sm/6 lg:text-right">
                            <div>Started {formatAdminDate(accountSession.createdAt)}</div>
                            <div>Last updated {formatAdminDate(accountSession.updatedAt)}</div>
                            <div>Expires {formatAdminDate(accountSession.expiresAt)}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

function RouteComponent() {
    const { sessions } = Route.useLoaderData();
    const { session, user } = useRouteContext({ from: "/_app" });
    const router = useRouter();
    const [isRevokingOtherSessions, setIsRevokingOtherSessions] = useState(false);
    const isImpersonating = session.session.impersonatedBy != null;
    const otherSessionCount = sessions.filter((value) => !value.isCurrent).length;
    const lastMethod = authClient.getLastUsedLoginMethod();

    const defaultValues: ChangePasswordInput = {
        confirmPassword: "",
        currentPassword: "",
        newPassword: "",
        revokeOtherSessions: true,
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                await changeCurrentUserPassword({
                    data: value,
                });
                await router.invalidate({ sync: true });
                form.reset(defaultValues);
                toast.success("Password updated successfully");
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to update your password";

                toast.error(message);
            }
        },
        validators: {
            onSubmit: changePasswordSchema,
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    const handleRevokeOtherSessions = async () => {
        if (isImpersonating || isRevokingOtherSessions || otherSessionCount === 0) {
            return;
        }

        setIsRevokingOtherSessions(true);
        try {
            await revokeOtherCurrentUserSessions();
            await router.invalidate({ sync: true });
            toast.success("Other sessions have been signed out");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to revoke your other sessions";
            toast.error(message);
        } finally {
            setIsRevokingOtherSessions(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card className="overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/35">
                    <CardContent className="relative overflow-hidden px-6 pt-6 pb-8">
                        <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-r from-sky-500/16 via-emerald-500/12 to-amber-500/12" />
                        <div className="absolute right-0 bottom-0 size-40 rounded-full bg-sky-500/10 blur-3xl" />

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        className="rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-sky-700 dark:text-sky-300"
                                        variant="outline"
                                    >
                                        <ShieldEllipsisIcon />
                                        Security settings
                                    </Badge>
                                    <Badge variant="outline">
                                        {sessions.length} active session
                                        {sessions.length === 1 ? "" : "s"}
                                    </Badge>
                                </div>

                                <div>
                                    <h1 className="font-heading text-3xl tracking-tight">
                                        Settings
                                    </h1>
                                    <p className="max-w-2xl text-muted-foreground text-sm/6">
                                        Manage password posture, session hygiene,
                                        and the security signals attached to your
                                        account.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                                <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
                                    <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                                        Last sign-in method
                                    </div>
                                    <div className="mt-1 font-medium">
                                        {formatLoginMethodLabel(lastMethod)}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
                                    <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                                        Other devices
                                    </div>
                                    <div className="mt-1 font-medium">
                                        {otherSessionCount === 0
                                            ? "No other sessions"
                                            : `${otherSessionCount} additional session${otherSessionCount === 1 ? "" : "s"}`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-linear-to-b from-card to-muted/30">
                    <CardHeader className="border-b">
                        <CardDescription>Security snapshot</CardDescription>
                        <CardTitle>Account posture</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 text-sm/6">
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                            <div className="mb-2 flex items-center gap-2 font-medium">
                                <MailCheckIcon className="size-4 text-muted-foreground" />
                                Verification
                            </div>
                            <p className="text-muted-foreground">
                                {user.emailVerified
                                    ? "Your primary email is already verified for secure access."
                                    : "Email verification is still pending for this account."}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                            <div className="mb-2 flex items-center gap-2 font-medium">
                                <KeyRoundIcon className="size-4 text-muted-foreground" />
                                Access envelope
                            </div>
                            <p className="text-muted-foreground">
                                You are currently operating with the{" "}
                                {getAdminRoleLabel(user.role).toLowerCase()} role.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {isImpersonating ? (
                <Card className="border-amber-500/30 bg-amber-500/6">
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start">
                        <TriangleAlertIcon className="mt-0.5 size-5 text-amber-600 dark:text-amber-300" />
                        <div>
                            <div className="font-medium">
                                Security actions are disabled during impersonation
                            </div>
                            <p className="text-muted-foreground text-sm/6">
                                Stop impersonation from the user menu before
                                changing passwords or managing this user's other
                                sessions.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card>
                    <CardHeader className="border-b">
                        <CardDescription>Password hygiene</CardDescription>
                        <CardTitle>Change password</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.handleSubmit();
                            }}
                        >
                            <FieldGroup>
                                <form.AppField name="currentPassword">
                                    {(field) => (
                                        <field.FormPassword
                                            autoComplete="current-password"
                                            isLogin={false}
                                            label="Current password"
                                            placeholder="Enter your current password"
                                        />
                                    )}
                                </form.AppField>

                                <form.AppField name="newPassword">
                                    {(field) => (
                                        <field.FormPassword
                                            autoComplete="new-password"
                                            isLogin={false}
                                            label="New password"
                                            placeholder="Create a stronger password"
                                        />
                                    )}
                                </form.AppField>

                                <form.AppField name="confirmPassword">
                                    {(field) => (
                                        <field.FormPassword
                                            autoComplete="new-password"
                                            isLogin={false}
                                            label="Confirm new password"
                                            placeholder="Repeat the new password"
                                        />
                                    )}
                                </form.AppField>

                                <form.AppField name="revokeOtherSessions">
                                    {(field) => (
                                        <field.FormCheckbox label="Sign out of other devices after the password change" />
                                    )}
                                </form.AppField>

                                <form.Subscribe
                                    selector={(state) => ({
                                        canSubmit: state.canSubmit,
                                        isSubmitting: state.isSubmitting,
                                    })}
                                >
                                    {({ canSubmit, isSubmitting }) => (
                                        <Button
                                            disabled={
                                                isImpersonating ||
                                                isSubmitting ||
                                                !canSubmit
                                            }
                                            type="submit"
                                        >
                                            {isSubmitting ? <Spinner /> : <KeyRoundIcon />}
                                            {isSubmitting
                                                ? "Updating password..."
                                                : "Change password"}
                                        </Button>
                                    )}
                                </form.Subscribe>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-b from-card to-muted/30">
                    <CardHeader className="border-b">
                        <CardDescription>Recovery notes</CardDescription>
                        <CardTitle>What this affects</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 text-sm/6">
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                            <div className="mb-2 font-medium">
                                Strong password policy
                            </div>
                            <p className="text-muted-foreground">
                                New passwords must include uppercase, lowercase,
                                number, and special characters to align with the
                                current auth policy.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                            <div className="mb-2 font-medium">
                                Session cleanup
                            </div>
                            <p className="text-muted-foreground">
                                You can revoke other sessions during password
                                rotation or separately below when you suspect a
                                stale device is still signed in.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card>
                    <CardHeader className="border-b">
                        <CardDescription>Active device inventory</CardDescription>
                        <CardTitle>Session activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <SessionList sessions={sessions} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b">
                        <CardDescription>One-click action</CardDescription>
                        <CardTitle>Revoke other sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="rounded-2xl border border-border/60 bg-muted/35 p-4 text-sm/6">
                            {otherSessionCount === 0
                                ? "Only your current session remains active."
                                : `This will sign out ${otherSessionCount} other active session${otherSessionCount === 1 ? "" : "s"} while keeping this device signed in.`}
                        </div>

                        <Button
                            disabled={
                                isImpersonating ||
                                isRevokingOtherSessions ||
                                otherSessionCount === 0
                            }
                            onClick={handleRevokeOtherSessions}
                            variant="outline"
                        >
                            {isRevokingOtherSessions ? (
                                <Spinner />
                            ) : (
                                <LaptopMinimalCheckIcon />
                            )}
                            {isRevokingOtherSessions
                                ? "Revoking other sessions..."
                                : "Sign out other devices"}
                        </Button>

                        <Field>
                            <FieldLabel>Current session count</FieldLabel>
                            <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm">
                                {sessions.length} session
                                {sessions.length === 1 ? "" : "s"} attached to
                                this account
                            </div>
                            <FieldDescription>
                                The current session stays active unless you
                                explicitly log out from this device.
                            </FieldDescription>
                        </Field>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
