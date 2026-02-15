import { Router } from "express";
import { db } from "../db/index.js";
import { CANVAS_COLLECTION, USER_COLLECTION, type CanvasDocument, type UserDocument } from "../db/schema.js";
import { ObjectId, type WithId } from "mongodb";
import {
    badRequest,
    getUserIdFromRequest,
    internalServerError,
    notFound,
    tryCatch,
    unauthorized,
} from "../lib/utils.js";
import { logger } from "../lib/logger.js";
import { canvasDataSchema, createCanvasSchema, updateCanvasDetailsSchema } from "../schema/canvas.js";
import { gzipAsync } from "../lib/gzip.js";

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
                            collaboratorUsernames: { _id: ObjectId; username: UserDocument["username"] }[];
                            viewerUsernames: { _id: ObjectId; username: UserDocument["username"] }[];
                        }
                    >
                >([
                    {
                        $match: {
                            $or: [{ ownerId: userId }, { collaboratorIds: userId }, { viewerIds: userId }],
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
                            let: {
                                collaboratorIds: "$collaboratorIds",
                                isOwner: { $eq: ["$ownerId", userId] },
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $in: ["$_id", "$$collaboratorIds"] },
                                                { $eq: ["$$isOwner", true] },
                                            ],
                                        },
                                    },
                                },
                                {
                                    $project: { username: 1 },
                                },
                            ],
                            as: "collaboratorUsernames",
                        },
                    },
                    {
                        $lookup: {
                            from: USER_COLLECTION,
                            let: {
                                viewerIds: "$viewerIds",
                                isOwner: { $eq: ["$ownerId", userId] },
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [{ $in: ["$_id", "$$viewerIds"] }, { $eq: ["$$isOwner", true] }],
                                        },
                                    },
                                },
                                {
                                    $project: { username: 1 },
                                },
                            ],
                            as: "viewerUsernames",
                        },
                    },
                    {
                        $project: {
                            _id: true,
                            name: true,
                            lastModifiedAt: true,
                            ownerId: true,
                            ownerUsername: "$ownerInfo.username",
                            collaboratorIds: true,
                            collaboratorUsernames: "$collaboratorUsernames",
                            viewerIds: true,
                            viewerUsernames: "$viewerUsernames",
                        },
                    },
                    {
                        $sort: { lastModifiedAt: -1, name: 1 },
                    },
                ])
                .toArray(),
        );

        if (error) {
            log("error", `Failed to fetch canvases: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

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
                        is_owner: true,
                        editable: true,
                        lastModifiedAt: canvas.lastModifiedAt,
                        collaborators: canvas.collaboratorIds.map((id, index) => ({
                            id: id.toHexString(),
                            username: canvas.collaboratorUsernames[index].username,
                        })),
                        viewers: canvas.viewerIds.map((id, index) => ({
                            id: id.toHexString(),
                            username: canvas.viewerUsernames[index].username,
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
                    is_owner: false,
                    editable: canvas.collaboratorIds.some((id) => id.equals(userId)),
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
                collaboratorIds: [],
                viewerIds: [],
                data: null,
            }),
        );

        if (error) {
            log("error", `Failed to create canvas: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        res.status(200).json({ id: result.insertedId.toHexString() });
    });

    router.delete("/:id", async (req, res) => {
        const userId = getUserIdFromRequest(req);
        if (!userId) return unauthorized(res);

        const canvasId = req.params.id;

        if (!ObjectId.isValid(canvasId)) return badRequest(res);

        const [canvas, findError] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).findOne({
                _id: new ObjectId(canvasId),
                ownerId: userId,
            }),
        );

        if (findError) {
            log("error", `Failed to find canvas: ${JSON.stringify(findError)}`);
            return internalServerError(res);
        }

        if (!canvas) return notFound(res);

        const [deleteResult, deleteError] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).deleteOne({
                _id: new ObjectId(canvasId),
                ownerId: userId,
            }),
        );

        if (deleteError || deleteResult.deletedCount === 0) {
            log("error", `Failed to delete canvas: ${JSON.stringify(deleteError)}`);
            return internalServerError(res);
        }

        res.status(200).json({ success: true });
    });

    router.put("/details/:id", async (req, res) => {
        const userId = getUserIdFromRequest(req);
        if (!userId) return unauthorized(res);

        const canvasId = req.params.id;

        if (!ObjectId.isValid(canvasId)) return badRequest(res);

        const { success, data } = updateCanvasDetailsSchema.safeParse(req.body);

        if (!success) return badRequest(res);

        const [canvas, findError] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).findOne({
                _id: new ObjectId(canvasId),
                ownerId: userId,
            }),
        );

        if (findError) {
            log("error", `Failed to find canvas: ${JSON.stringify(findError)}`);
            return internalServerError(res);
        }

        if (!canvas) return notFound(res);

        if (data.collaboratorIds.some((id) => id.equals(userId))) {
            return badRequest(res);
        }

        const [updateResult, updateError] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).updateOne(
                { _id: new ObjectId(canvasId), ownerId: userId },
                {
                    $set: {
                        name: data.name,
                        collaboratorIds: data.collaboratorIds,
                        viewerIds: data.viewerIds,
                        lastModifiedAt: new Date(),
                    },
                },
            ),
        );

        if (updateError || updateResult.matchedCount === 0) {
            log("error", `Failed to update canvas details: ${JSON.stringify(updateError)}`);
            return internalServerError(res);
        }

        res.status(200).json({ success: true });
    });

    router.get("/:id", async (req, res) => {
        const userId = getUserIdFromRequest(req);
        if (!userId) return unauthorized(res);

        const canvasId = req.params.id;

        if (!ObjectId.isValid(canvasId)) return badRequest(res);

        const [canvas, findError] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).findOne({
                _id: new ObjectId(canvasId),
                $or: [{ ownerId: userId }, { collaboratorIds: userId }, { viewerIds: userId }],
            }),
        );

        if (findError) {
            log("error", `Failed to find canvas: ${JSON.stringify(findError)}`);
            return internalServerError(res);
        }

        if (!canvas) return notFound(res);

        const [zipped, zipError] = await tryCatch(gzipAsync(Buffer.from(JSON.stringify(canvas.data), "utf-8")));

        if (zipError) {
            log("error", `Failed to gzip canvas data: ${JSON.stringify(zipError)}`);
            return internalServerError(res);
        }

        res.status(200).set("Content-Encoding", "gzip").send(zipped);
    });

    router.put("/data/:id", async (req, res) => {
        const userId = getUserIdFromRequest(req);
        if (!userId) return unauthorized(res);

        const canvasId = req.params.id;

        if (!ObjectId.isValid(canvasId)) return badRequest(res);

        const data = canvasDataSchema.safeParse(req.body);

        if (!data.success) return badRequest(res);

        const [result, error] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).updateOne(
                {
                    _id: new ObjectId(canvasId),
                    $or: [{ ownerId: userId }, { collaboratorIds: userId }],
                },
                {
                    $set: {
                        data: data.data,
                        lastModifiedAt: new Date(),
                    },
                },
            ),
        );

        if (error) {
            log("error", `Failed to update canvas data: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        if (result.matchedCount === 0) return notFound(res);

        res.status(200).json({ success: true });
    });

    return router;
}
