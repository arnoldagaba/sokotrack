import { Checkbox } from "#/components/ui/checkbox.tsx";
import { Field, FieldLabel } from "#/components/ui/field.tsx";
import { useFieldContext } from "#/hooks/form-context.ts";

interface FormCheckboxProps {
    label: string;
}

const FormCheckbox = ({ label }: FormCheckboxProps) => {
    const field = useFieldContext<boolean>();

    return (
        <Field orientation="horizontal">
            <Checkbox
                checked={field.state.value}
                id={field.name}
                name={field.name}
                onCheckedChange={(e) => field.handleChange(e)}
            />

            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        </Field>
    );
};

export default FormCheckbox;
