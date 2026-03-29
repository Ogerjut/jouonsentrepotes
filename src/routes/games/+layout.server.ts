import { usersCollection } from "$lib/server/db/db.js";
import { ObjectId } from "mongodb";
import type { LayoutServerLoad } from "./$types.js";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({ locals, params , url}) => {
  if (!locals.user) {
    throw redirect(302, "/");
  }

  const user = await usersCollection.findOne({
    _id: new ObjectId(locals.user.id)
  });

  if (!user) {
    throw redirect(302, "/");
  }

  // if (user.currentTableId && user.currentTableId !== params.id) {
  //   throw redirect(302, url.pathname);
  // }

  return {};
};