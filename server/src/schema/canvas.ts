import z from "zod";
import type { BinaryFiles, AppState } from "@excalidraw/excalidraw/types";
import type { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { ObjectId } from "mongodb";

export const createCanvasSchema = z.object({
    name: z.string(),
});

export const updateCanvasDetailsSchema = z.object({
    name: z.string(),
    collaboratorIds: z.array(z.string().transform((id) => new ObjectId(id))),
});

export const canvasDataSchema = z
    .object({
        appState: z.custom<AppState>(),
        elements: z.array(z.custom<NonDeletedExcalidrawElement>()),
        files: z.custom<BinaryFiles>(),
    })
    .nullable();
