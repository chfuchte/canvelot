import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { tryCatch } from "../lib/utils.js";
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
    if (req.method === "GET" && /^\/?(?:fonts\/.*|assets\/.*|robots\.txt|favicon\.ico|logo.*)$/.test(req.path)) {
        return next();
    }

    const [session, sessionError] = await tryCatch(
        auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        }),
    );

    if (sessionError) {
        log("error", `Error fetching session: ${JSON.stringify(sessionError)}`);

        if (sessionError instanceof APIError) {
            res.status(sessionError.statusCode).send(sessionError.body);
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }

        return;
    }

    if (!session) {
        const [data, error] = await tryCatch(
            auth.api.signInWithOAuth2({
                body: {
                    providerId: "oauth",
                },
                returnHeaders: true,
                headers: fromNodeHeaders(req.headers),
            }),
        );

        if (error) {
            log("error", `Error signing in with OAuth2: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        if (!data.response.redirect) return;

        res.setHeader("Set-Cookie", data.headers.get("set-cookie") || "");
        res.redirect(data.response.url);

        return;
    }

    req.session = session;

    next();
}
