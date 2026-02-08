import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "@/routeTree.gen";
import { ErrorComponent, RouterProvider, createRouter } from "@tanstack/react-router";
import { ThemeProvider } from "@/hooks/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/styles/index.css";
import { NotFoundComponent } from "./components/not-found";

const queryClient = new QueryClient();

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    defaultErrorComponent: ErrorComponent,
    defaultNotFoundComponent: NotFoundComponent,
    isServer: false,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
    const root = createRoot(rootElement);
    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <RouterProvider router={router} />
                </ThemeProvider>
            </QueryClientProvider>
        </StrictMode>,
    );
}
