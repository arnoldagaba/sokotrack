import {
    adminClient,
    inferAdditionalFields,
    lastLoginMethodClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth.ts";
import { ac, roles } from "./permissions.ts";

export const authClient = createAuthClient({
    plugins: [
        adminClient({ ac, roles }),
        lastLoginMethodClient(),
        inferAdditionalFields<typeof auth>(),
    ],
});
