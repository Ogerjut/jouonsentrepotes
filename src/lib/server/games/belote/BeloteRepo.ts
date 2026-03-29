import type { UserBeloteStateDB } from "$lib/types/db/beloteDB";
import type { UserBeloteState } from "$lib/types/games/belote";
import type { User } from "$lib/types/user";
import { ObjectId, type Collection, type PushOperator } from "mongodb";

export class BeloteRepo{
    constructor(
        private collection : Collection<UserBeloteStateDB>
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

    async getUsersBeloteState(usersId : User["id"][]){
        const ids = this.idsToObjectIds(usersId)
        return this.beloteStateDBtoBeloteState(await this.collection.find({ id: { $in: ids } }).toArray())
    }

    private beloteStateDBtoBeloteState(users : UserBeloteStateDB[]): UserBeloteState[] {
        return users.map(u => ({ ...u, id: u.id.toString() }))
    }

    async getGameState(id: User["id"]){
        const stateDB = await this.collection.findOne({ id : new ObjectId(id)})
        if (!stateDB) throw new Error("belote state DB not found")
        return {...stateDB, id : stateDB?.id.toString()}
    }

    async update(userId : UserBeloteState["id"], updatedFields : Partial<UserBeloteStateDB>) {
        return this.collection.updateOne(
            { id: new ObjectId(userId) },
            { $set: {...updatedFields, updatedAt : new Date()} }
        );
    }

    async updatePush(userId : UserBeloteState["id"], updatedFields : PushOperator<UserBeloteStateDB>) {
        return this.collection.updateOne(
            { id: new ObjectId(userId) },
            { $push: updatedFields },
            { $set : {updateAt : new Date()}}
        );
    }

    async getTaker(usersId : User["id"][]){
        const ids = this.idsToObjectIds(usersId)
        const userDB = await this.collection.findOne({ id: { $in: ids }, hasTaken : true })
        if (!userDB) throw new Error("belote state DB not found")
        return {...userDB, id : userDB?.id.toString()}
    }


}