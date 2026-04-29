import { revalidateLogic } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import GoogleLogo from "#/components/shared/google-logo.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card.tsx";
import { Field, FieldDescription, FieldGroup } from "#/components/ui/field.tsx";
import { useAppForm } from "#/hooks/form.ts";
import { authClient } from "#/lib/auth-client.ts";
import { type RegisterInput, registerSchema } from "../schema/index.ts";

const RegisterForm = () => {
    const navigate = useNavigate();

    const defaultValues: RegisterInput = {
        name: "",
        email: "",
        password: "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            await authClient.signUp.email({
                ...value,
                fetchOptions: {
                    onSuccess: ({ data }) => {
                        toast.success(
                            `Welcome ${data.user.name || data.user.email}!`
                        );
                        navigate({ to: "/", replace: true });
                    },
                    onError: ({ error }) => {
                        toast.error(
                            error.message ||
                                "Failed to sign-up. Please try again."
                        );
                    },
                },
            });
        },
        validators: {
            onSubmit: registerSchema,
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    const handleGoogleSignup = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: new URL(
                "/dashboard",
                window.location.origin
            ).toString(),
            fetchOptions: {
                onError: ({ error }) => {
                    toast.error(
                        error.message || "Failed to sign-up. Please try again."
                    );
                },
            },
        });
    };

    return (
        <Card className="w-full max-w-sm md:max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-heading font-semibold text-2xl">
                    Create your account
                </CardTitle>

                <CardDescription>
                    Fill in the form below to create your account
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
                        <form.AppField name="name">
                            {(field) => (
                                <field.FormInput
                                    label="Full name"
                                    placeholder="Enter your full name"
                                    type="text"
                                />
                            )}
                        </form.AppField>

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
                            {(field) => <field.FormPassword isLogin={false} />}
                        </form.AppField>

                        <form.AppForm>
                            <form.SubscribeButton
                                label="Sign up"
                                submittingLabel="Signing up"
                            />
                        </form.AppForm>

                        <Field>
                            <Button
                                className="relative"
                                onClick={handleGoogleSignup}
                                type="button"
                                variant="outline"
                            >
                                <GoogleLogo /> Continue with Google
                            </Button>

                            <FieldDescription className="text-center">
                                Already have an account?{" "}
                                <Link to="/login">Login</Link>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
};

export default RegisterForm;
