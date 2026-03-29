// src/routes/dashboard/+page.server.ts
import { isValid } from '$lib/server/auth/auth-utils.js';
import { auth } from '$lib/server/auth/auth.js';
import { fail, redirect } from '@sveltejs/kit';

export const load = ({ url }) => {
    const token = url.searchParams.get("token");
    if (!token) {
      throw redirect(302, "/login");
    }
    return { token };
};
  

export const actions = {
  resetPassword : async ({url, request}) => {
    const formData = await request.formData();
    const newPassword = formData.get('newPassword')?.toString();
    const newPassword2 = formData.get('newPassword2')?.toString();
    const token = url.searchParams.get("token")

    if (typeof newPassword !== "string" || typeof newPassword2 !== "string") {
        return fail(400, { error: "Error with new password or password" });
    }

    try {
        if (!token) {
            throw new Error("invalid token to reset password")
        }

        isValid(newPassword)

        if(newPassword !== newPassword2){
            throw new Error('Les mots de passe doivent être identiques !')
        }
        
        await auth.api.resetPassword({
            body: {
              newPassword,
              token
            }
          });
    
          return {
            success: true,
            message: "Ton mot de passe a été réinitialisé"
          };
  
    } catch (err) {
        if (err instanceof Error) return fail(400, { error : err.message });
    }

  }

};