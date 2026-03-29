
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
// import { ObjectId } from "mongodb";
// import { sendEmail } from "./email/email.js";
// import { verificationEmail } from "./email/verification-email.js";
// import { resetPassword } from "./email/reset-password.js";

import type { BetterAuthOptions } from "better-auth";
import { ObjectId } from "mongodb";
import { db, userStatsCollection } from "../db/db";
import type { UserStatsDB } from "$lib/types/db/userStatsDB";

export const baseAuthConfig = {
  secret:  process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  
  database: mongodbAdapter(db),
  
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 64,
    requireEmailVerification: true,

    // sendResetPassword: async ({user, url, token}, request) => {
    //   await sendEmail({
    //     to: user.email,
    //     subject: "Reset your password",
    //     text: `Click the link to reset your password: ${url}`,
    //     html : resetPassword(url)
    //   });
    // },
  
  },

  plugins: [
    username({
      minUsernameLength: 2
    }),
  ],

  // emailVerification: {
	// 	sendVerificationEmail: async ({ user, url, token }) => {
	// 		await sendEmail({
  //       to : user.email,
  //       subject : "Verify your email adress",
  //       text : `click the link to verify your email ${url}`,
  //       html : verificationEmail(url)
  //     })
	// 	},
	// 	sendOnSignUp: true,
	// 	autoSignInAfterVerification: true,
	// 	expiresIn: 3600 // 1 hour
	// },

  user: {
    changeEmail : {
      enabled : true,
    },

    deleteUser: {
      enabled : true,
    },

    additionalFields: {
      role: {type: "string", defaultValue: "user", input: false},
    }
  },

  databaseHooks: {
    user: {
      create: {
        async before(user) {
            return {
                data: {
                    ...user,
                    
                  }
            }
        },

        async after(user) {
          await userStatsCollection.insertOne({
            id : new ObjectId(user.id),
            username : user.name,
            tarot: { victories: 0, games: 0, score: 0, highestScore: 0 },
            belote: { victories: 0, games: 0, score: 0, highestScore: 0 },
            yams: { victories: 0, games: 0, score: 0, highestScore: 0 },
            chess: { victories: 0, games: 0, score: 0, highestScore: 0 },
            createdAt: new Date(),
            updatedAt: new Date()
          } as unknown as UserStatsDB)
        }
      },

      delete : {
        async after(user) {
          await userStatsCollection.deleteOne({ id : new ObjectId(user.id) });
      }
    }
    }
  }
} satisfies BetterAuthOptions;
