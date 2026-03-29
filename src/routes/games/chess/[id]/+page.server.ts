import { tablesCollection, userChessStateCollection } from '$lib/server/db/db.js'
import { mapperDB } from '$lib/server/db/mappers.js';
import type { UserChessStateDB } from '$lib/types/db/chessDB';
import { redirect } from '@sveltejs/kit';
import {ObjectId} from 'mongodb'

export async function load({params, locals}){
  if (!ObjectId.isValid(params.id)) {
      throw redirect(302, '/games/chess');
  }
  const table = await tablesCollection.findOne({_id : new ObjectId(params.id)})
  
  if (!table || !locals.user) {
    throw redirect(302, '/games/chess'); 
  }

  const doc: Omit<UserChessStateDB, "_id"> = {
    id: new ObjectId(locals.user.id),
    username: locals.user.name,
    team : null,
  }

  const userChessState = await userChessStateCollection.findOneAndUpdate(
    { id: doc.id },
    { $setOnInsert: doc },
    { upsert: true, returnDocument: "after" }
  );

  if (!userChessState) throw new Error("state not found");

  return {
    table: mapperDB(table),
    userChessState: {
      ...userChessState,
      id: userChessState.id.toString(),
      _id: userChessState._id.toString()
    }
  };
}

