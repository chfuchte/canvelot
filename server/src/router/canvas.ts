import { Router } from "express";
import { db } from "../db/index.js";
import { CANVAS_COLLECTION, USER_COLLECTION, type CanvasDocument, type UserDocument } from "../db/schema.js";
import { ObjectId, type WithId } from "mongodb";
import { canvasDataSchema, canvasMetaSchema } from "../schema/canvas.js";
import { tryCatch } from "../lib/utils.js";
import { logger } from "../lib/logger.js";

const log = logger({
    name: "router.canvas",
    file: "router/canvas.ts",
});

export function canvasRouter() {
    const router = Router();

    router.get("/", async (req, res) => {
        const session = req.session;

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!ObjectId.isValid(session.user.id)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = ObjectId.createFromHexString(session.user.id);

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
                    is_shared: !canvas.ownerId.equals(userId),
                    lastModifiedAt: canvas.lastModifiedAt,
                };
            }),
        );
    });

    router.get("/:id", async (req, res) => {
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400).json({ error: "Invalid canvas ID" });
            return;
        }

        const canvasId = ObjectId.createFromHexString(req.params.id);

        const session = req.session;

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!ObjectId.isValid(session.user.id)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = ObjectId.createFromHexString(session.user.id);

        const [result, error] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).findOne({
                _id: canvasId,
                $or: [{ ownerId: userId }, { sharedWithIds: userId }],
            }),
        );

        if (error) {
            log("error", `Failed to fetch canvas with ID ${canvasId.toHexString()}: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        if (!result) {
            res.status(404).json({ error: "Canvas not found" });
            return;
        }

        res.status(200).json({
            id: result._id.toHexString(),
            name: result.name,
            data: result.data,
        });
    });

    router.post("/", async (req, res) => {
        const session = req.session;

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!ObjectId.isValid(session.user.id)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = ObjectId.createFromHexString(session.user.id);

        const [inserted, error] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).insertOne({
                name: "Untitled Canvas",
                lastModifiedAt: new Date(),
                ownerId: userId,
                sharedWithIds: [],
                data: null,
            }),
        );

        if (error) {
            log("error", `Failed to create canvas: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        res.status(200).json({ id: inserted.insertedId.toHexString() });
    });

    router.put("/", async (req, res) => {
        // TODO: the data will eventually be too large to we have to handle this differently (not via JSON body)
        const { success, data: canvas } = canvasDataSchema.safeParse(req.body);

        if (!success) {
            res.status(400).json({ error: "Invalid canvas data" });
            return;
        }

        const session = req.session;

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!ObjectId.isValid(session.user.id)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = ObjectId.createFromHexString(session.user.id);

        const [_, error] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).findOneAndUpdate(
                { _id: canvas.id, $or: [{ ownerId: userId }, { sharedWithIds: userId }] },
                {
                    $set: {
                        data: canvas.data,
                        lastModifiedAt: new Date(),
                    },
                },
            ),
        );

        if (error) {
            log("error", `Failed to update canvas with ID ${canvas.id.toHexString()}: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        res.status(200).json({ message: "Canvas data updated successfully" });
    });

    router.patch("/", async (req, res) => {
        const { success, data } = canvasMetaSchema.safeParse(req.body);

        if (!success) {
            res.status(400).json({ error: "Invalid canvas data" });
            return;
        }

        const updateData: Partial<CanvasDocument> = Object.fromEntries(
            Object.entries(data).filter(([_key, value]) => value !== undefined),
        );

        const session = req.session;

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!ObjectId.isValid(session.user.id)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = ObjectId.createFromHexString(session.user.id);

        const [result, error] = await tryCatch(
            db
                .collection<CanvasDocument>(CANVAS_COLLECTION)
                .updateOne({ _id: data.id, ownerId: userId }, { $set: { lastModifiedAt: new Date(), ...updateData } }),
        );

        if (error) {
            log("error", `Failed to update canvas meta with ID ${data.id.toHexString()}: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        if (result.matchedCount === 0) {
            res.status(404).json({ error: "Canvas not found or you do not have permission to update it" });
            return;
        }

        res.status(200).json({ message: "Canvas meta updated successfully" });
    });

    router.delete("/:id", async (req, res) => {
        if (!ObjectId.isValid(req.params.id)) {
            res.status(400).json({ error: "Invalid canvas ID" });
            return;
        }

        const canvasId = ObjectId.createFromHexString(req.params.id);

        const session = req.session;

        if (!session) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        if (!ObjectId.isValid(session.user.id)) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const userId = ObjectId.createFromHexString(session.user.id);

        const [result, error] = await tryCatch(
            db.collection<CanvasDocument>(CANVAS_COLLECTION).deleteOne({ _id: canvasId, ownerId: userId }),
        );

        if (error) {
            log("error", `Failed to delete canvas with ID ${canvasId.toHexString()}: ${JSON.stringify(error)}`);
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }

        if (result.deletedCount === 0) {
            res.status(404).json({ error: "Canvas not found or you do not have permission to delete it" });
            return;
        }

        res.status(200).json({ message: "Canvas deleted successfully" });
    });

    return router;
}
