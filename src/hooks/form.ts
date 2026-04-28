import { createFormHook } from "@tanstack/react-form";
import FormCheckbox from "#/components/shared/form/form-checkbox.tsx";
import FormInput from "#/components/shared/form/form-input.tsx";
import FormPassword from "#/components/shared/form/form-password.tsx";
import SubscribeButton from "#/components/shared/form/subscribe-button.tsx";
import { fieldContext, formContext } from "./form-context.ts";

const { useAppForm } = createFormHook({
    fieldComponents: {
        FormCheckbox,
        FormInput,
        FormPassword,
    },
    formComponents: { SubscribeButton },
    fieldContext,
    formContext,
});

export { useAppForm };
