
import { tablesCollection, userYamsStateCollection } from '$lib/server/db/db.js';
import { mapperDB } from '$lib/server/db/mappers.js';
import { getItems } from '$lib/server/games/yams/diceResultManager.js';
import type { Launches } from '$lib/types/games/yams.js';
import { redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb'

export async function load({params, locals}){
    if (!ObjectId.isValid(params.id)) {
        throw redirect(302, '/games/yams');
    }
    const table = await tablesCollection.findOne({_id : new ObjectId(params.id)})
    
    if (!table || !locals.user) {
        throw redirect(302, '/games/yams'); 
    }
    
    // const user = await usersCollection.findOne({_id: new ObjectId(locals.user.id)})
    // if (!user || user.currentTableId) {
    // throw redirect(302, "/games/yams");
    // }

    const doc = {
        id : new ObjectId(locals.user.id),
        username : locals.user.name,
        hasPlayed : false,
        listResults: getItems(), 
        launches: 3 as Launches, 
        finalScore: {
            score1 : 0, 
            hasBonus : false, 
            score2 : 0, 
            total : 0
        }
    }

    const userYamsState = await userYamsStateCollection.findOneAndUpdate(
    { id: doc.id },
    { $setOnInsert: doc },
    { upsert: true, returnDocument: "after" }
    );

    if (!userYamsState) throw new Error("state not found");
 
    return {
        table : mapperDB(table),
        userYamsState : {...userYamsState, id : userYamsState.id.toString(), _id : userYamsState._id.toString()}
    }
}