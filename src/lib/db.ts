import { PrismaPg } from "@prisma/adapter-pg";
import { serverEnv } from "#/env/server.ts";
import { PrismaClient } from "#/generated/prisma/client.ts";

const adapter = new PrismaPg({
    connectionString: serverEnv.DATABASE_URL,
});

declare global {
    var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (serverEnv.NODE_ENV !== "production") {
    globalThis.__prisma = prisma;
}
