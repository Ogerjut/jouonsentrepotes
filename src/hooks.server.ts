import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { auth } from "$lib/server/auth/auth";

/** @type {import('@sveltejs/kit').Handle} */

export async function handle ({ event, resolve }) {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  
  event.locals.session = session?.session ?? null;
  event.locals.user = session?.user ?? null
  
  return svelteKitHandler({ event, resolve, auth, building });
}