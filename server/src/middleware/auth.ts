import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { internalServerError, isAsset, isAPIRoute, tryCatch, unauthorized } from "../lib/utils.js";
import { logger } from "../lib/logger.js";
import { APIError } from "better-auth";

declare global {
    namespace Express {
        interface Request {
            session?: Awaited<ReturnType<typeof auth.api.getSession>>;
        }
    }
}

const log = logger({
    name: "middleware.auth",
    file: "middleware/auth.ts",
});

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.method === "GET" && isAsset(req.path)) {
        return next();
    }

    const [session, sessionError] = await tryCatch(
        auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        }),
    );

    if (sessionError) {
        log("error", `Error fetching session: ${JSON.stringify(sessionError)}`);

        if (sessionError instanceof APIError) return res.status(sessionError.statusCode).send(sessionError.body);

        return internalServerError(res);
    }

    if (!session) {
        if (isAPIRoute(req.path)) {
            return unauthorized(res);
        }

        const [data, error] = await tryCatch(
            auth.api.signInWithOAuth2({
                body: {
                    providerId: "oauth",
                    callbackURL: `${req.protocol}://${req.host}${req.originalUrl}`,
                },
                returnHeaders: true,
                headers: fromNodeHeaders(req.headers),
            }),
        );

        if (error) {
            log("error", `Error signing in with OAuth2: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        if (!data.response.redirect) {
            log("warn", "OAuth2 sign-in did not return a redirect while no session was found");
            return internalServerError(res);
        }

        res.setHeader("Set-Cookie", data.headers.get("set-cookie") || "");
        return res.redirect(data.response.url);
    }

    req.session = session;

    next();
}
