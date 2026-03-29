import { fail, redirect, type Actions } from '@sveltejs/kit';
import {isValid} from "$lib/server/auth/auth-utils"
import { auth } from '$lib/server/auth/auth';


export const actions : Actions = {
    login : async({request}) => {
        const formData = await request.formData();
        const username = formData.get('username')?.toString();
        const password = formData.get('password')?.toString();

        const normalizedUsername = username?.toLowerCase().trim()

        if (typeof normalizedUsername !== "string" || typeof password !== "string") {
            return fail(400, { error: "Username or password missing" });
        }
            
        try {
            await auth.api.signInUsername({
                body: {
                    username : normalizedUsername,
                    password,
                    callbackURL : "/"
                },
            });
            
            return {
                success: true,
                message: 'User successfully connected'
            };
            
        } catch (err) {
            if (err instanceof Error) return fail(400, { error : err.message });
            
        }
    },

    signup : async({request}) => {
        const formData = await request.formData();
        const email = formData.get('email')?.toString()
        const username = formData.get('username')?.toString();
        const password = formData.get('password')?.toString();
        const password2 = formData.get('password2')?.toString();
        const name = username

        if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string" ) {
            return fail(400, { error: "Username or password missing" });
        }

        try {
            
            isValid(password)
            if(password !== password2){
                throw new Error('Les mots de passe doivent être identiques !')
            }
        
        } catch (err) {
            if (err instanceof Error) return fail(400, { error : err.message });
        }

        try {
            const data = await auth.api.signUpEmail({
                body: {
                    email,
                    name,
                    password,
                    username
                }
            });

            if (data){
                await auth.api.sendVerificationEmail({
                    body : {
                        email : data.user.email,
                        callbackURL : "/"
                    }
                    
                })
            }

            return {
                success: true,
                message: 'Account created successfully'
            };
        } catch (err) {
            if (err instanceof Error) return fail(400, { error : err.message });
        }
    },

    signout: async ({ request }) => {
        try {
          await auth.api.signOut({
            headers: request.headers,
          });
    
            
        } catch (error) {
          console.error("Erreur déconnexion:", error);
        }
    
        throw redirect(302, "/");
      },





}