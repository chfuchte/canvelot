import z from "zod";
import type { BinaryFiles, AppState } from "@excalidraw/excalidraw/types";
import type { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { ObjectId } from "mongodb";

export const createCanvasSchema = z.object({
    name: z.string(),
});

export const updateCanvasDetailsSchema = z
    .object({
        name: z.string(),
        collaboratorIds: z.array(z.string()),
        viewerIds: z.array(z.string()),
    })
    .refine(
        (data) => {
            const collaboratorSet = new Set(data.collaboratorIds);
            const viewerSet = new Set(data.viewerIds);
            return (
                collaboratorSet.size === data.collaboratorIds.length &&
                viewerSet.size === data.viewerIds.length &&
                [...collaboratorSet].every((id) => !viewerSet.has(id))
            );
        },
        {
            message: "Collaborators and viewers must be different users",
            path: ["collaboratorIds", "viewerIds"],
        },
    )
    .transform((data) => ({
        name: data.name,
        collaboratorIds: data.collaboratorIds.map((id) => new ObjectId(id)),
        viewerIds: data.viewerIds.map((id) => new ObjectId(id)),
    }));

export const canvasDataSchema = z
    .object({
        appState: z.custom<AppState>(),
        elements: z.array(z.custom<NonDeletedExcalidrawElement>()),
        files: z.custom<BinaryFiles>(),
    })
    .nullable();
