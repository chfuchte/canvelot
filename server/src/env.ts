import { z } from "zod";

const envSchema = z.object({
    BASE_URL: z.url("BASE_URL must be a valid URL"),
    PORT: z.string().default("8080").transform(Number),
    MONGO_URI: z.string().nonempty("MONGO_URI is required"),
    MONGO_DB_NAME: z.string().nonempty("MONGO_DB_NAME is required"),
    CORS_ORIGINS: z.string().transform((val) => val.split(",").map((origin) => origin.trim())),
    STATIC_DIR_PATH: z.string().default("../static"),
    OAUTH_CLIENT_ID: z.string().nonempty("OAUTH_CLIENT_ID is required"),
    OAUTH_CLIENT_SECRET: z.string().nonempty("OAUTH_CLIENT_SECRET is required"),
    OAUTH_DISCOVERY_URL: z.url("OAUTH_DISCOVERY_URL must be a valid URL"),
    OAUTH_LOGOUT_REDIRECT_URL: z.url("OAUTH_LOGOUT_REDIRECT_URL must be a valid URL"),
    AUTH_SECRET: z.string().nonempty("AUTH_SECRET is required"),
});

export const env = envSchema.parse(process.env);
