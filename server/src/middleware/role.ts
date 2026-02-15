import type { NextFunction, Request, Response } from "express";
import { forbidden, getUserFromRequest, isAsset, unauthorized } from "../lib/utils.js";

export async function roleMiddleware(req: Request, res: Response, next: NextFunction) {
    if (isAsset(req.path)) {
        return next();
    }

    const user = getUserFromRequest(req);
    if (!user) return unauthorized(res);

    if (user.role !== "admin") {
        return forbidden(res);
    }

    next();
}
