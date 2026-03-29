import { redirect, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types.js";
import { msgCollection } from "$lib/server/db/db.js";
import type { ChatMessages } from "$lib/types/chat.js";
import type { ChatMessageDB } from "$lib/types/db/chatDB.js";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.session) {
        throw redirect(302, "/");
    }

    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const rawMessages = await msgCollection.find({date : {$gt: cutoff}}).toArray()
    const messages : ChatMessages = rawMessages.map(msg => ({...msg, _id : msg._id.toString()}))
    return {messages}
  
};

export const actions : Actions = {
    sendMessage : async ({request, locals}) => {
        const formData = await request.formData();
        const msg = formData.get('msg')?.toString()
        const fontColor = formData.get('color')?.toString()
        const user = locals?.user

        if (!user){
            return fail(403, {error : "No user"})
        }

        if (typeof msg !== "string" || typeof fontColor !== "string" ){
            return fail(403, {error : "Problem with msg or fontColor type"})
        }

        try {
            await msgCollection.insertOne({
                date : new Date(),
                author : user.name,
                content : msg,
                fontColor : fontColor

            } as ChatMessageDB)

            const rawMessages = await msgCollection.find().toArray()
            const messages : ChatMessages = rawMessages.map(msg => ({...msg, _id : msg._id.toString()}))
        
            return  {success : true, messages}
        } catch (error) {
            if (error instanceof Error) return fail(400, {error : error.message})
        }
    }
}