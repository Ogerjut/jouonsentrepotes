import type { UserChessStateDB } from "$lib/types/db/chessDB";
import type { UserChessState } from "$lib/types/games/chess";
import type { User } from "$lib/types/user";
import { ObjectId, type Collection, type PushOperator } from "mongodb";

export class ChessRepo{
    constructor(
        private collection : Collection<UserChessStateDB>
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

    async getUsersChessState(usersId : User["id"][]){
        const ids = this.idsToObjectIds(usersId)
        return this.chessStateDBtoChessState(await this.collection.find({ id: { $in: ids } }).toArray())
    }

    private chessStateDBtoChessState(users : UserChessStateDB[]): UserChessState[] {
        return users.map(u => ({ ...u, id: u.id.toString() }))
    }

    async getGameState(id: User["id"]){
        const stateDB = await this.collection.findOne({ id : new ObjectId(id)})
        if (!stateDB) throw new Error("chess state DB not found")
        return {...stateDB, id : stateDB?.id.toString()}
    }

    async update(userId : UserChessState["id"], updatedFields : Partial<UserChessStateDB>) {
        return this.collection.updateOne(
            { id: new ObjectId(userId) },
            { $set: {...updatedFields, updatedAt : new Date()} }
        );
    }

    async updatePush(userId : UserChessState["id"], updatedFields : PushOperator<UserChessStateDB>) {
        return this.collection.updateOne(
            { id: new ObjectId(userId) },
            { $push: updatedFields },
            { $set : {updateAt : new Date()}}
        );
    }

}