import { queryOptions } from "@tanstack/react-query";
import { tryCatch } from "@/lib/utils";
import { canvasCreateSchema, canvasListSchema, canvasSchema, type CanvasList } from "@/types/canvas";
import { mockCanvas, mockCanvasList } from "@/mocks/canvas";
import { gzip } from "pako";

export const fetchCanvasListQueryOptions = queryOptions({
    queryKey: ["canvas-list"],
    queryFn: fetchCanvasList,
});

async function fetchCanvasList(): Promise<CanvasList> {
    if (import.meta.env.DEV) return mockCanvasList;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/canvas`, {
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
        fetch(`${__API_URL__}/api/canvas`, {
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
        fetch(`${__API_URL__}/api/canvas/${id}`, {
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
        fetch(`${__API_URL__}/api/canvas/details/${data.id}`, {
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

export const getCanvasQueryOptions = (id: string) =>
    queryOptions({
        queryKey: ["canvas", id],
        queryFn: () => fetchCanvas(id),
    });

async function fetchCanvas(id: string) {
    if (import.meta.env.DEV) return mockCanvas;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/canvas/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to fetch canvas");

    const [json, jsonErr] = await tryCatch(response.json());
    if (jsonErr) {
        throw jsonErr;
    }

    const { data, success, error } = canvasSchema.safeParse(json);
    if (!success) {
        throw error;
    }

    return data;
}

export const editCanvasDataMutationOptions = {
    mutationKey: ["edit-canvas-data"],
    mutationFn: editCanvasData,
};

async function editCanvasData({ id, data }: { id: string; data: Record<string, unknown> }) {
    if (import.meta.env.DEV) return true;

    const json = JSON.stringify(data);
    const compressed = gzip(json);

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/canvas/data/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Content-Encoding": "gzip",
            },
            body: compressed,
        }),
    );

    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to edit canvas data");

    return true;
}
