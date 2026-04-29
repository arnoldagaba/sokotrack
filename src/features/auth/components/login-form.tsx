import { revalidateLogic } from "@tanstack/react-form";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import toast from "react-hot-toast";
import GoogleLogo from "#/components/shared/google-logo.tsx";
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
    FieldSeparator,
} from "#/components/ui/field.tsx";
import { useAppForm } from "#/hooks/form.ts";
import { authClient } from "#/lib/auth-client.ts";
import { type LoginInput, loginSchema } from "../schema/index.ts";

const LoginForm = () => {
    const navigate = useNavigate();
    const search = useSearch({ from: "/_auth/login" });

    const defaultValues: LoginInput = {
        email: "",
        password: "",
        rememberMe: false,
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            await authClient.signIn.email({
                ...value,
                fetchOptions: {
                    onSuccess: ({ data }) => {
                        toast.success(
                            `Welcome back, ${data.user.name || data.user.email}!`
                        );
                        navigate({ to: search.redirect ?? "/", replace: true });
                    },
                    onError: ({ error }) => {
                        toast.error(
                            error.message ||
                                "Failed to login. Please try again."
                        );
                    },
                },
            });
        },
        validators: {
            onSubmit: loginSchema,
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    const handleGoogleSignIn = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: new URL(
                search.redirect ?? "/dashboard",
                window.location.origin
            ).toString(),
            fetchOptions: {
                onError: ({ error }) => {
                    toast.error(
                        error.message || "Failed to login. Please try again."
                    );
                },
            },
        });
    };

    const lastMethod = authClient.getLastUsedLoginMethod();

    return (
        <Card className="w-full max-w-sm md:max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-heading font-semibold text-2xl">
                    Welcome back
                </CardTitle>

                <CardDescription>
                    Sign in to your account to continue
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <Field>
                            <Button
                                className="relative"
                                onClick={handleGoogleSignIn}
                                type="button"
                                variant="outline"
                            >
                                <GoogleLogo /> Continue with Google
                                {lastMethod === "google" && (
                                    <Badge className="absolute -top-2 right-0">
                                        Last used
                                    </Badge>
                                )}
                            </Button>
                        </Field>

                        <FieldSeparator>or continue with email</FieldSeparator>

                        <form.AppField name="email">
                            {(field) => (
                                <field.FormInput
                                    label="Email address"
                                    placeholder="Enter your email address"
                                    type="email"
                                />
                            )}
                        </form.AppField>

                        <form.AppField name="password">
                            {(field) => <field.FormPassword isLogin />}
                        </form.AppField>

                        <form.AppField name="rememberMe">
                            {(field) => (
                                <field.FormCheckbox label="Remember me" />
                            )}
                        </form.AppField>

                        <form.AppForm>
                            <form.SubscribeButton
                                label="Login"
                                submittingLabel="Logging in"
                            />
                        </form.AppForm>

                        <FieldDescription className="text-center">
                            Don&apos;t have an account?{" "}
                            <Link to="/register">Sign up</Link>
                        </FieldDescription>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
};

export default LoginForm;
