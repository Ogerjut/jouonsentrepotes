import { betterAuth } from "better-auth";
import { baseAuthConfig } from "./auth-config";

// ✅ Auth sans plugin SvelteKit (pour Node pur)
export const authServer = betterAuth(baseAuthConfig);