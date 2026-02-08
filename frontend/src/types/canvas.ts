import z from "zod";

const canvasListOwnedCanvasSchema = z.object({
    id: z.string(),
    name: z.string(),
    is_owner: z.literal(true),
    owner: z.object({
        id: z.string(),
        username: z.string(),
    }),
    lastModifiedAt: z.string().transform((str) => new Date(str)),
    collaborators: z.array(
        z.object({
            id: z.string(),
            username: z.string(),
        }),
    ),
});

export type OwnedCanvas = z.infer<typeof canvasListOwnedCanvasSchema>;

const canvasListSharedCanvasSchema = z.object({
    id: z.string(),
    name: z.string(),
    is_owner: z.literal(false),
    owner: z.object({
        id: z.string(),
        username: z.string(),
    }),
    lastModifiedAt: z.string().transform((str) => new Date(str)),
});

export const canvasListSchema = z.array(canvasListOwnedCanvasSchema.or(canvasListSharedCanvasSchema));

export type CanvasList = z.infer<typeof canvasListSchema>;

export const canvasCreateSchema = z.object({
    id: z.string(),
});

export const userSelectionSchema = z.array(
    z.object({
        id: z.string(),
        username: z.string(),
    }),
);

export type UserSelection = z.infer<typeof userSelectionSchema>;
