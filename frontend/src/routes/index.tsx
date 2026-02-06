import { EditCanvasDialog } from "@/components/edit-canvas-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemActions, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from "@/components/ui/item";
import { createCanvasMutationOptions, deleteCanvasMutationOptions, fetchCanvasesQueryOptions } from "@/queries/canvas";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ExternalLink, LogOut, Pen, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
    component: RouteComponent,
    // @ts-expect-error context type is not inferred correctly
    loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fetchCanvasesQueryOptions),
});

function RouteComponent() {
    const {
        data: [canvases, error],
    } = useSuspenseQuery(fetchCanvasesQueryOptions);

    if (error) {
        throw error;
    }

    const navigate = useNavigate();
    const newCanvasMutation = useMutation(createCanvasMutationOptions);
    const deleteCanvasMutation = useMutation(deleteCanvasMutationOptions);

    const handleLogout = () => {
        window.location.href = "/api/logout";
    };

    const createCanvas = async () => {
        const [id, error] = await newCanvasMutation.mutateAsync("Untitled Canvas");
        if (error) {
            toast.error("Failed to create canvas");
        } else {
            toast.success("Canvas created successfully");
            void navigate({
                to: "/canvas/$canvasId",
                params: { canvasId: id },
            });
        }
    };

    const deleteCanvas = async (id: string) => {
        const success = await deleteCanvasMutation.mutateAsync(id);
        if (success) {
            canvases.splice(
                canvases.findIndex((canvas) => canvas._id === id),
                1,
            );
            toast.success("Canvas deleted successfully");
        } else {
            toast.error("Failed to delete canvas");
        }
    };

    return (
        <>
            <header className="flex flex-row items-center justify-between gap-2 p-4">
                <h1 className="text-2xl font-bold">Canvelot</h1>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button onClick={createCanvas}>
                                <Plus /> New Canvas
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Canvas</DialogTitle>
                            </DialogHeader>
                            <DialogFooter>
                                <Button>Create</Button>
                                <DialogClose>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="secondary" onClick={handleLogout}>
                        <LogOut /> Log Out
                    </Button>
                </div>
            </header>
            {canvases.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {canvases.map((canvas) => (
                        <Item key={canvas._id} variant="muted" title={canvas.name}>
                            <ItemHeader>
                                <Link
                                    to="/canvas/$canvasId"
                                    params={{ canvasId: canvas._id }}
                                    className="relative h-full w-full">
                                    <ItemTitle>{canvas.name}</ItemTitle>
                                    <ItemDescription>Shared with you by @cfu</ItemDescription>
                                    <ExternalLink className="absolute top-0 right-0 size-4 stroke-current" />
                                </Link>
                            </ItemHeader>
                            <ItemFooter>
                                <ItemDescription>5 days ago</ItemDescription>
                                <ItemActions>
                                    <EditCanvasDialog id={canvas._id} prev={{ name: canvas.name }}>
                                        <Button variant="secondary" size="icon">
                                            <Pen />
                                        </Button>
                                    </EditCanvasDialog>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" size="icon">
                                                <Trash />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Confirm deletion of "{canvas.name}"</DialogTitle>
                                                <DialogDescription>This action cannot be undone.</DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => void deleteCanvas(canvas._id)}>
                                                    Delete
                                                </Button>
                                                <DialogClose>
                                                    <Button variant="secondary">Cancel</Button>
                                                </DialogClose>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </ItemActions>
                            </ItemFooter>
                        </Item>
                    ))}
                </div>
            ) : (
                <Empty className="inset-0 m-auto">
                    <EmptyHeader>
                        <EmptyTitle>There are no canvases yet</EmptyTitle>
                        <EmptyDescription>Create your first canvas to get started</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => void createCanvas()}>
                            <Plus /> Create your first canvas
                        </Button>
                    </EmptyContent>
                </Empty>
            )}
        </>
    );
}
