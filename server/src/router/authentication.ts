import { Router } from "express";
import { internalServerError, tryCatch, unauthorized } from "../lib/utils.js";
import { logger } from "../lib/logger.js";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { env } from "../env.js";

const log = logger({
    name: "router.authentication",
    file: "router/authentication.ts",
});

export function authenticationRouter() {
    const router = Router();

    router.get("/logout", async (req, res) => {
        const [success, error] = await tryCatch(
            auth.api.signOut({
                headers: fromNodeHeaders(req.headers),
            }),
        );

        if (error) {
            log("error", `Failed to log out user: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        if (!success) return unauthorized(res);

        res.redirect(env.OAUTH_LOGOUT_REDIRECT_URL);
    });

    return router;
}
