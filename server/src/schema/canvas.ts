import { ObjectId } from "mongodb";
import z from "zod";
import type {BinaryFiles, AppState} from "@excalidraw/excalidraw/types"
import type { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export const canvasDataSchema = z.object({
    id: z.string().transform((v) => ObjectId.createFromHexString(v)),
    data: z
        .object({
            appState: z.custom<AppState>(),
            elements: z.array(z.custom<NonDeletedExcalidrawElement>()),
            files: z.custom<BinaryFiles>(),
        })
        .optional(),
});

export const canvasMetaSchema = z.object({
    id: z.string().transform((v) => ObjectId.createFromHexString(v)),
    name: z.string().optional(),
});
