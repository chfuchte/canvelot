import { queryOptions } from "@tanstack/react-query";
import { tryCatch } from "@/lib/utils";
import { canvasCreateSchema, canvasListSchema, type CanvasList } from "@/types/canvas";
import { mockCanvasList } from "@/mocks/canvas";

export const fetchCanvasListQueryOptions = queryOptions({
    queryKey: ["canvas-list"],
    queryFn: fetchCanvasList,
});

async function fetchCanvasList(): Promise<CanvasList> {
    if (import.meta.env.DEV) return mockCanvasList;

    const [response, fetchErr] = await tryCatch(
        fetch("/api/canvas", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );
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

export const createCanvasMutationOptions = {
    mutationKey: ["create-canvas"],
    mutationFn: createCanvas,
};

async function createCanvas(name: string) {
    if (import.meta.env.DEV) return { id: "1" };

    const [response, fetchErr] = await tryCatch(
        fetch("/api/canvas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
        }),
    );
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to create canvas");

    const [json, jsonErr] = await tryCatch(response.json());
    if (jsonErr) {
        throw jsonErr;
    }

    const { data, success, error } = canvasCreateSchema.safeParse(json);
    if (!success) {
        throw error;
    }

    return data;
}

export const deleteCanvasMutationOptions = {
    mutationKey: ["delete-canvas"],
    mutationFn: deleteCanvas,
};

async function deleteCanvas(id: string) {
    if (import.meta.env.DEV) return true;

    const [response, fetchErr] = await tryCatch(
        fetch(`/api/canvas/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to delete canvas");

    return true;
}

export const editCanvasDetailsMutationOptions = {
    mutationKey: ["edit-canvas-details"],
    mutationFn: editCanvasDetails,
};

async function editCanvasDetails(data: { id: string; name: string; collaboratorIds: string[] }) {
    if (import.meta.env.DEV) return true;

    const [response, fetchErr] = await tryCatch(
        fetch(`/api/canvas/details/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: data.name, collaboratorIds: data.collaboratorIds }),
        }),
    );
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to edit canvas details");

    return true;
}
