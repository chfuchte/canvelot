import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCanvasesQueryOptions, fetchIsAdmin } from "@/queries/management";
import { useManagementStore } from "@/stores/management";
import { ErrorComponent } from "@/components/error";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/loading";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DeleteCanvasManagementDialog } from "@/components/dialogs/delete-canvas-management-dialog";
import { Button } from "@/components/ui/button";
import { lastModifiedAtToRelativeTime } from "@/lib/utils";
import { Trash } from "lucide-react";

export const Route = createFileRoute("/manage/canvas")({
    component: RouteComponent,
    beforeLoad: async () => {
        try {
            const isAdmin = await fetchIsAdmin();

            if (!isAdmin) {
                return redirect({
                    to: "/",
                });
            }
        } catch (error) {
            console.error("Error checking admin status:", error);
            return redirect({
                to: "/",
            });
        }
    },
});

function RouteComponent() {
    const { data, error, isLoading, isError } = useQuery(getCanvasesQueryOptions);

    const setList = useManagementStore((state) => state.setCanvasList);
    const list = useManagementStore((state) => state.canvasList);

    if (isError) {
        console.error("Error fetching canvas list:", error);
        return <ErrorComponent />;
    }

    useEffect(() => {
        if (data) {
            setList(data);
        }
    }, [data, setList]);

    return (
        <>
            <Header />
            <main className="min-h-[calc(100dvh-var(--spacing)*16)]">
                {isLoading ? (
                    <LoadingSpinner />
                ) : list.length > 0 ? (
                    <Table>
                        <TableCaption>List of all canvases</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Last Modified</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {list.map((canvas) => (
                                <TableRow key={canvas.id}>
                                    <TableCell>{canvas.name}</TableCell>
                                    <TableCell>{canvas.owner}</TableCell>
                                    <TableCell>{lastModifiedAtToRelativeTime(canvas.lastModifiedAt)}</TableCell>
                                    <TableCell>
                                        <DeleteCanvasManagementDialog id={canvas.id} name={canvas.name}>
                                            <Button size="icon" variant="destructive">
                                                <Trash />
                                            </Button>
                                        </DeleteCanvasManagementDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Empty className="inset-0 m-auto">
                        <EmptyHeader>
                            <EmptyTitle>There are no canvases</EmptyTitle>
                            <EmptyDescription>
                                It seems that there have been no canvases created yet to be managed.
                            </EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                )}
            </main>
            <Footer />
        </>
    );
}
