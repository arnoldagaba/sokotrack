import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
    server: {
        DATABASE_URL: z.url(),
        NODE_ENV: z
            .enum(["development", "production", "test"])
            .default("development"),
        GOOGLE_CLIENT_SECRET: z.string(),
        GOOGLE_CLIENT_ID: z.string(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
