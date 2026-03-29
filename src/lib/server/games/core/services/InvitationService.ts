import type { User } from "$lib/types/user"


export class InvitationService {
    private invitedUsers : Set<User["id"]>
    constructor(){
        this.invitedUsers = new Set()
    }

    addUserToSet(userId : string){
        this.invitedUsers.add(userId)
    }

    removeUserFromSet(userId : string){
        this.invitedUsers.delete(userId)
    }

    removeManyUserFromSet(ids : string[]){
        ids.map(id => this.invitedUsers.delete(id))
    }

    userIsInvited(userId : string){
        return this.invitedUsers.has(userId)
    }

    getInvitedUsers(){
        return this.invitedUsers
    }
}