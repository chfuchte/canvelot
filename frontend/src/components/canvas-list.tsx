import type { CanvasList } from "@/types/canvas";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { ExternalLink, Pen, Plus, Trash } from "lucide-react";
import { DeleteCanvasDialog } from "@/components/dialogs/delete-canvas-dialog";
import { EditCanvasDialog } from "@/components/dialogs/edit-canvas-dialog";
import { Item, ItemActions, ItemDescription, ItemFooter, ItemHeader, ItemTitle } from "@/components/ui/item";
import { Link } from "@tanstack/react-router";
import { lastModifiedAtToRelativeTime } from "@/lib/utils";
import { CreateCanvasDialog } from "./dialogs/create-canvas-dialog";

export function CanvasListGrid({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {children}
        </div>
    );
}

export function CanvasList({ list }: { list: CanvasList }) {
    return (
        <CanvasListGrid>
            {list.map((canvas) => (
                <Item key={canvas.id} variant="muted" title={canvas.name}>
                    <ItemHeader>
                        <Link
                            to="/canvas/$canvasId"
                            params={{ canvasId: canvas.id }}
                            className="relative h-full w-full">
                            <ItemTitle>{canvas.name}</ItemTitle>

                            {canvas.is_shared ? (
                                <ItemDescription>shared with you by {canvas.owner.username}</ItemDescription>
                            ) : (
                                <ItemDescription>
                                    {canvas.sharedWith.length > 0
                                        ? `shared with ${canvas.sharedWith.length} ${canvas.sharedWith.length > 1 ? "people" : "person"}`
                                        : "private"}
                                </ItemDescription>
                            )}

                            <ExternalLink className="absolute top-0 right-0 size-4 stroke-current" />
                        </Link>
                    </ItemHeader>
                    <ItemFooter>
                        <ItemDescription>{lastModifiedAtToRelativeTime(canvas.lastModifiedAt)}</ItemDescription>
                        <ItemActions>
                            <EditCanvasDialog id={canvas.id} prev={{ name: canvas.name }}>
                                <Button variant="ghost" size="icon">
                                    <Pen />
                                </Button>
                            </EditCanvasDialog>
                            <DeleteCanvasDialog id={canvas.id} name={canvas.name}>
                                <Button variant="ghost" size="icon">
                                    <Trash />
                                </Button>
                            </DeleteCanvasDialog>
                        </ItemActions>
                    </ItemFooter>
                </Item>
            ))}
        </CanvasListGrid>
    );
}

export function CanvasListEmpty() {
    return (
        <Empty className="inset-0 m-auto">
            <EmptyHeader>
                <EmptyTitle>There are no canvases yet</EmptyTitle>
                <EmptyDescription>Create your first canvas to get started</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <CreateCanvasDialog>
                    <Button>
                        <Plus /> Create your first canvas
                    </Button>
                </CreateCanvasDialog>
            </EmptyContent>
        </Empty>
    );
}
