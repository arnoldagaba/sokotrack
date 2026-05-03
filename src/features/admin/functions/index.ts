import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.ts";
import { prisma } from "#/lib/db.ts";
import {
    adminUserIdInputSchema,
    createAdminUserInputSchema,
    listUsersInputSchema,
} from "../schema/index.ts";

const getAdminContext = async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    if (!session) {
        throw redirect({ to: "/login" });
    }

    if (session.user.role !== "admin") {
        throw redirect({ to: "/" });
    }

    return { headers, session };
};

export const requireAdmin = createServerFn({ method: "GET" }).handler(
    async () => {
        const { session } = await getAdminContext();

        return { session };
    }
);

export const listUsers = createServerFn({ method: "GET" })
    .inputValidator(listUsersInputSchema)
    .handler(async ({ data }) => {
        const { headers } = await getAdminContext();

        const { users, total } = await auth.api.listUsers({
            query: {
                limit: data.limit,
                offset: data.offset,
                searchField: "email",
                searchValue: data.search,
                searchOperator: "contains",
            },
            headers,
        });

        return { users, total };
    });

export const getAdminDashboardData = createServerFn({ method: "GET" }).handler(
    async () => {
        await getAdminContext();

        const [
            totalUsers,
            bannedUsers,
            adminUsers,
            managerUsers,
            staffUsers,
            recentUsers,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { banned: true } }),
            prisma.user.count({ where: { role: "admin" } }),
            prisma.user.count({ where: { role: "manager" } }),
            prisma.user.count({
                where: {
                    OR: [{ role: "staff" }, { role: null }],
                },
            }),
            prisma.user.findMany({
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    banned: true,
                    emailVerified: true,
                    createdAt: true,
                },
                take: 6,
            }),
        ]);

        return {
            recentUsers,
            summary: {
                activeUsers: totalUsers - bannedUsers,
                adminUsers,
                bannedUsers,
                managerUsers,
                staffUsers,
                totalUsers,
            },
        };
    }
);

export const getUserById = createServerFn({ method: "GET" })
    .inputValidator(adminUserIdInputSchema)
    .handler(async ({ data }) => {
        await getAdminContext();

        const user = await prisma.user.findUnique({
            select: {
                banned: true,
                banExpires: true,
                banReason: true,
                createdAt: true,
                email: true,
                emailVerified: true,
                id: true,
                image: true,
                name: true,
                role: true,
                updatedAt: true,
            },
            where: {
                id: data.userId,
            },
        });

        if (!user) {
            throw redirect({ to: "/admin/users" });
        }

        return user;
    });

export const listUserSessions = createServerFn({ method: "GET" })
    .inputValidator(adminUserIdInputSchema)
    .handler(async ({ data }) => {
        await getAdminContext();

        const sessions = await prisma.session.findMany({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                createdAt: true,
                expiresAt: true,
                id: true,
                impersonatedBy: true,
                ipAddress: true,
                token: true,
                updatedAt: true,
                userAgent: true,
            },
            where: {
                userId: data.userId,
            },
        });

        const impersonatorIds = [
            ...new Set(
                sessions
                    .map((session) => session.impersonatedBy)
                    .filter((value): value is string => Boolean(value))
            ),
        ];

        const impersonators =
            impersonatorIds.length === 0
                ? []
                : await prisma.user.findMany({
                      select: {
                          email: true,
                          id: true,
                          name: true,
                      },
                      where: {
                          id: {
                              in: impersonatorIds,
                          },
                      },
                  });

        const impersonatorsById = new Map(
            impersonators.map((user) => [user.id, user])
        );

        return {
            sessions: sessions.map((session) => ({
                ...session,
                impersonatedByUser: session.impersonatedBy
                    ? (impersonatorsById.get(session.impersonatedBy) ?? null)
                    : null,
            })),
        };
    });

export const createAdminUser = createServerFn({ method: "POST" })
    .inputValidator(createAdminUserInputSchema)
    .handler(async ({ data }) => {
        const { headers } = await getAdminContext();

        return auth.api.createUser({
            body: {
                email: data.email,
                name: data.name,
                password: data.password,
                role: data.role,
            },
            headers,
        });
    });
