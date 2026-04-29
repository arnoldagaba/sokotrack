import { Link } from "@tanstack/react-router";
import { useFieldContext } from "#/hooks/form-context.ts";
import { Field, FieldError, FieldLabel } from "../../ui/field.tsx";
import PasswordInput from "../password-input.tsx";

interface FormPasswordProps {
    isLogin: boolean;
    label?: string;
    placeholder?: string;
}

const FormPassword = ({
    label = "Password",
    placeholder = "Enter your password",
    isLogin = false,
}: FormPasswordProps) => {
    const field = useFieldContext<string>();

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
        <Field data-invalid={isInvalid}>
            <div className="flex items-center justify-between">
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                {isLogin && (
                    <Link
                        className="hover:text-muted-foreground hover:underline"
                        to="/forgot-password"
                    >
                        Forgot password?
                    </Link>
                )}
            </div>

            <PasswordInput
                aria-invalid={isInvalid}
                autoComplete={
                    isLogin ? "current-password webauthn" : "new-password"
                }
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder}
                value={field.state.value}
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    );
};

export default FormPassword;
