import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/lib/auth.ts";
import {
    changePasswordSchema,
    updateProfileSchema,
} from "../schema/index.ts";

const getAuthContext = async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return { headers, session };
};

const requireAuthContext = async () => {
    const { headers, session } = await getAuthContext();

    if (!session) {
        throw redirect({ to: "/login" });
    }

    return { headers, session };
};

const ensureNotImpersonating = (impersonatedBy: string | null | undefined) => {
    if (impersonatedBy) {
        throw new Error(
            "Stop impersonation before changing this account's settings."
        );
    }
};

export const getSession = createServerFn({ method: "GET" }).handler(
    async () => {
        const { session } = await getAuthContext();

        return { session };
    }
);

export const updateCurrentUserProfile = createServerFn({ method: "POST" })
    .inputValidator(updateProfileSchema)
    .handler(async ({ data }) => {
        const { headers, session } = await requireAuthContext();

        ensureNotImpersonating(session.session.impersonatedBy);

        await auth.api.updateUser({
            body: {
                name: data.name,
            },
            headers,
        });

        return { status: true };
    });

export const changeCurrentUserPassword = createServerFn({ method: "POST" })
    .inputValidator(changePasswordSchema)
    .handler(async ({ data }) => {
        const { headers, session } = await requireAuthContext();

        ensureNotImpersonating(session.session.impersonatedBy);

        await auth.api.changePassword({
            body: {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                revokeOtherSessions: data.revokeOtherSessions,
            },
            headers,
        });

        return { status: true };
    });

export const listCurrentUserSessions = createServerFn({ method: "GET" }).handler(
    async () => {
        const { headers, session } = await requireAuthContext();
        const currentToken = session.session.token;
        const sessions = await auth.api.listSessions({
            headers,
        });

        const sortedSessions = [...sessions].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );

        return {
            sessions: sortedSessions.map((accountSession) => ({
                createdAt: accountSession.createdAt,
                expiresAt: accountSession.expiresAt,
                id: accountSession.id,
                ipAddress: accountSession.ipAddress ?? null,
                isCurrent: accountSession.token === currentToken,
                updatedAt: accountSession.updatedAt,
                userAgent: accountSession.userAgent ?? null,
            })),
        };
    }
);

export const revokeOtherCurrentUserSessions = createServerFn({
    method: "POST",
}).handler(async () => {
    const { headers, session } = await requireAuthContext();

    ensureNotImpersonating(session.session.impersonatedBy);

    await auth.api.revokeOtherSessions({
        headers,
    });

    return { status: true };
});
