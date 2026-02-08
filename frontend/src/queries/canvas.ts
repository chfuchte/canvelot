import { queryOptions } from "@tanstack/react-query";
import { tryCatch } from "@/lib/utils";
import { canvasListSchema, type CanvasList } from "@/types/canvas";
import { mockCanvasList } from "@/mocks/canvas";

export const fetchCanvasListQueryOptions = queryOptions({
    queryKey: ["canvas-list"],
    queryFn: fetchCanvasList,
});

async function fetchCanvasList(): Promise<CanvasList> {
    if (import.meta.env.DEV) return mockCanvasList;

    const [response, fetchErr] = await tryCatch(fetch("/api/canvas"));
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to fetch canvases");

    const [json, jsonErr] = await tryCatch(response.json());
    if (jsonErr) {
        throw jsonErr;
    }

    const { data, success, error } = canvasListSchema.safeParse(json);
    if (!success) {
        throw error;
    }

    return data;
}
