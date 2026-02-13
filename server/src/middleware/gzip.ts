import getRawBody from "raw-body";
import type { NextFunction, Request, Response } from "express";
import { internalServerError, tryCatch } from "../lib/utils.js";
import { gunzipAsync } from "../lib/gzip.js";

export async function gzipMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.headers["content-encoding"] !== "gzip") {
        return next();
    }

    const raw = await getRawBody(req, {
        length: req.headers["content-length"],
        limit: "5mb",
    });

    const [unzipped, unzipError] = await tryCatch(gunzipAsync(raw));

    if (unzipError) {
        console.error("Failed to gunzip request body", unzipError);
        return internalServerError(res);
    }

    try {
        const string = unzipped.toString("utf-8");
        req.body = JSON.parse(string);
    } catch (err) {
        console.error("Failed to parse JSON from unzipped body", err);
        return internalServerError(res);
    }

    next();
}
