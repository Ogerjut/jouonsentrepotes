import { tablesCollection, userTarotStateCollection } from '$lib/server/db/db.js'
import { mapperDB } from '$lib/server/db/mappers.js';
import type { UserTarotStateDB } from '$lib/types/db/tarotDB.js';
import { fail, redirect } from '@sveltejs/kit';
import {ObjectId} from 'mongodb'

export async function load({params, locals}){
  if (!ObjectId.isValid(params.id)) {
      throw redirect(302, '/games/tarot');
  }
  const table = await tablesCollection.findOne({_id : new ObjectId(params.id)})
  
  if (!table || !locals.user) {
    throw redirect(302, '/games/tarot'); 
  }

  const doc: UserTarotStateDB = {
    id: new ObjectId(locals.user.id),
    username: locals.user.name,
    bid: null,
    hasBid: false,
    hand: [],
    hasTaken: false,
    cardsWon: [],
    declaredSlam: false,
    declaredHandful: null,
    score: 0,
    hasPlayed: false,
    hasWin: false,
    contrat: null,
    playedCard: null
  } as unknown as UserTarotStateDB;

  // const doc = getDoc(locals.user)

  const userTarotState = await userTarotStateCollection.findOneAndUpdate(
    { id: doc.id },
    { $setOnInsert: doc },
    { upsert: true, returnDocument: "after" }
  );

  if (!userTarotState) throw new Error("state not found");

  return {
    table: mapperDB(table),
    userTarotState: {
      ...userTarotState,
      id: userTarotState.id.toString(),
      _id: userTarotState._id.toString()
    }
  };
}

export const actions = {
  bet : async({request}) => {
      const formData = await request.formData();
      const bet = Number(formData.get('bet'))
  
      try {
        return {
            success: true,
            bet : bet,
          };

      } catch (err) {
        console.log(err)
          if (err instanceof Error) return fail(400, { error : err.message });
      }
  }

}
