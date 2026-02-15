import type { NextFunction, Request, Response } from "express";
import { forbidden, getUserFromRequest, isAPIRoute, unauthorized } from "../lib/utils.js";

export async function roleMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!isAPIRoute(req.path)) {
        next();
        return;
    }

    const user = getUserFromRequest(req);
    if (!user) return unauthorized(res);

    if (user.role !== "admin") {
        return forbidden(res);
    }

    next();
}
