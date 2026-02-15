import { Router } from "express";
import { logger } from "../lib/logger.js";
import {
    badRequest,
    forbidden,
    getUserFromRequest,
    internalServerError,
    notFound,
    tryCatch,
    unauthorized,
} from "../lib/utils.js";
import { db } from "../db/index.js";
import { CANVAS_COLLECTION, type CanvasDocument, USER_COLLECTION, type UserDocument } from "../db/schema.js";
import { ObjectId, type WithId } from "mongodb";

const log = logger({
    name: "router.management",
    file: "router/management.ts",
});

export function managementRouter() {
    const router = Router();

    router.get("/users", async (req, res) => {
        const user = getUserFromRequest(req);
        if (!user) return unauthorized(res);
        if (user.role !== "admin") return forbidden(res);

        const [users, error] = await tryCatch(
            db
                .collection<UserDocument>(USER_COLLECTION)
                .find()
                .project<WithId<Pick<UserDocument, "name" | "username" | "role">>>({
                    _id: true,
                    name: true,
                    username: true,
                    role: true,
                })
                .toArray(),
        );

        if (error) {
            log("error", `Failed to fetch canvases: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        return res.status(200).json(
            users.map((user) => ({
                id: user._id.toHexString(),
                name: user.name,
                username: user.username,
                role: user.role,
            })),
        );
    });

    router.delete("/users/:id", async (req, res) => {
        const user = getUserFromRequest(req);
        if (!user) return unauthorized(res);
        if (user.role !== "admin") return forbidden(res);

        const userId = req.params.id;

        if (!ObjectId.isValid(userId)) return badRequest(res);

        const [result, error] = await tryCatch(db.collection(USER_COLLECTION).deleteOne({ _id: new ObjectId(userId) }));

        if (error) {
            log("error", `Failed to delete user: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        if (result.deletedCount === 0) {
            return notFound(res);
        }

        return res.status(200).json({ message: "User deleted successfully" });
    });

    router.get("/canvas", async (req, res) => {
        const user = getUserFromRequest(req);
        if (!user) return unauthorized(res);
        if (user.role !== "admin") return forbidden(res);

        const [canvases, error] = await tryCatch(
            db
                .collection<CanvasDocument>(CANVAS_COLLECTION)
                .aggregate<
                    WithId<Pick<CanvasDocument, "name" | "ownerId" | "lastModifiedAt">> & {
                        owner: Pick<UserDocument, "username">;
                    }
                >([
                    {
                        $lookup: {
                            from: USER_COLLECTION,
                            localField: "ownerId",
                            foreignField: "_id",
                            as: "owner",
                        },
                    },
                    {
                        $unwind: "$owner",
                    },
                    {
                        $project: {
                            name: true,
                            ownerId: true,
                            lastModifiedAt: true,
                            owner: {
                                username: true,
                            },
                        },
                    },
                ])
                .toArray(),
        );

        if (error) {
            log("error", `Failed to fetch canvases: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        return res.status(200).json(
            canvases.map((canvas) => ({
                id: canvas._id.toHexString(),
                name: canvas.name,
                lastModifiedAt: canvas.lastModifiedAt,
                owner: canvas.owner.username,
            })),
        );
    });

    router.delete("/canvas/:id", async (req, res) => {
        const user = getUserFromRequest(req);
        if (!user) return unauthorized(res);
        if (user.role !== "admin") return forbidden(res);

        const canvasId = req.params.id;

        if (!ObjectId.isValid(canvasId)) return badRequest(res);

        const [result, error] = await tryCatch(
            db.collection(CANVAS_COLLECTION).deleteOne({ _id: new ObjectId(canvasId) }),
        );

        if (error) {
            log("error", `Failed to delete canvas: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        if (result.deletedCount === 0) {
            return notFound(res);
        }

        return res.status(200).json({ message: "Canvas deleted successfully" });
    });

    router.put("/users/:id/role", async (req, res) => {
        const user = getUserFromRequest(req);
        if (!user) return unauthorized(res);
        if (user.role !== "admin") return forbidden(res);

        const userId = req.params.id;

        if (!ObjectId.isValid(userId)) return badRequest(res);

        const { role } = req.body;

        if (role !== "admin" && role !== "user") return badRequest(res);

        const [result, error] = await tryCatch(
            db.collection(USER_COLLECTION).updateOne({ _id: new ObjectId(userId) }, { $set: { role } }),
        );

        if (error) {
            log("error", `Failed to update user role: ${JSON.stringify(error)}`);
            return internalServerError(res);
        }

        if (result.matchedCount === 0) {
            return notFound(res);
        }

        return res.status(200).json({ message: "User role updated successfully" });
    });

    return router;
}
