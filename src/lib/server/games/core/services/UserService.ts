import type { User } from "$lib/types/user";
import type { UserRepository } from "../repositories/UserRepository";

export class UserService {
    constructor (private userRepo : UserRepository) {}

    async getUserStatsById(userId : User["id"]){
        return this.userRepo.getUserStatsById(userId)
    }
    
    async getUsers(ids : User["id"][]){
        return this.userRepo.getUsers(ids)
    }

    async getUserById(id : User["id"]){
        return this.userRepo.getUserById(id)
    }

    async setCurrentTableId(userId : string, tableId : string | null = null){
        return this.userRepo.setCurrentTableId(userId, tableId)
    }

    async cleanCurrentTableId(ids : string[]){
        return this.userRepo.cleanCurrentTableId(ids)
    }

    async cleanAllCurrentTableId(){
        return this.userRepo.cleanAllCurrentTableId()
    }

}