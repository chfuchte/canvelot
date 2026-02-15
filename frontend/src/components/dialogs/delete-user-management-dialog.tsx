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
    import { deleteUserMutationOptions } from "@/queries/management";
    import { useManagementStore } from "@/stores/management";
    import { useMutation } from "@tanstack/react-query";
    import { useState } from "react";
    import { toast } from "sonner";

    export function DeleteUserManagementDialog({
        id,
        name,
        children,
    }: {
        id: string;
        name: string;
        children: React.ReactElement;
    }) {
        const [dialogOpen, setDialogOpen] = useState(false);
        const deleteUserMutation = useMutation(deleteUserMutationOptions);
        const removeUser = useManagementStore((state) => state.deleteUser);

        const handleDelete = async () => {
            const [success, error] = await tryCatch(deleteUserMutation.mutateAsync(id));

            setDialogOpen(false);

            if (!success) {
                console.error("Error deleting user:", error);
                toast.error("Failed to delete user. Please try again.");
                return;
            }

            removeUser(id);
            toast.success(`User "${name}" deleted successfully.`);
        };

        return (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm deletion of user "{name}"</DialogTitle>
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
