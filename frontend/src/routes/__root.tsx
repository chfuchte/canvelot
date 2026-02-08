import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext()({
    component: RootComponent,
});

function RootComponent() {
    return (
        <>
            <Outlet />
            <Toaster richColors />
        </>
    );
}
