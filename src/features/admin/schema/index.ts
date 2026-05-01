import { z } from "zod";

export const listUsersInputSchema = z.object({
    limit: z.number().int().default(10),
    offset: z.number().int().default(0),
    search: z.string().optional(),
});
