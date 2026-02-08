import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<[T, null] | [null, E]> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        return [null, error as E];
    }
}

export function lastModifiedAtToRelativeTime(
    lastModifiedAt: Date | string,
): `${number} ${"day" | "days" | "hour" | "hours" | "minute" | "minutes"} ago` | "just now" {
    const lastModifiedDate = new Date(lastModifiedAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastModifiedDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "just now";
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }
}
