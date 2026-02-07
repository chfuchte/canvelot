import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";
import { env } from "../env.js";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { db } from "../db/index.js";
import { logger } from "./logger.js";
import { ACCOUNT_COLLECTION, SESSION_COLLECTION, USER_COLLECTION, VERIFICATION_COLLECTION } from "../db/schema.js";

const log = logger({
    name: "better-auth",
    file: "auth.ts",
});

export const auth = betterAuth({
    appName: "Canvelot",
    database: mongodbAdapter(db, {
        client: db.client,
        transaction: true,
    }),
    plugins: [
        genericOAuth({
            config: [
                {
                    providerId: "oauth",
                    clientId: env.OAUTH_CLIENT_ID,
                    clientSecret: env.OAUTH_CLIENT_SECRET,
                    discoveryUrl: env.OAUTH_DISCOVERY_URL,
                    scopes: ["openid", "profile", "email"],
                    mapProfileToUser: (profile) => {
                        return {
                            name: profile.given_name ?? profile.name,
                            username: profile.preferred_username ?? profile.nickname,
                            role: profile.groups.find((group: string) => group.includes("Admin")) ? "admin" : "user",
                        };
                    },
                },
            ],
        }),
    ],
    user: {
        modelName: USER_COLLECTION,
        additionalFields: {
            username: {
                type: "string",
                required: true,
            },
            role: {
                type: ["admin", "user"],
                required: true,
                defaultValue: "user",
            },
        },
    },
    account: {
        modelName: ACCOUNT_COLLECTION,
    },
    session: {
        modelName: SESSION_COLLECTION,
    },
    verification: {
        modelName: VERIFICATION_COLLECTION,
    },
    secret: env.AUTH_SECRET,
    logger: {
        log: (level, message, ...args) => {
            log(level, `${message} ${JSON.stringify(args)}`);
        },
    },
    baseURL: env.BASE_URL,
    trustedOrigins: [env.BASE_URL, ...env.CORS_ORIGINS, new URL(env.OAUTH_DISCOVERY_URL).origin],
});
