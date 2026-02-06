import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import z from "zod";

export const canvasSchema = z.object({
    _id: z.string(),
    name: z.string(),
    data: z
        .object({
            appState: z.custom<AppState>(),
            elements: z.array(z.custom<NonDeletedExcalidrawElement>()),
            files: z.custom<BinaryFiles>(),
        })
        .optional()
        .nullable(),
});

export type Canvas = z.infer<typeof canvasSchema>;
