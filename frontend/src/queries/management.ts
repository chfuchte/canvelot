import { queryOptions, mutationOptions } from "@tanstack/react-query";
import { tryCatch } from "@/lib/utils";
import { canvasesSchema, usersSchema } from "@/types/management";
import { mockManagementCanvasList } from "@/mocks/canvas";
import { usersMock } from "@/mocks/users";

export const getIsAdminQueryOptions = queryOptions({
    queryKey: ["management", "isAdmin"],
    queryFn: fetchIsAdmin,
});

export async function fetchIsAdmin() {
    if (import.meta.env.DEV) return true;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/authentication/is-current-user-admin`, {
            method: "GET",
        }),
    );
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to fetch admin status");

    const [json, jsonErr] = await tryCatch(response.json());
    if (jsonErr) {
        throw jsonErr;
    }

    return json.isAdmin === true;
}

export const getUsersQueryOptions = queryOptions({
    queryKey: ["management", "users"],
    queryFn: fetchUsers,
});

async function fetchUsers() {
    if (import.meta.env.DEV) return usersMock;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/management/users`, {
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

    const { data, success, error } = usersSchema.safeParse(json);
    if (!success) {
        throw error;
    }

    return data;
}

export const getCanvasesQueryOptions = queryOptions({
    queryKey: ["management", "canvases"],
    queryFn: fetchCanvases,
});

async function fetchCanvases() {
    if (import.meta.env.DEV) return mockManagementCanvasList;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/management/canvas`, {
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

    const { data, success, error } = canvasesSchema.safeParse(json);
    if (!success) {
        throw error;
    }
    return data;
}

export const deleteCanvasMutationOptions = mutationOptions({
    mutationKey: ["management", "canvas", "delete"],
    mutationFn: deleteCanvas,
});

async function deleteCanvas(canvasId: string) {
    if (import.meta.env.DEV) return true;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/management/canvas/${canvasId}`, {
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

export const deleteUserMutationOptions = mutationOptions({
    mutationKey: ["management", "user", "delete"],
    mutationFn: deleteUser,
});

async function deleteUser(userId: string) {
    if (import.meta.env.DEV) return true;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/management/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to delete user");

    return true;
}

export const updateUserRoleMutationOptions = mutationOptions({
    mutationKey: ["management", "user", "updateRole"],
    mutationFn: updateUserRole,
});

async function updateUserRole(data: { userId: string; newRole: "admin" | "user" }) {
    const { userId, newRole } = data;
    if (import.meta.env.DEV) return true;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/management/users/${userId}/role`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ role: newRole }),
        }),
    );
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to update user role");

    return true;
}
