// PERSISTENCE DATA - ECRITURE LECTURE DB
import type { UserStatsDB } from "$lib/types/db/userStatsDB";
import type { User, UserStats } from "$lib/types/user";
import { Collection, ObjectId } from "mongodb";

// faire une classe mère avec fonction contenant les types génériques Collection<T> afin d'éviter la répétition dans class filles 
// Faire repo pour YamsState, userStats, TarotState.... 

export class UserRepository {
  constructor(
    private usersCollection: Collection<User>,
    private usersStatsCollection : Collection<UserStatsDB>,
  ) {}
  
  private idsToObjectIds(ids : User["id"][]){
    return ids.map(id => new ObjectId(id));
  }

  private userStatsDBtoUserStats(user : UserStatsDB): UserStats {
    return {
      ...user, id : user.id.toString()
    }
  }

  async getUserById(userId: User["id"]) {
    return this.usersCollection.findOne({ _id: new ObjectId(userId) });
  }

  async getUserStatsById(userId: User["id"]) {
    const userStats = await this.usersStatsCollection.findOne({ id: new ObjectId(userId) });
    if (!userStats) {
      throw new Error("invalid userId")
    }
    return this.userStatsDBtoUserStats(userStats) 
  }

  async getUsers(usersId : User["id"][]){
    const ids = this.idsToObjectIds(usersId)
    const usersDB = await this.usersCollection.find({ _id: { $in: ids } }).toArray()
    return usersDB.map(u => ({...u, id : u._id.toString()}))
  }

  async updateStats(userId: User["id"], updatedFields : Partial<UserStatsDB>){
    return this.usersStatsCollection.updateOne(
      { id: new ObjectId(userId) },
      { $set: {...updatedFields, updatedAt : new Date()} }
    );
  }

  async getUsersStats(usersId : string[]){
    const ids = this.idsToObjectIds(usersId)
    const usersDB = await this.usersStatsCollection.find({ id: { $in: ids } }).toArray()
    return usersDB.map(u => ({...u, id : u.id.toString()}))
  }

  async setCurrentTableId(userId : string, tableId : string | null = null ){
    await this.usersCollection.updateOne(
        { _id: new ObjectId(userId)},
        {$set : {currentTableId : tableId}}
    );
  }

  async cleanCurrentTableId(ids : string[]){
    await this.usersCollection.updateMany(
      {_id : { $in : this.idsToObjectIds(ids)}},
      {$set : {currentTableId : null}}
    )
  }

  async cleanAllCurrentTableId(){
    const usersId = (await this.usersCollection.find().toArray()).map(u => u._id)
    await this.usersCollection.updateMany(
      {_id : {$in : usersId}},
      {$set : {currentTableId : null}}
    )
  }




}