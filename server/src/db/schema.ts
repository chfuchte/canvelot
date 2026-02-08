import type { ObjectId } from "mongodb";
import type { BinaryFiles, AppState } from "@excalidraw/excalidraw/types";
import type { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export const CANVAS_COLLECTION = "canvas";

export type CanvasDocument = {
    name: string;
    lastModifiedAt: Date;
    ownerId: ObjectId;
    collaboratorIds: ObjectId[];
    data: {
        elements: NonDeletedExcalidrawElement[];
        appState: AppState;
        files: BinaryFiles;
    } | null;
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
