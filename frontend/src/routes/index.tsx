import { CanvasList, CanvasListEmpty, CanvasListGrid } from "@/components/canvas-list";
import { CreateCanvasDialog } from "@/components/dialogs/create-canvas-dialog";
import { ErrorComponent } from "@/components/error";
import { Header } from "@/components/header";
import { ItemLoading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { fetchCanvasListQueryOptions } from "@/queries/canvas";
import { Footer } from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

function RouteComponent() {
    const { data, error, isLoading, isError } = useQuery(fetchCanvasListQueryOptions);

    if (isError) {
        console.error("Error fetching canvas list:", error);
        return <ErrorComponent />;
    }

    return (
        <>
            <Header>
                <CreateCanvasDialog>
                    <Button>
                        <Plus /> New Canvas
                    </Button>
                </CreateCanvasDialog>
            </Header>
            <main className="min-h-[calc(100dvh-var(--spacing)*16)]">
                {isLoading ? (
                    <CanvasListGrid>
                        {Array(3)
                            .fill(null)
                            .map((_, i) => (
                                <ItemLoading key={i} />
                            ))}
                    </CanvasListGrid>
                ) : data && data.length > 0 ? (
                    <CanvasList list={data} />
                ) : (
                    <CanvasListEmpty />
                )}
            </main>
            <Footer />
        </>
    );
}
