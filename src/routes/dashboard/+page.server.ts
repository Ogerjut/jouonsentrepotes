import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types.js";
import { fail } from '@sveltejs/kit';
import { auth } from "$lib/server/auth/auth.js";
import { isValid } from "$lib/server/auth/auth-utils.js";
import { userStatsCollection } from "$lib/server/db/db.js";
import type { UserStats } from "$lib/types/user.js";
import { ObjectId } from "mongodb";


export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.session || !locals.user) {
        throw redirect(302, "/");
    }

    const userStatsRaw = await userStatsCollection.findOne({id : new ObjectId(locals.user.id) })
    console.log(userStatsRaw)
    if (!userStatsRaw){
      return {userStats : null}
    }
    const userStats : UserStats = {...userStatsRaw, id : userStatsRaw.id.toString(), _id : userStatsRaw._id.toString()}
    return {userStats}
} 

export const actions: Actions = {
  changePassword : async ({request}) => {
    const formData = await request.formData();
    const newPassword = formData.get('newPassword')?.toString();
    const newPassword2 = formData.get('newPassword2')?.toString();
    const password = formData.get('password')?.toString();

    if (typeof newPassword !== "string" || typeof password !== "string") {
        return fail(400, { error: "Error with new password or password" });
    }

    try {

        isValid(newPassword)
        if(newPassword !== newPassword2){
            throw new Error('Les mots de passe doivent être identiques !')
        }
  
    } catch (err) {
        if (err instanceof Error) return fail(400, { error : err.message });
    }

    try {
      await auth.api.changePassword({
        body: {
            newPassword: newPassword,
            currentPassword: password,
            revokeOtherSessions: true,
        },
        headers: request.headers,
      });
      return {success : true, message : 'Ton mot de passe a été changé'}
      
    } catch (err) {
        if (err instanceof Error) return fail(400, { error : err.message });
    }
    
  },

  changeEmail : async ({request})=>{
    const formData = await request.formData();
    const newEmail = formData.get('newEmail')?.toString();

    if (typeof newEmail !== "string") {
        return fail(400, { error: "Error with new email" });
    }

    try {
      await auth.api.changeEmail({
        body : {
          newEmail : newEmail,
          callbackURL: "/dashboard"
        },
        headers : request.headers
      })

      return {success : true, message : 'Ton  mail a été changé, vérifies ta boîte mail !'}

    } catch (err) {
        if (err instanceof Error) return fail(400, { error : err.message });
    }

  },

  deleteAccount : async ({request})=>{
    const formData = await request.formData();
    const password = formData.get('password')?.toString();

    if (typeof password !== "string") {
        return fail(400, { error: "Error with your password" });
    }

    try {
      await auth.api.deleteUser({
        body : {
          password: password,
          callbackURL : "/"
        },
        headers : request.headers
      })
      
      return {success : true, message : 'Compte supprimé, au revoir !'}

    } catch (err) {
        if (err instanceof Error) return fail(400, { error : err.message });
    }

  }
};