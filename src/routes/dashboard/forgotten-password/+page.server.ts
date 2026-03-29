import { auth } from "$lib/server/auth/auth.js";
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
    sendLinkByEmail : async ({request}) => {
      const formData = await request.formData();
      const email = formData.get('email')?.toString();

      if (typeof email !== "string"){
        return fail(400, { error: "Error with your email" });
      }
    
      try {
        const data = await auth.api.requestPasswordReset({
            body: {
                email: email,
                redirectTo: "/dashboard/reset-password",
            },
        });

        if (data.status){
          return {success : true, message : 'Lien envoyé par e-mail'}
        } else {
          throw new Error(`Erreur( ${data.status}) lors de l'envoie du mail`)
        }
      } catch (err) {
        if (err instanceof Error) return fail(400, { error : err.message });
      }
      
    }
  };