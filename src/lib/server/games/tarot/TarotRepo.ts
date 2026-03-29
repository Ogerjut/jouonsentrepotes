import type { UserTarotStateDB } from "$lib/types/db/tarotDB";
import type { UserTarotState } from "$lib/types/games/tarot";
import type { User } from "$lib/types/user";
import { ObjectId, type Collection, type PushOperator } from "mongodb";

export class TarotRepo{
    constructor(
        private collection : Collection<UserTarotStateDB>
    ){}

    private idsToObjectIds(ids : User["id"][]){
        return ids.map(id => new ObjectId(id));
    }

    async delete(userId : User["id"]){
        return this.collection.deleteOne({id : new ObjectId(userId)})
    }
    
    async deleteMany(usersId : User["id"][] ){
        const ids = this.idsToObjectIds(usersId)
        return this.collection.deleteMany({id: { $in: ids }})
    }

    async getUsersTarotState(usersId : User["id"][]){
        const ids = this.idsToObjectIds(usersId)
        return this.tarotStateDBtoTarotState(await this.collection.find({ id: { $in: ids } }).toArray())
    }

    private tarotStateDBtoTarotState(users : UserTarotStateDB[]): UserTarotState[] {
        return users.map(u => ({ ...u, id: u.id.toString() }))
    }

    async getGameState(id: User["id"]){
        const stateDB = await this.collection.findOne({ id : new ObjectId(id)})
        if (!stateDB) throw new Error("tarot state DB not found")
        return {...stateDB, id : stateDB?.id.toString()}
    }

    async update(userId : UserTarotState["id"], updatedFields : Partial<UserTarotStateDB>) {
        return this.collection.updateOne(
            { id: new ObjectId(userId) },
            { $set: {...updatedFields, updatedAt : new Date()} }
        );
    }

    async updatePush(userId : UserTarotState["id"], updatedFields : PushOperator<UserTarotStateDB>) {
        return this.collection.updateOne(
            { id: new ObjectId(userId) },
            { $push: updatedFields }, 
            { $set : { updateAt : new Date()}}
        );
    }

    async getTaker(usersId : User["id"][]){
        const ids = this.idsToObjectIds(usersId)
        const userDB = await this.collection.findOne({ id: { $in: ids }, hasTaken : true })
        if (!userDB) throw new Error("tarot state DB not found")
        return {...userDB, id : userDB?.id.toString()}
    }


}