import { z } from "zod";

const DEFAULT_USER_LIST_LIMIT = 10;
const DEFAULT_USER_LIST_OFFSET = 0;

export const listUsersInputSchema = z.object({
    limit: z.number().int().min(0).default(DEFAULT_USER_LIST_LIMIT),
    offset: z.number().int().min(0).default(DEFAULT_USER_LIST_OFFSET),
    search: z.string().optional(),
});
