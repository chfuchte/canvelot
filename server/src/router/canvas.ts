import { Router } from "express";
import { db } from "../db/index.js";
import { CANVAS_COLLECTION, USER_COLLECTION, type CanvasDocument, type UserDocument } from "../db/schema.js";
import { type WithId } from "mongodb";
import { badRequest, getUserIdFromRequest, tryCatch, unauthorized } from "../lib/utils.js";
import { logger } from "../lib/logger.js";
import { createCanvasSchema } from "../schema/canvas.js";

const log = logger({
    name: "router.canvas",
    file: "router/canvas.ts",
});

export function canvasRouter() {
    const router = Router();

    router.get("/", async (req, res) => {
        const userId = getUserIdFromRequest(req);
        if (!userId) return unauthorized(res);

        const [results, error] = await tryCatch(
            db
                .collection<CanvasDocument>(CANVAS_COLLECTION)
                .aggregate<
                    WithId<
                        CanvasDocument & {
                            ownerUsername: UserDocument["username"];
                            sharedWithUsernames: UserDocument["username"][];
                        }
                    >
                >([
                    {
                        $match: {
                            $or: [{ ownerId: userId }, { sharedWithIds: userId }],
                        },
                    },
                    {
                        $lookup: {
                            from: USER_COLLECTION,
                            localField: "ownerId",
                            foreignField: "_id",
                            as: "ownerInfo",
                        },
                    },
                    {
                        $unwind: "$ownerInfo",
                    },
                    {
                        $lookup: {
                            from: USER_COLLECTION,
                            let: { sharedIds: "$sharedWithIds", isOwner: { $eq: ["$ownerId", userId] } },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $in: ["$_id", "$$sharedIds"] }, { $eq: ["$$isOwner", true] }],
                                        },
                                    },
                                },
                            ],
                            as: "sharedWithUsers",
                        },
                    },
                    {
                        $project: {
                            _id: true,
                            name: true,
                            lastModifiedAt: true,
                            ownerId: true,
                            ownerUsername: "$ownerInfo.username",
                            sharedWithIds: true,
                            sharedWithUsernames: "$sharedWithUsers.username",
                        },
                    },
                ])
                .toArray(),
        );

        if (error) {
            log("error", `Failed to fetch canvases: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        log("debug", `Fetched ${results.length} canvases for user ${userId}: ${JSON.stringify(results)}`);

        res.status(200).json(
            results.map((canvas) => {
                if (canvas.ownerId.equals(userId)) {
                    return {
                        id: canvas._id.toHexString(),
                        name: canvas.name,
                        owner: {
                            id: canvas.ownerId.toHexString(),
                            username: canvas.ownerUsername,
                        },
                        lastModifiedAt: canvas.lastModifiedAt,
                        is_shared: false,
                        sharedWith: canvas.sharedWithIds.map((id, index) => ({
                            id: id.toHexString(),
                            username: canvas.sharedWithUsernames[index],
                        })),
                    };
                }

                return {
                    id: canvas._id.toHexString(),
                    name: canvas.name,
                    owner: {
                        id: canvas.ownerId.toHexString(),
                        username: canvas.ownerUsername,
                    },
                    is_shared: true,
                    lastModifiedAt: canvas.lastModifiedAt,
                };
            }),
        );
    });

    router.post("/", async (req, res) => {
        const userId = getUserIdFromRequest(req);
        if (!userId) return unauthorized(res);

        const { success, data: creationData } = createCanvasSchema.safeParse(req.body);
        if (!success) {
            return badRequest(res);
        }

        const [result, error] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).insertOne({
                name: creationData.name,
                ownerId: userId,
                lastModifiedAt: new Date(),
                sharedWithIds: [],
                data: null,
            }),
        );

        if (error) {
            log("error", `Failed to create canvas: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        res.status(200).json({ id: result.insertedId.toHexString() });
    });

    return router;
}
