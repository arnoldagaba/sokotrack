import { Button } from "#/components/ui/button.tsx";
import { Spinner } from "#/components/ui/spinner.tsx";
import { useFormContext } from "#/hooks/form-context.ts";

interface SubscribeButtonProps {
    label: string;
    submittingLabel?: string;
}

const SubscribeButton = ({
    label,
    submittingLabel = "Submitting",
}: SubscribeButtonProps) => {
    const form = useFormContext();

    return (
        <form.Subscribe selector={(state) => state}>
            {(state) => (
                <Button
                    disabled={state.isSubmitting || !state.canSubmit}
                    type="submit"
                >
                    {state.isSubmitting ? (
                        <>
                            <Spinner /> {submittingLabel}...
                        </>
                    ) : (
                        label
                    )}
                </Button>
            )}
        </form.Subscribe>
    );
};

export default SubscribeButton;
