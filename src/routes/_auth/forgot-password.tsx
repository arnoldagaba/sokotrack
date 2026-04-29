import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forgot-password")({
    component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
    // TODO: Add forgot password form
    return <div>Hello "/_auth/forgot-password"!</div>;
}
