import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { tryCatch } from "@/lib/utils";
import { canvasSchema, type Canvas } from "@/types/canvas";

export const fetchCanvasesQueryOptions = queryOptions({
    queryKey: ["canvases"],
    queryFn: fetchCanvases,
});

async function fetchCanvases(): Promise<[Array<{ _id: string; name: string }>, null] | [null, Error]> {
    const [response, fetchErr] = await tryCatch(fetch("/api/canvas"));
    if (fetchErr) return [null, fetchErr];

    if (!response.ok) return [null, new Error("Failed to fetch canvases")];

    const [json, jsonErr] = await tryCatch(response.json());
    if (jsonErr) {
        return [null, jsonErr];
    }

    return [json as Array<{ _id: string; name: string }>, null];
}

export const createCanvasMutationOptions = mutationOptions({
    mutationKey: ["create_canvas"],
    mutationFn: (name: string) => createCanvas(name),
});

async function createCanvas(name: string): Promise<[string, null] | [null, Error]> {
    const [response, fetchErr] = await tryCatch(
        fetch("/api/canvas", {
            method: "POST",
            body: JSON.stringify({ name }),
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );
    if (fetchErr) return [null, fetchErr];

    if (!response.ok) return [null, new Error("Failed to create canvas")];

    const [json, jsonErr] = await tryCatch(response.json());
    if (jsonErr) {
        return [null, jsonErr];
    }

    return [json.id, null];
}

export const fetchCanvasByIdQueryOptions = (canvasId: string) =>
    queryOptions({
        queryKey: ["canvas_id", canvasId],
        queryFn: () => fetchCanvasById(canvasId),
    });

async function fetchCanvasById(canvasId: string): Promise<[Canvas | undefined, null] | [null, Error]> {
    const [response, fetchErr] = await tryCatch(fetch(`/api/canvas/${canvasId}`));
    if (fetchErr) return [null, fetchErr];

    if (response.status === 404) return [undefined, null];

    if (!response.ok) return [null, new Error("Failed to fetch canvas")];

    const [json, jsonErr] = await tryCatch(response.json());
    if (jsonErr) {
        return [null, jsonErr];
    }

    const data = await canvasSchema.safeParseAsync(json);
    if (!data.success) {
        return [null, new Error("Invalid canvas data")];
    }

    return [data.data, null];
}

export const saveCanvasMutationOptions = mutationOptions({
    mutationKey: ["save_canvas"],
    mutationFn: (canvas: Canvas) => saveCanvas(canvas),
});

async function saveCanvas(canvas: Canvas) {
    const [response, fetchErr] = await tryCatch(
        fetch("/api/canvas", {
            method: "PUT",
            body: JSON.stringify(canvas),
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );
    if (fetchErr) return false;

    if (!response.ok) return false;

    return true;
}

export const deleteCanvasMutationOptions = mutationOptions({
    mutationKey: ["delete_canvas"],
    mutationFn: (canvasId: string) => deleteCanvas(canvasId),
});

async function deleteCanvas(canvasId: string): Promise<boolean> {
    const [response, fetchErr] = await tryCatch(
        fetch(`/api/canvas/${canvasId}`, {
            method: "DELETE",
        }),
    );
    if (fetchErr) return false;

    if (!response.ok) return false;

    return true;
}
