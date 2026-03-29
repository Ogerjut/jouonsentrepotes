// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server"; 
import { baseAuthConfig } from "./auth-config";

// ✅ Auth avec plugin SvelteKit (pour routes HTTP)
export const auth = betterAuth({
  ...baseAuthConfig,
  plugins: [
    ...baseAuthConfig.plugins,
    sveltekitCookies(getRequestEvent) 
  ]
});