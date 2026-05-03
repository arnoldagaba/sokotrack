import { revalidateLogic } from "@tanstack/react-form";
import {
    createFileRoute,
    useRouteContext,
    useRouter,
} from "@tanstack/react-router";
import {
    BadgeCheckIcon,
    MailIcon,
    ShieldCheckIcon,
    SparklesIcon,
    TriangleAlertIcon,
    UserRoundIcon,
} from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
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
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "#/components/ui/field.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import {
    formatAdminDate,
    formatAdminDateOnly,
    getAdminRoleLabel,
    getUserInitials,
} from "#/features/admin/utils.ts";
import { updateCurrentUserProfile } from "#/features/auth/functions/index.ts";
import {
    type UpdateProfileInput,
    updateProfileSchema,
} from "#/features/auth/schema/index.ts";
import { useAppForm } from "#/hooks/form.ts";
import { cn } from "#/lib/utils.ts";

export const Route = createFileRoute("/_app/profile")({
    component: RouteComponent,
});

const rolePillClasses = {
    admin: "border-destructive/20 bg-destructive/10 text-destructive",
    manager:
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    staff: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
} as const;

const ReadOnlyField = ({
    description,
    label,
    value,
}: {
    description?: string;
    label: string;
    value: string;
}) => (
    <Field>
        <FieldLabel>{label}</FieldLabel>
        <Input readOnly value={value} />
        {description ? (
            <FieldDescription>{description}</FieldDescription>
        ) : null}
    </Field>
);

function RouteComponent() {
    const { session, user } = useRouteContext({ from: "/_app" });
    const router = useRouter();
    const isImpersonating = session.session.impersonatedBy != null;

    const form = useAppForm({
        defaultValues: {
            name: user.name ?? "",
        } satisfies UpdateProfileInput,
        onSubmit: async ({ value }) => {
            try {
                await updateCurrentUserProfile({
                    data: value,
                });
                await router.invalidate({ sync: true });
                toast.success("Profile updated successfully");
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to update your profile";

                toast.error(message);
            }
        },
        validators: {
            onSubmit: updateProfileSchema,
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    useEffect(() => {
        form.reset({ name: user.name ?? "" });
    }, [form, user.name]);

    const isValidRoleKey = (
        role: string
    ): role is keyof typeof rolePillClasses => role in rolePillClasses;

    const roleTone = isValidRoleKey(user.role)
        ? rolePillClasses[user.role]
        : rolePillClasses.staff;

    return (
        <div className="space-y-6 pb-8">
            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card className="overflow-hidden border-border/70 bg-linear-to-br from-card via-card to-muted/35">
                    <CardContent className="p-0">
                        <div className="relative overflow-hidden px-6 pt-6 pb-8">
                            <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-r from-emerald-500/16 via-sky-500/12 to-amber-500/16" />
                            <div className="absolute top-5 right-6 size-32 rounded-full bg-emerald-500/10 blur-3xl" />

                            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div className="flex items-start gap-4">
                                    <Avatar className="size-20 rounded-3xl border border-border/70 shadow-lg">
                                        <AvatarImage
                                            alt={user.name ?? user.email}
                                            src={user.image ?? undefined}
                                        />
                                        <AvatarFallback className="rounded-3xl text-xl">
                                            {getUserInitials(
                                                user.name,
                                                user.email
                                            )}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="space-y-3 pt-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge
                                                className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
                                                variant="outline"
                                            >
                                                <SparklesIcon />
                                                Personal account
                                            </Badge>
                                            <Badge
                                                className={cn(
                                                    "rounded-full border px-3 py-1",
                                                    roleTone
                                                )}
                                                variant="outline"
                                            >
                                                <ShieldCheckIcon />
                                                {getAdminRoleLabel(user.role)}
                                            </Badge>
                                        </div>

                                        <div>
                                            <h1 className="font-heading text-3xl tracking-tight">
                                                Profile
                                            </h1>
                                            <p className="max-w-2xl text-muted-foreground text-sm/6">
                                                Keep your public-facing identity
                                                up to date without leaving the
                                                workspace.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2 text-sm sm:grid-cols-2">
                                    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
                                        <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                                            Verified email
                                        </div>
                                        <div className="mt-1 font-medium">
                                            {user.emailVerified
                                                ? "Trusted sign-in"
                                                : "Verification pending"}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
                                        <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                                            Last account update
                                        </div>
                                        <div className="mt-1 font-medium">
                                            {formatAdminDate(user.updatedAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/70 bg-linear-to-b from-card to-muted/30">
                    <CardHeader className="border-b">
                        <CardDescription>Account posture</CardDescription>
                        <CardTitle>Identity snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 text-sm/6">
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                            <div className="mb-2 flex items-center gap-2 font-medium">
                                <BadgeCheckIcon className="size-4 text-muted-foreground" />
                                Membership
                            </div>
                            <p className="text-muted-foreground">
                                This account joined on{" "}
                                {formatAdminDateOnly(user.createdAt)} and most
                                recently refreshed its profile on{" "}
                                {formatAdminDate(user.updatedAt)}.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                            <div className="mb-2 flex items-center gap-2 font-medium">
                                <MailIcon className="size-4 text-muted-foreground" />
                                Email delivery
                            </div>
                            <p className="text-muted-foreground">
                                {user.emailVerified
                                    ? "Your current email is already verified and used for secure sign-in."
                                    : "This email has not been verified yet, so some future recovery flows may stay limited."}
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
                                Profile editing is disabled during impersonation
                            </div>
                            <p className="text-muted-foreground text-sm/6">
                                Stop impersonation from the user menu before
                                changing this account's personal details.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card>
                    <CardHeader className="border-b">
                        <CardDescription>Editable details</CardDescription>
                        <CardTitle>Public profile</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.handleSubmit();
                            }}
                        >
                            <FieldGroup>
                                <form.AppField name="name">
                                    {(field) => (
                                        <field.FormInput
                                            disabled={isImpersonating}
                                            label="Display name"
                                            placeholder="Enter your full name"
                                            type="text"
                                        />
                                    )}
                                </form.AppField>

                                <ReadOnlyField
                                    description="Email changes are not part of this screen yet."
                                    label="Work email"
                                    value={user.email}
                                />

                                <form.Subscribe
                                    selector={(state) => ({
                                        canSubmit: state.canSubmit,
                                        isSubmitting: state.isSubmitting,
                                        name: state.values.name,
                                    })}
                                >
                                    {({ canSubmit, isSubmitting, name }) => (
                                        <Button
                                            disabled={
                                                isImpersonating ||
                                                isSubmitting ||
                                                !canSubmit ||
                                                name.trim() ===
                                                    (user.name ?? "").trim()
                                            }
                                            type="submit"
                                        >
                                            {isSubmitting ? (
                                                <Spinner />
                                            ) : (
                                                <UserRoundIcon />
                                            )}
                                            {isSubmitting
                                                ? "Saving profile..."
                                                : "Save profile"}
                                        </Button>
                                    )}
                                </form.Subscribe>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-b from-card to-muted/30">
                    <CardHeader className="border-b">
                        <CardDescription>Read-only fields</CardDescription>
                        <CardTitle>Account markers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <ReadOnlyField
                            label="Permission role"
                            value={getAdminRoleLabel(user.role)}
                        />
                        <ReadOnlyField
                            label="Verification state"
                            value={
                                user.emailVerified
                                    ? "Email verified"
                                    : "Verification pending"
                            }
                        />
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
