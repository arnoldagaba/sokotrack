import { EyeIcon, EyeOffIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "../ui/input-group.tsx";

type PasswordInputProps = ComponentProps<"input"> & {
    hideLabel?: string;
    showLabel?: string;
};

const PasswordInput = ({
    hideLabel = "Hide password",
    showLabel = "Show password",
    type: _type,
    ...props
}: PasswordInputProps) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <InputGroup>
            <InputGroupInput
                {...props}
                type={isVisible ? "text" : "password"}
            />

            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    aria-label={isVisible ? hideLabel : showLabel}
                    aria-pressed={isVisible}
                    onClick={() => setIsVisible((v) => !v)}
                    size="icon-xs"
                    title={isVisible ? hideLabel : showLabel}
                    type="button"
                    variant="ghost"
                >
                    {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
};

export default PasswordInput;
