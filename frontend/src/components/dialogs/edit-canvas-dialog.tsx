import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchUserSelectionQueryOptions } from "@/queries/user";
import type { OwnedCanvas } from "@/types/canvas";
import { MultiSelect } from "../ui/multi-select";
import { useState } from "react";
import { toast } from "sonner";
import { editCanvasDetailsMutationOptions } from "@/queries/canvas";
import { tryCatch } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvas";

export function EditCanvasDialog({ prev, children }: { prev: OwnedCanvas; children: React.ReactElement }) {
    const updateCanvas = useCanvasStore((state) => state.updateCanvas);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { data: users, isError, error, isLoading } = useQuery(fetchUserSelectionQueryOptions);
    const editCanvasDetailsMutation = useMutation(editCanvasDetailsMutationOptions);

    const formSchema = z.object({
        name: z.string().nonempty("Canvas name is required"),
        collaborators: z.array(z.enum(users?.map((u) => u.id) || [])),
    });

    const form = useForm({
        defaultValues: {
            name: prev.name,
            collaborators: prev.collaborators.map((u) => u.id),
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            const [success, error] = await tryCatch(
                editCanvasDetailsMutation.mutateAsync({
                    id: prev.id,
                    name: value.name,
                    collaboratorIds: value.collaborators,
                }),
            );

            setDialogOpen(false);

            if (!success) {
                console.error("Error fetching share with users:", error);
                toast.error("An error occurred while updating the canvas. Please try again.");
                return;
            }

            updateCanvas({
                id: prev.id,
                name: value.name,
                collaborators:
                    users
                        ?.filter((u) => value.collaborators.includes(u.id))
                        .map((u) => ({ id: u.id, username: u.username })) || [],
                is_owner: prev.is_owner,
                lastModifiedAt: new Date(),
                owner: prev.owner,
            });
            toast.success("Canvas updated successfully!");
        },
    });

    if (isError) {
        console.error("Error fetching share with users:", error);
        return null;
    }

    if (isLoading || users === undefined) return null;

    return (
        <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <form
                    id="edit-canvas-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void form.handleSubmit();
                    }}>
                    <DialogHeader>
                        <DialogTitle>Edit "{prev.name}"</DialogTitle>
                        <DialogDescription>Edit the details of your canvas below.</DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="my-4">
                        <form.Field
                            name="name"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Canvas Name</FieldLabel>
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            aria-invalid={isInvalid}
                                            autoComplete="off"
                                        />
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />
                        <form.Field
                            name="collaborators"
                            children={(field) => {
                                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>Collaborators</FieldLabel>
                                        <MultiSelect
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={field.handleChange}
                                            placeholder="Select users"
                                            options={users.map((u) => ({ name: u.username, id: u.id }))}
                                            aria-invalid={isInvalid}
                                        />
                                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                    </Field>
                                );
                            }}
                        />
                    </FieldGroup>
                    <DialogFooter>
                        <Button type="submit" form="edit-canvas-form">
                            Submit
                        </Button>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
