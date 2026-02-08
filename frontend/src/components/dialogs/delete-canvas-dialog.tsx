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
import { tryCatch } from "@/lib/utils";
import { deleteCanvasMutationOptions } from "@/queries/canvas";
import { useCanvasStore } from "@/stores/canvas";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteCanvasDialog({ id, name, children }: { id: string; name: string; children: React.ReactElement }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const deleteCanvasMutation = useMutation(deleteCanvasMutationOptions);
    const removeCanvas = useCanvasStore((state) => state.removeCanvas);

    const handleDelete = async () => {
        const [success, error] = await tryCatch(deleteCanvasMutation.mutateAsync(id));

        setDialogOpen(false);

        if (!success) {
            console.error("Error deleting canvas:", error);
            toast.error("Failed to delete canvas. Please try again.");
            return;
        }

        removeCanvas(id);
        toast.success(`Canvas "${name}" deleted successfully.`);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm deletion of "{name}"</DialogTitle>
                    <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleDelete} variant="destructive">
                        Delete
                    </Button>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
