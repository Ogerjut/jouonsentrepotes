import { usersCollection } from '$lib/server/db/db.js';
import { TableFactory } from '$lib/server/games/TableFactory.js';
import { fail, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export const actions = {
  createTable : async({request, locals}) => {
      if (!locals.user){
        throw redirect(302, "/");
      }

      const user = await usersCollection.findOne({_id: new ObjectId(locals.user.id)})
      console.log("user : ", user)
      if (!user || user.currentTableId) {
        return fail(400, {reason : 'you are already in game'})
      }
      
      const formData = await request.formData();
      const tableFactory = new TableFactory("chess", formData)
      const res = await tableFactory.create()

      if (res.success && res.url) throw redirect(303, res.url)
      else throw new Error("an error occured during table creation")
  }
}