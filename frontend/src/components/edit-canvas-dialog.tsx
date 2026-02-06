import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "./ui/input";
import * as z from "zod";
import { useForm } from "@tanstack/react-form";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { saveCanvasMutationOptions } from "@/queries/canvas";
import { toast } from "sonner";

const formSchema = z.object({
    name: z.string().nonempty("Canvas name is required"),
});

export function EditCanvasDialog({
    id,
    prev,
    children,
}: {
    id: string;
    prev: { name: string };
    children: React.ReactNode;
}) {
    const updateCanvasMutation = useMutation(saveCanvasMutationOptions);

    const form = useForm({
        defaultValues: {
            name: prev.name,
        },
        validators: {
            onSubmit: formSchema,
        },
        onSubmit: async ({ value }) => {
            const success = await updateCanvasMutation.mutateAsync({
                _id: id,
                name: value.name,
            });

            if (success) {
                toast.success("Canvas updated successfully");
            } else {
                toast.error("Failed to update canvas");
            }
        },
    });

    return (
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent>
                <form
                    id="edit-canvas-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        void form.handleSubmit();
                    }}>
                    <DialogHeader>
                        <DialogTitle>Edit "{prev.name}"</DialogTitle>
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
                    </FieldGroup>
                    <DialogFooter>
                        <Button type="submit" form="edit-canvas-form">
                            Submit
                        </Button>
                        <DialogClose>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
