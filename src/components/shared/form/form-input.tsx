import type { ComponentProps } from "react";
import { useFieldContext } from "#/hooks/form-context.ts";
import { Field, FieldError, FieldLabel } from "../../ui/field.tsx";
import { Input } from "../../ui/input.tsx";

type FormInputProps = ComponentProps<"input"> & {
    label: string;
    placeholder: string;
    type: "email" | "name";
};

const FormInput = ({ label, placeholder, type, ...props }: FormInputProps) => {
    const field = useFieldContext<string>();

    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

            <Input
                aria-invalid={isInvalid}
                autoComplete={`${type} webauthn`}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder}
                type={type === "name" ? "text" : type}
                value={field.state.value}
                {...props}
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    );
};

export default FormInput;
