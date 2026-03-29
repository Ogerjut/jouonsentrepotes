
import { fail, redirect } from '@sveltejs/kit';
import { TableFactory } from '$lib/server/games/TableFactory';
import { usersCollection } from '$lib/server/db/db';
import { ObjectId } from 'mongodb';
// import { tableAfterRound, tableRound } from './const.js';

export const actions = {
  createTable : async({request, locals}) => {
        // const table = await tablesCollection.insertOne(tableAfterRound as TarotTableDB)
        // const table = await tablesCollection.insertOne(tableRound as TarotTableDB)
    if (!locals.user){
      throw redirect(302, "/");
    }

    const user = await usersCollection.findOne({_id: new ObjectId(locals.user.id)})
        
    if (!user || user.currentTableId) {
      return fail(400, {reason : 'you are already in game'})
      // throw redirect(303, "/")
    }
    const formData = await request.formData();
    const tableFactory = new TableFactory("tarot", formData)
    const res = await tableFactory.create()

    if (res.success && res.url) throw redirect(303, res.url)
    else throw new Error("an error occured during table creation")
  }
}

// dans game/[game] utiliser cette fonction et récup le gameType via request / formData
