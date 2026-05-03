/** biome-ignore-all lint/complexity/noUselessEscapeInRegex: Ignore as I consider it necessary */

import { z } from "zod";

const emailSchema = z.email({
    error: "Invalid email address",
});

const passwordPolicySchema = z
    .string({ error: "Password is required" })
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"|,.<>\/?]).{8,}$/,
        "Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character"
    );

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(4, "Name must be at least 4 characters long")
        .max(80, "Name must be 80 characters or fewer"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
    .object({
        confirmPassword: z.string().min(1, "Please confirm the new password"),
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: passwordPolicySchema,
        revokeOtherSessions: z.boolean(),
    })
    .refine((value) => value.newPassword !== value.currentPassword, {
        error: "New password must be different from your current password",
        path: ["newPassword"],
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
        error: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const registerSchema = z.object({
    name: z.string().trim().min(4, "Enter your full name"),
    email: emailSchema,
    password: passwordPolicySchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
