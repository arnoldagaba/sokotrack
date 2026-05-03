import { z } from "zod";

const DEFAULT_USER_LIST_LIMIT = 10;
const DEFAULT_USER_LIST_OFFSET = 0;
const MIN_PASSWORD_LENGTH = 8;

export const adminRoleSchema = z.enum(["admin", "manager", "staff"]);

export const listUsersInputSchema = z.object({
    limit: z.number().int().min(0).default(DEFAULT_USER_LIST_LIMIT),
    offset: z.number().int().min(0).default(DEFAULT_USER_LIST_OFFSET),
    search: z.string().optional(),
});

export const adminUserIdInputSchema = z.object({
    userId: z.string().min(1, "User id is required"),
});

export const createAdminUserInputSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(80, "Name must be 80 characters or fewer"),
    email: z.email("Enter a valid email address"),
    role: adminRoleSchema.default("staff"),
    password: z
        .string()
        .min(
            MIN_PASSWORD_LENGTH,
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
        ),
});

export type CreateAdminUserInput = z.infer<typeof createAdminUserInputSchema>;
