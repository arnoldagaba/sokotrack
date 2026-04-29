import { revalidateLogic } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card.tsx";
import { FieldDescription, FieldGroup } from "#/components/ui/field.tsx";
import { useAppForm } from "#/hooks/form.ts";
import { authClient } from "#/lib/auth-client.ts";
import { type LoginInput, loginSchema } from "../schema/index.ts";

const LoginForm = () => {
    const navigate = useNavigate();

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
                        navigate({ to: "/", replace: true });
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
