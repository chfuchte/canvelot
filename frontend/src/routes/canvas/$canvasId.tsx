import { createFileRoute, notFound } from "@tanstack/react-router";
import { ExcalidrawComponent } from "@/components/excalidraw-component";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchCanvasByIdQueryOptions } from "@/queries/canvas";

export const Route = createFileRoute("/canvas/$canvasId")({
    component: RouteComponent,
    // @ts-expect-error context type is not inferred correctly
    loader: ({ context: { queryClient }, params }) =>
        queryClient.ensureQueryData(fetchCanvasByIdQueryOptions(params.canvasId)),
});

function RouteComponent() {
    const { canvasId } = Route.useParams();
    const {
        data: [canvas, error],
    } = useSuspenseQuery(fetchCanvasByIdQueryOptions(canvasId));

    if (error) {
        throw error;
    }

    if (!canvas) {
        throw notFound();
    }

    return (
        <div className="h-dvh">
            <ExcalidrawComponent canvas={canvas} />
        </div>
    );
}
