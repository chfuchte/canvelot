import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import z from "zod";
import { useForm } from "@tanstack/react-form";
import { createCanvasMutationOptions } from "@/queries/canvas";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FieldError, Field, FieldGroup, FieldLabel } from "../ui/field";
import { useNavigate } from "@tanstack/react-router";
import { tryCatch } from "@/lib/utils";
import { useState } from "react";

const formSchema = z.object({
    name: z.string().nonempty("Canvas name is required"),
});

export function CreateCanvasDialog({ children }: { children: React.ReactElement }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const createCanvasMutation = useMutation(createCanvasMutationOptions);
    const navigate = useNavigate();

    const form = useForm({
        defaultValues: {
            name: "Untitled Canvas",
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            const [data, error] = await tryCatch(createCanvasMutation.mutateAsync(value.name));

            setDialogOpen(false);

            if (error) {
                console.error("Error creating canvas:", error);
                toast.error("Failed to update canvas");
                return;
            }
            toast.success("Canvas updated successfully");
            navigate({ to: "/canvas/$canvasId", params: { canvasId: data.id } });
        },
    });

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <form
                    id="create-canvas-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void form.handleSubmit();
                    }}>
                    <DialogHeader>
                        <DialogTitle>Create New Canvas</DialogTitle>
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
                                            placeholder="Untitled Canvas"
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
                    </FieldGroup>
                    <DialogFooter>
                        <Button type="submit" form="create-canvas-form">
                            Create
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
