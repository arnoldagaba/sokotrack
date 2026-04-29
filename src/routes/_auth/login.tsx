import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import LoginForm from "#/features/auth/components/login-form";

export const Route = createFileRoute("/_auth/login")({
    component: LoginPage,
    validateSearch: z.object({
        redirect: z
            .string()
            .refine(
                (v) => v.startsWith("/") && !v.startsWith("//"),
                "redirect must be an internal path"
            )
            .optional(),
    }),
});

function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <LoginForm />
        </div>
    );
}
