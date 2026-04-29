import { z } from "zod";

const emailSchema = z.email({ error: "Invalid email address" });
const passwordPolicySchema = z
    .string()
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "Password must be at least 8 characters long and include an uppercase, lowercase, number, and special character"
    );

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    name: z.string().trim().min(4, "Enter your full name"),
    email: emailSchema,
    password: passwordPolicySchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;