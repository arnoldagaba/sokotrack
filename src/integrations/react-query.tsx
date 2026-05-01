import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export const getContext = (): { queryClient: QueryClient } => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    });

    return { queryClient };
};

export default function TanstackQueryProvider({
    children,
}: {
    children: ReactNode;
}) {
    const queryClient = getContext().queryClient;

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
