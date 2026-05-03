import type { Role } from "#/lib/permissions.ts";

const whitespacePattern = /\s+/;

const roleLabels: Record<Role, string> = {
    admin: "Admin",
    manager: "Manager",
    staff: "Staff",
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
});

const parseAdminRole = (role: string | null | undefined): Role | undefined => {
    if (role === "admin" || role === "manager" || role === "staff") {
        return role;
    }
};

const normalizeAdminRole = (role: string | null | undefined): Role =>
    parseAdminRole(role) ?? "staff";

const getAdminRoleLabel = (role: string | null | undefined) =>
    roleLabels[normalizeAdminRole(role)];

const formatAdminDate = (value: Date | string | null | undefined) => {
    if (!value) {
        return "Not available";
    }

    const date = value instanceof Date ? value : new Date(value);

    return dateTimeFormatter.format(date);
};

const formatAdminDateOnly = (value: Date | string | null | undefined) => {
    if (!value) {
        return "Not available";
    }

    const date = value instanceof Date ? value : new Date(value);

    return dateFormatter.format(date);
};

const getUserInitials = (
    name: string | null | undefined,
    email: string | null | undefined
) => {
    const source = name?.trim() || email?.trim() || "User";

    return source
        .split(whitespacePattern)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join("");
};

export {
    formatAdminDate,
    formatAdminDateOnly,
    getAdminRoleLabel,
    getUserInitials,
    normalizeAdminRole,
    parseAdminRole,
};
