import { revalidateLogic } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon, ShieldPlusIcon } from "lucide-react";
import toast from "react-hot-toast";
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
    FieldError,
    FieldGroup,
    FieldLabel,
} from "#/components/ui/field.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select.tsx";
import { createAdminUser } from "#/features/admin/functions/index.ts";
import {
    type CreateAdminUserInput,
    createAdminUserInputSchema,
} from "#/features/admin/schema/index.ts";
import { useAppForm } from "#/hooks/form.ts";

export const Route = createFileRoute("/_app/admin/users/new")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = Route.useNavigate();

    const defaultValues: CreateAdminUserInput = {
        email: "",
        name: "",
        password: "",
        role: "staff",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const { user } = await createAdminUser({ data: value });

                toast.success(`${user.name || user.email} was created`);
                navigate({
                    params: { userId: user.id },
                    to: "/admin/users/$userId",
                });
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to create the user";

                toast.error(message);
            }
        },
        validators: {
            onSubmit: createAdminUserInputSchema,
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <div className="space-y-6 pb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <Button
                        className="-ml-2"
                        render={<Link to="/admin/users" />}
                        variant="ghost"
                    >
                        <ArrowLeftIcon />
                        Back to users
                    </Button>
                    <h1 className="font-heading text-3xl tracking-tight">
                        Create User
                    </h1>
                    <p className="max-w-2xl text-muted-foreground text-sm/6">
                        Provision a new user account with an initial role and
                        password. The account will appear in the admin directory
                        immediately after creation.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
                <Card>
                    <CardHeader className="border-b">
                        <CardDescription>Account details</CardDescription>
                        <CardTitle>New user profile</CardTitle>
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
                                            label="Full name"
                                            placeholder="Enter the user's name"
                                            type="text"
                                        />
                                    )}
                                </form.AppField>

                                <form.AppField name="email">
                                    {(field) => (
                                        <field.FormInput
                                            label="Email address"
                                            placeholder="Enter the work email"
                                            type="email"
                                        />
                                    )}
                                </form.AppField>

                                <form.AppField name="role">
                                    {(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid;

                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Role
                                                </FieldLabel>

                                                <Select
                                                    onValueChange={(value) =>
                                                        field.handleChange(
                                                            value as CreateAdminUserInput["role"]
                                                        )
                                                    }
                                                    value={field.state.value}
                                                >
                                                    <SelectTrigger
                                                        aria-invalid={isInvalid}
                                                        className="w-full"
                                                        id={field.name}
                                                    >
                                                        <SelectValue placeholder="Select a role" />
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

                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        );
                                    }}
                                </form.AppField>

                                <form.AppField name="password">
                                    {(field) => (
                                        <field.FormPassword
                                            isLogin={false}
                                            label="Initial password"
                                            placeholder="Create an initial password"
                                        />
                                    )}
                                </form.AppField>

                                <form.AppForm>
                                    <form.SubscribeButton
                                        label="Create user"
                                        submittingLabel="Creating user"
                                    />
                                </form.AppForm>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>

                <Card className="bg-linear-to-b from-card to-muted/40">
                    <CardHeader className="border-b">
                        <CardDescription>Provisioning notes</CardDescription>
                        <CardTitle>What happens next</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 text-sm/6">
                        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                            <div className="mb-2 flex items-center gap-2 font-medium">
                                <ShieldPlusIcon className="size-4 text-muted-foreground" />
                                Immediate access setup
                            </div>
                            <p className="text-muted-foreground">
                                The selected role is applied at creation time,
                                so the new account enters the system with the
                                correct permission envelope from the start.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                            <div className="mb-2 font-medium">
                                Manual password handoff
                            </div>
                            <p className="text-muted-foreground">
                                This flow does not send invites or password
                                reset emails. The admin is responsible for
                                sharing the initial password through a secure
                                internal channel.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
