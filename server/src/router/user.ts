import { Router } from "express";
import { logger } from "../lib/logger.js";
import { getUserIdFromRequest, tryCatch, unauthorized } from "../lib/utils.js";
import { db } from "../db/index.js";
import { USER_COLLECTION, type UserDocument } from "../db/schema.js";
import type { WithId } from "mongodb";

const log = logger({
    name: "router.user",
    file: "router/user.ts",
});

export function userRouter() {
    const router = Router();

    router.get("/selection-data", async (req, res) => {
        const userId = getUserIdFromRequest(req);
        if (!userId) return unauthorized(res);

        const [results, error] = await tryCatch(
            db
                .collection<UserDocument>(USER_COLLECTION)
                .find({
                    _id: { $ne: userId },
                })
                .project<WithId<Pick<UserDocument, "username">>>({
                    _id: true,
                    username: true,
                })
                .toArray(),
        );

        if (error) {
            log("error", `Failed to fetch canvases: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        res.status(200).json(
            results.map((user) => ({
                id: user._id.toHexString(),
                username: user.username,
            })),
        );
    });

    return router;
}
