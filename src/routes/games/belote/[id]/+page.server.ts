import { tablesCollection, userBeloteStateCollection } from '$lib/server/db/db.js'
import { mapperDB } from '$lib/server/db/mappers.js';
import type { UserBeloteStateDB } from '$lib/types/db/beloteDB';
import { fail, redirect } from '@sveltejs/kit';
import {ObjectId} from 'mongodb'

export async function load({params, locals}){
  if (!ObjectId.isValid(params.id)) {
      throw redirect(302, '/games/belote');
  }
  const table = await tablesCollection.findOne({_id : new ObjectId(params.id)})
  
  if (!table || !locals.user) {
    throw redirect(302, '/games/belote'); 
  }

  const doc: Omit<UserBeloteStateDB, "_id"> = {
    id: new ObjectId(locals.user.id),
    username: locals.user.name,
    bid: null,
    hasBid: false,
    hand: [],
    hasTaken: false,
    cardsWon: [],
    declaredBelote : false,
    hasPlayed: false,
    playedCard: null
  }

  // const doc = getDoc(locals.user)

  const userBeloteState = await userBeloteStateCollection.findOneAndUpdate(
    { id: doc.id },
    { $setOnInsert: doc },
    { upsert: true, returnDocument: "after" }
  );

  if (!userBeloteState) throw new Error("state not found");

  return {
    table: mapperDB(table),
    userBeloteState: {
      ...userBeloteState,
      id: userBeloteState.id.toString(),
      _id: userBeloteState._id.toString()
    }
  };
}

export const actions = {
  bid : async({request}) => {
      const formData = await request.formData();
      const bid = Number(formData.get('bid'))
  
      try {
        return {
            success: true,
            bid : bid,
          };

      } catch (err) {
        console.log(err)
          if (err instanceof Error) return fail(400, { error : err.message });
      }
  }

}
