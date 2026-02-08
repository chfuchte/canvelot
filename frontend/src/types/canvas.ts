import z from "zod";

const canvasListOwnedCanvasSchema = z.object({
    id: z.string(),
    name: z.string(),
    owner: z.object({
        id: z.string(),
        username: z.string(),
    }),
    lastModifiedAt: z.date(),
    is_shared: z.literal(false),
    sharedWith: z.array(
        z.object({
            id: z.string(),
            username: z.string(),
        }),
    ),
});

const canvasListSharedCanvasSchema = z.object({
    id: z.string(),
    name: z.string(),
    owner: z.object({
        id: z.string(),
        username: z.string(),
    }),
    lastModifiedAt: z.date(),
    is_shared: z.literal(true),
});

export const canvasListSchema = z.array(canvasListOwnedCanvasSchema.or(canvasListSharedCanvasSchema));

export type CanvasList = z.infer<typeof canvasListSchema>;
