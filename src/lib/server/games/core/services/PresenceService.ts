import type { Table } from "$lib/types/table";
import type { User } from "$lib/types/user";

export class PresenceService {
    private userConnections : Map<User["id"], number>
    private userTable : Map<User["id"], Table["id"]>
    private userDisconnectTimeouts : Map<User["id"], NodeJS.Timeout>

    constructor () {
        this.userConnections = new Map()
        this.userTable = new Map()
        this.userDisconnectTimeouts = new Map()
    }
    
    joinTable(userId : User["id"], tableId : Table['id']){
        this.userTable.set(userId, tableId)
        console.log("join table :", this.userTable)
    }

    leaveTable(userId : User["id"]){
        this.userTable.delete(userId)
        console.log("leave table :", this.userTable)
    }

    onAbortTable(ids : User["id"][]){
        ids.map(id => {
            this.userTable.delete(id)
        })
        console.log("abort table :", this.userTable)
    }

    userInTable(userId : User["id"]){
        return this.userTable.has(userId)
    }

    userConnected(userId : User["id"]){
        const count = this.userConnections.get(userId) || 0;
        this.userConnections.set(userId, count + 1);
        console.log("user connected :", this.userConnections)
    }

    userDisconnected(userId : User["id"]) {
        const count = (this.userConnections.get(userId) || 1) - 1;

        if (count <= 0) {
            this.userConnections.delete(userId);
            return true; 
        }

        this.userConnections.set(userId, count);
        console.log("user disconnect :", this.userConnections)
        return false;
    }

    isUserOnline(userId : User["id"]) {
        return this.userConnections.has(userId);
    }

    getUserPresence(userId : User["id"]){
        return {online : this.isUserOnline(userId), inGame : this.userInTable(userId)}
    }

    getTableId(userId : User["id"]){
        return this.userTable.get(userId)
    }

    getOnlineUsers() : User["id"][]{
        return [...this.userConnections.keys()]
    }

    getPlayingUsers() : User["id"][]{
        return [...this.userTable.keys()]
    }

    getAvailableUsers() : User["id"][]{
        const idsOnline = this.getOnlineUsers()
        const idsPlaying = this.getPlayingUsers()
        return idsOnline.filter(id => !idsPlaying.includes(id))
    }

    cancelDisconnect(userId: User["id"]) {
        const timeout = this.userDisconnectTimeouts.get(userId);
        if (timeout) {
            clearTimeout(timeout);
            this.userDisconnectTimeouts.delete(userId);
            console.log("🔄 Reconnexion → disconnect annulé");
        }
    }


    scheduleDisconnect(userId: User["id"],delayMs: number,onTimeout: () => Promise<void>) {
        if (this.userDisconnectTimeouts.has(userId)) return;

        const timeout = setTimeout(async () => {
            this.userDisconnectTimeouts.delete(userId);
            await onTimeout();
        }, delayMs);

        this.userDisconnectTimeouts.set(userId, timeout);
    }


}