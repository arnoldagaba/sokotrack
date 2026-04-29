import {
    adminClient,
    inferAdditionalFields,
    lastLoginMethodClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth.ts";

export const authClient = createAuthClient({
    plugins: [
        adminClient(),
        lastLoginMethodClient(),
        inferAdditionalFields<typeof auth>(),
    ],
});
