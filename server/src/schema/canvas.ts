import z from "zod";
import type { BinaryFiles, AppState } from "@excalidraw/excalidraw/types";
import type { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

const canvasDataSchema = z
    .object({
        appState: z.custom<AppState>(),
        elements: z.array(z.custom<NonDeletedExcalidrawElement>()),
        files: z.custom<BinaryFiles>(),
    })
    .optional();
