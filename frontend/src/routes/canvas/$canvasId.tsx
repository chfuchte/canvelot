import { createFileRoute } from "@tanstack/react-router";
import { ExcalidrawComponent } from "@/components/excalidraw-component";

export const Route = createFileRoute("/canvas/$canvasId")({
    component: RouteComponent,
});

function RouteComponent() {
    // const { canvasId } = Route.useParams();

    return (
        <div className="h-dvh">
            <ExcalidrawComponent />
        </div>
    );
}
