import { createAuthClient } from "better-auth/svelte"
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins"
import type { auth } from "./auth";

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    // baseURL: "http://localhost:3000",
    plugins: [ 
        usernameClient(),
        inferAdditionalFields<typeof auth>()
    ]
})

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
  } = authClient;