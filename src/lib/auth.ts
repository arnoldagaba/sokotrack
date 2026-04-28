import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins/admin";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/lib/db.ts";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            prompt: "select_account",
            clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
            clientId: serverEnv.GOOGLE_CLIENT_ID,
        },
    },
    plugins: [admin(), tanstackStartCookies()],
});
