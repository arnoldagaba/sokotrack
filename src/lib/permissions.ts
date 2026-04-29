import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements,

    // Catalog resources
    product: ["create", "read", "update", "delete", "manage-pricing"],
    category: ["create", "read", "update", "delete"],
    supplier: ["create", "read", "update", "delete"],
    warehouse: ["create", "read", "update", "delete"],

    // Inventory state
    "stock-level": ["read"],
    "stock-movement": ["create", "read"],
    "purchase-order": [
        "create",
        "read",
        "update",
        "submit",
        "accept",
        "reject",
        "cancel",
        "receive",
    ],
    "stock-adjustment": ["create", "read", "approve", "reject"],
    transfer: ["create", "read", "approve"],
    report: ["read-operational", "read-financial", "export"],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
    ...adminAc.statements,
    product: ["create", "read", "update", "delete", "manage-pricing"],
    category: ["create", "read", "update", "delete"],
    supplier: ["create", "read", "update", "delete"],
    warehouse: ["create", "read", "update", "delete"],
    "stock-level": ["read"],
    "stock-movement": ["create", "read"],
    "purchase-order": [
        "create",
        "read",
        "update",
        "submit",
        "accept",
        "reject",
        "cancel",
        "receive",
    ],
    "stock-adjustment": ["create", "read", "approve", "reject"],
    transfer: ["create", "read", "approve"],
    report: ["read-operational", "read-financial", "export"],
});

export const managerRole = ac.newRole({
    product: ["create", "read", "update", "delete", "manage-pricing"],
    category: ["create", "read", "update", "delete"],
    supplier: ["create", "read", "update", "delete"],
    warehouse: ["create", "read", "update", "delete"],
    "stock-level": ["read"],
    "stock-movement": ["create", "read"],
    "purchase-order": [
        "create",
        "read",
        "update",
        "submit",
        "accept",
        "reject",
        "cancel",
        "receive",
    ],
    "stock-adjustment": ["create", "read", "approve", "reject"],
    transfer: ["create", "read", "approve"],
    report: ["read-operational", "read-financial", "export"],
});

export const staffRole = ac.newRole({
    product: ["read"],
    category: ["read"],
    supplier: ["read"],
    warehouse: ["read"],
    "stock-level": ["read"],
    "stock-movement": ["create", "read"],
    "purchase-order": ["create", "read", "update", "submit", "receive"],
    "stock-adjustment": ["create", "read"],
    transfer: ["create", "read"],
    report: ["read-operational"],
});

export const roles = {
    admin: adminRole,
    manager: managerRole,
    staff: staffRole,
} as const;

export type Role = keyof typeof roles;
