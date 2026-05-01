import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
    createRootRouteWithContext,
    HeadContent,
    Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

import { TooltipProvider } from "#/components/ui/tooltip.tsx";
import TanstackQueryProvider from "#/integrations/react-query.tsx";
import appCss from "../styles.css?url";

interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "SokoTrack",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>

            <body>
                <TanstackQueryProvider>
                    <ThemeProvider
                        attribute="class"
                        enableColorScheme
                        enableSystem
                    >
                        <TooltipProvider>{children}</TooltipProvider>
                        <Toaster position="top-right" />
                    </ThemeProvider>

                    <TanStackDevtools
                        config={{
                            position: "bottom-right",
                        }}
                        plugins={[
                            {
                                name: "Tanstack Router",
                                render: <TanStackRouterDevtoolsPanel />,
                            },
                            {
                                name: "Tanstack Query",
                                render: <ReactQueryDevtoolsPanel />,
                            },
                        ]}
                    />
                </TanstackQueryProvider>

                <Scripts />
            </body>
        </html>
    );
}
