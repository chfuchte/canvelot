import { queryOptions } from "@tanstack/react-query";
import { tryCatch } from "@/lib/utils";
import { userSelectionSchema, type UserSelection } from "@/types/canvas";
import { mockUserSelectionData } from "@/mocks/canvas";

export const fetchUserSelectionQueryOptions = queryOptions({
    queryKey: ["user-selection"],
    queryFn: fetchUserSelectionData,
});

async function fetchUserSelectionData(): Promise<UserSelection> {
    if (import.meta.env.DEV) return mockUserSelectionData;

    const [response, fetchErr] = await tryCatch(
        fetch(`${__API_URL__}/api/user/selection-data`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }),
    );
    if (fetchErr) throw fetchErr;

    if (!response.ok) throw new Error("Failed to fetch user selection data");

    const [json, jsonErr] = await tryCatch(response.json());
    if (jsonErr) {
        throw jsonErr;
    }

    const { data, success, error } = userSelectionSchema.safeParse(json);
    if (!success) {
        throw error;
    }

    return data;
}
