import type { ObjectId } from "mongodb";

export const CANVAS_COLLECTION = "canvas";

export type CanvasDocument = {
    name: string;
    lastModifiedAt: Date;
    ownerId: ObjectId;
    sharedWithIds: ObjectId[];
    data: Record<string, unknown> | null;
};

export const USER_COLLECTION = "user";

export type UserDocument = {
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    role: UserRole;
};

export type UserRole = "admin" | "user";

export const ACCOUNT_COLLECTION = "account";
export const SESSION_COLLECTION = "session";
export const VERIFICATION_COLLECTION = "verification";
