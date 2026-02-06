import { ObjectId } from "mongodb";
import z from "zod";

export const canvasDataSchema = z.object({
    id: z.string().transform((v) => ObjectId.createFromHexString(v)),
    data: z
        .object({
            appState: z.any(),
            elements: z.array(z.any()),
            files: z.any(),
        })
        .optional(),
});

export const canvasMetaSchema = z.object({
    id: z.string().transform((v) => ObjectId.createFromHexString(v)),
    name: z.string().optional(),
});
