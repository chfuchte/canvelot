import type { Response, Request } from "express";
import { ObjectId } from "mongodb";

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<[T, null] | [null, E]> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        return [null, error as E];
    }
}

export function unauthorized(res: Response) {
    res.status(401).json({ error: "Unauthorized" });
}

export function forbidden(res: Response) {
    res.status(403).json({ error: "Forbidden" });
}

export function badRequest(res: Response, details: string | undefined = undefined) {
    res.status(400).json({ error: "Bad Request", details });
}

export function internalServerError(res: Response) {
    res.status(500).json({ error: "Internal Server Error" });
}

export function notFound(res: Response) {
    res.status(404).json({ error: "Not Found" });
}

export function getUserIdFromRequest(req: Request) {
    const session = req.session;

    if (!session) return null;

    if (!ObjectId.isValid(session.user.id)) return null;

    const userId = ObjectId.createFromHexString(session.user.id);

    return userId;
}

export function getUserFromRequest(req: Request) {
    const session = req.session;

    if (!session) return null;

    if (!ObjectId.isValid(session.user.id)) return null;

    const userId = ObjectId.createFromHexString(session.user.id);

    return {
        id: userId,
        username: session.user.username,
        role: session.user.role,
    };
}

export function isAsset(path: string) {
    return path.startsWith("/assets/") || path.startsWith("/favicon") || path.startsWith("/robots.txt");
}

export function isAPIRoute(path: string) {
    return path.startsWith("/api/");
}
