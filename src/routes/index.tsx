import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "#/features/auth/functions/index.ts";

export const Route = createFileRoute("/")({
    beforeLoad: async () => {
        const { session } = await getSession();
        if (session) {
            throw redirect({ to: "/dashboard" });
        }
    },
    component: Home,
});

function Home() {
    return (
        <div className="p-8">
            <h1 className="font-bold text-4xl">Welcome to TanStack Start</h1>
            <p className="mt-4 text-lg">
                Edit <code>src/routes/index.tsx</code> to get started.
            </p>
        </div>
    );
}
