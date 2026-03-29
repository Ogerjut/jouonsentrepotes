import type { UserYamsStateDB } from "$lib/types/db/yamsDB";
import type { UserYamsState } from "$lib/types/games/yams";
import type { User } from "$lib/types/user";
import { ObjectId, type Collection } from "mongodb";

// faire une classe mère avec mapper, mapper[], findOne,  find, updtate, deleteOne, deleteMany.... 

export class YamsRepo{
    constructor(
        private collection : Collection<UserYamsStateDB>
    ){}

    private idsToObjectIds(ids : User["id"][]){
        return ids.map(id => new ObjectId(id));
    }

    async getGameState(userId : User["id"]) : Promise<UserYamsState> {
        const stateDB = await this.collection.findOne({ id : new ObjectId(userId)})
        if (!stateDB) throw new Error("yams state DB not found")
        return {...stateDB, id : stateDB?.id.toString()}
    }

    async delete(userId : User["id"]){
        return this.collection.deleteOne({id : new ObjectId(userId)})
    }

    async deleteMany(usersId : User["id"][] ){
        const ids = this.idsToObjectIds(usersId)
        return this.collection.deleteMany({id: { $in: ids }})
    }

    async getUsersYamsState(usersId : User["id"][]){
        const ids = this.idsToObjectIds(usersId)
        return this.yamsStateDBtoYamsState(await this.collection.find({ id: { $in: ids } }).toArray())  
    }

    private yamsStateDBtoYamsState(users : UserYamsStateDB[]): UserYamsState[] {
        return users.map(u => ({ ...u, id: u.id.toString() }))
    }

    async update(userId : UserYamsState["id"], updatedFields : Partial<UserYamsStateDB>) {
        return this.collection.updateOne(
          { id: new ObjectId(userId) },
          { $set: {...updatedFields, updatedAt : new Date()} }
        );
      }
}