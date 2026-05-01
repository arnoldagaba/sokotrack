import toast from "react-hot-toast";
import type { User } from "#/lib/auth.ts";
import { authClient } from "#/lib/auth-client.ts";
import type { getRouter } from "#/router.tsx";

const handleUserSessionsRevoke = async (
    userId: string,
    router: ReturnType<typeof getRouter>
) => {
    await authClient.admin.revokeUserSessions({ userId });
    router.invalidate();
};

const handleUserRemoval = async (userId: string, user: User) => {
    const currentUser = user.id;
    if (currentUser === userId) {
        return toast.error("You cannot impersonate yourself.");
    }

    await authClient.admin.removeUser({ userId });
};

const handleUserImpersonation = async (userId: string, user: User) => {
    const currentUser = user.id;
    if (currentUser === userId) {
        return toast.error("You cannot impersonate yourself.");
    }

    await authClient.admin.impersonateUser({ userId });
};

const handleUserBan = async (userId: string, user: User) => {
    const currentUser = user.id;
    if (currentUser === userId) {
        return toast.error("You cannot ban yourself.");
    }

    await authClient.admin.banUser({ userId });
};

export {
    handleUserBan,
    handleUserImpersonation,
    handleUserRemoval,
    handleUserSessionsRevoke,
};
