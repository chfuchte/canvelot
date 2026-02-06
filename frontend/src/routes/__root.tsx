import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { NotFound } from "./-not-found";
import { Toaster } from "@/components/ui/sonner";
import { Error } from "./-error";

export const Route = createRootRouteWithContext()({
    component: RootComponent,
    notFoundComponent: NotFound,
    errorComponent: Error,
});

function RootComponent() {
    return (
        <>
            <Outlet />
            <Toaster richColors />
        </>
    );
}
