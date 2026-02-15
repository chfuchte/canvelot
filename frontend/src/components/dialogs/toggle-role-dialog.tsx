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
import { updateUserRoleMutationOptions } from "@/queries/management";
import { useManagementStore } from "@/stores/management";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function ToggleUserRoleManagementDialog({
    id,
    name,
    role,
    children,
}: {
    id: string;
    name: string;
    role: "admin" | "user";
    children: React.ReactElement;
}) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const updateUserRoleMutation = useMutation(updateUserRoleMutationOptions);
    const updateUserRole = useManagementStore((state) => state.updateUserRole);
    const newRole = role === "admin" ? "user" : "admin";

    const handleChange = async () => {
        const [success, error] = await tryCatch(updateUserRoleMutation.mutateAsync({ userId: id, newRole: newRole }));
        setDialogOpen(false);

        if (!success) {
            console.error("Error changing user role:", error);
            toast.error("Failed to change user role. Please try again.");
            return;
        }

        updateUserRole(id, newRole);
        toast.success(`Users "${name}" role changed successfully.`);
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Change role of user "{name}" to {newRole}
                    </DialogTitle>
                    <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleChange} variant="secondary">
                        {newRole === "admin" ? "Make Admin" : "Revoke Rights"}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="destructive">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
