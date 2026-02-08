import { createFileRoute } from "@tanstack/react-router";
import { ExcalidrawComponent } from "@/components/excalidraw-component";
import { useQuery } from "@tanstack/react-query";
import { getCanvasQueryOptions } from "@/queries/canvas";
import { FullPageLoading } from "@/components/loading";
import { ErrorComponent } from "@/components/error";
import { NotFoundComponent } from "@/components/not-found";

export const Route = createFileRoute("/canvas/$canvasId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { canvasId } = Route.useParams();
    const { data: canvas, error, isError, isLoading } = useQuery(getCanvasQueryOptions(canvasId));

    if (isLoading) {
        return <FullPageLoading />;
    }

    if (isError) {
        console.error(error);
        return <ErrorComponent />;
    }

    if (!canvas) {
        return <NotFoundComponent />;
    }

    return (
        <div className="h-dvh">
            <ExcalidrawComponent canvas={canvas} />
        </div>
    );
}
