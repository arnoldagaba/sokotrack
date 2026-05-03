import toast from "react-hot-toast";
import type { User } from "#/lib/auth.ts";
import { authClient } from "#/lib/auth-client.ts";
import type { getRouter } from "#/router.tsx";

const handleUserSessionsRevoke = async (
    userId: string,
    router: ReturnType<typeof getRouter>
) => {
    try {
        await authClient.admin.revokeUserSessions({ userId });
        toast.success("Sessions revoked for user");
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to revoke sessions";
        toast.error(message);
        console.error("[Admin] Failed to revoke user sessions:", error);
        return;
    }
    router.invalidate();
};

const handleUserRemoval = async (
    userId: string,
    user: User,
    router: ReturnType<typeof getRouter>
) => {
    if (user.id === userId) {
        return toast.error("You cannot remove yourself.");
    }

    try {
        await authClient.admin.removeUser({ userId });
        toast.success("User removed successfully");
        await router.invalidate({ sync: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to remove user";
        toast.error(message);
        console.error("[Admin] Failed to remove user:", error);
    }
};

const handleUserImpersonation = async (userId: string, user: User) => {
    const currentUser = user.id;
    if (currentUser === userId) {
        return toast.error("You cannot impersonate yourself.");
    }

    try {
        toast.loading("Switching to user...", { duration: 1500 });
        await authClient.admin.impersonateUser({ userId });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to impersonate user";
        toast.error(message);
        console.error("[Admin] Failed to impersonate user:", error);
    }
};

const handleUserBan = async (
    userId: string,
    user: User,
    router: ReturnType<typeof getRouter>
) => {
    const currentUser = user.id;
    if (currentUser === userId) {
        return toast.error("You cannot ban yourself.");
    }

    try {
        await authClient.admin.banUser({ userId });
        toast.success("User ban status updated");
        router.invalidate();
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to ban user";
        toast.error(message);
        console.error("[Admin] Failed to ban user:", error);
    }
};

const handleBulkUserBan = async (
    userIds: string[],
    user: User,
    router: ReturnType<typeof getRouter>
) => {
    const currentUserId = user.id;
    const filteredIds = userIds.filter((id) => id !== currentUserId);

    if (filteredIds.length === 0) {
        return toast.error("No valid users to ban (you cannot ban yourself)");
    }

    try {
        const promises = filteredIds.map((id) =>
            authClient.admin.banUser({ userId: id })
        );
        await Promise.all(promises);
        toast.success(`Banned ${filteredIds.length} user(s)`);
        router.invalidate();
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to ban users";
        toast.error(message);
        console.error("[Admin] Failed to ban users:", error);
    }
};

const handleBulkUserUnban = async (
    userIds: string[],
    user: User,
    router: ReturnType<typeof getRouter>
) => {
    const currentUserId = user.id;
    const filteredIds = userIds.filter((id) => id !== currentUserId);

    if (filteredIds.length === 0) {
        return toast.error(
            "No valid users to unban (you cannot unban yourself)"
        );
    }

    try {
        const promises = filteredIds.map((id) =>
            authClient.admin.banUser({ userId: id })
        );
        await Promise.all(promises);
        toast.success(`Unbanned ${filteredIds.length} user(s)`);
        router.invalidate();
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to unban users";
        toast.error(message);
        console.error("[Admin] Failed to unban users:", error);
    }
};

const handleBulkUserRemoval = async (
    userIds: string[],
    user: User,
    router: ReturnType<typeof getRouter>
) => {
    const currentUserId = user.id;
    const filteredIds = userIds.filter((id) => id !== currentUserId);

    if (filteredIds.length === 0) {
        return toast.error(
            "No valid users to remove (you cannot remove yourself)"
        );
    }

    try {
        const promises = filteredIds.map((id) =>
            authClient.admin.removeUser({ userId: id })
        );
        await Promise.all(promises);
        toast.success(`Removed ${filteredIds.length} user(s)`);
        router.invalidate({ sync: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to remove users";
        toast.error(message);
        console.error("[Admin] Failed to remove users:", error);
    }
};

const handleBulkUserSessionsRevoke = async (
    userIds: string[],
    router: ReturnType<typeof getRouter>
) => {
    try {
        const promises = userIds.map((id) =>
            authClient.admin.revokeUserSessions({ userId: id })
        );
        await Promise.all(promises);
        toast.success(`Revoked sessions for ${userIds.length} user(s)`);
        router.invalidate();
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Failed to revoke sessions";
        toast.error(message);
        console.error("[Admin] Failed to revoke user sessions:", error);
    }
};

export {
    handleBulkUserBan,
    handleBulkUserRemoval,
    handleBulkUserSessionsRevoke,
    handleBulkUserUnban,
    handleUserBan,
    handleUserImpersonation,
    handleUserRemoval,
    handleUserSessionsRevoke,
};
