import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { haveIBeenPwned, lastLoginMethod } from "better-auth/plugins";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/lib/db.ts";
import { ac, roles } from "./permissions.ts";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
    },
    socialProviders: {
        google: {
            prompt: "select_account",
            clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
            clientId: serverEnv.GOOGLE_CLIENT_ID,
            disableSignUp: true,
        },
    },
    plugins: [
        adminPlugin({
            ac,
            adminRoles: ["admin"],
            roles,
            defaultRole: "staff",
        }),
        lastLoginMethod(),
        haveIBeenPwned(),
        tanstackStartCookies(),
    ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
