import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { env } from "./env.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import { join } from "node:path";
import { logger } from "./lib/logger.js";
import { authenticationRouter } from "./router/authentication.js";
import { canvasRouter } from "./router/canvas.js";
import { userRouter } from "./router/user.js";
import { gzipMiddleware } from "./middleware/gzip.js";
import { roleMiddleware } from "./middleware/role.js";
import { managementRouter } from "./router/management.js";

const log = logger({
    name: "server",
});

const app = express();

app.use(
    cors({
        origin: env.CORS_ORIGINS,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        optionsSuccessStatus: 204,
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
        credentials: true,
    }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(gzipMiddleware);
app.use(express.json({ limit: "5mb" }));

app.use(authMiddleware);

app.use("/api/authentication", authenticationRouter());
app.use("/api/canvas", canvasRouter());
app.use("/api/user", userRouter());

app.use(roleMiddleware);

app.use("/api/management", managementRouter());

app.use(express.static(env.STATIC_DIR_PATH));
app.use((req, res) => {
    if (req.method === "GET") {
        res.sendFile(join(env.STATIC_DIR_PATH, "index.html"));
    }
});

const server = createServer(app);
server.listen(env.PORT, () => {
    log("info", `Server is running on port http://0.0.0.0:${env.PORT}`);
});
