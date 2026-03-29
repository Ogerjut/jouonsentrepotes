// LOGIQUE RESEAU GENERAL // ORCHESTRATION
import type { TypedServer, TypedSocket } from "$lib/types/socket";
import { UserService } from "../services/UserService";
import { TableService } from "../services/TableService";
import type { Table } from "$lib/types/table";
import type { User, UserStats } from "$lib/types/user";
import type { PresenceService } from "../services/PresenceService";
import type { GameServiceFactory } from "../GameServicesFactory";
import type { DisconnectReason } from "socket.io";
import type { GameHandlerFactory } from "../GameHandlerFactory";
import type { UserGameState } from "$lib/types/games/gameCommon";
import type { GameHandler } from "$lib/types/handlers/gameHandler";
import type { InvitationService } from "../services/InvitationService";


export class CoreHandler {
    userId : User["id"]
    constructor(
        private io: TypedServer,
        private socket: TypedSocket,
        private userService : UserService,
        private tableService: TableService,
        private presenceService : PresenceService,
        private invitationService : InvitationService,
        private gameServiceFactory : GameServiceFactory,
        private gameHandlerFactory : GameHandlerFactory
        
    ) {
        this.userId = this.socket.data.userId;
        this.registerEvents();
    }
    
    private registerEvents() {
        this.socket.on('getUserStatsById', async (userId, callback) => await this.handleGetUserStatsById(userId, callback))
        this.socket.on('getOpponents', async (callback)=> await this.handleGetOpponents(callback))
        this.socket.on('disconnect', async (reason)=> await this.onDisconnect(reason))
        this.socket.on('registerUserSocket', () => this.handleRegisterUser());
        this.socket.on('joinTable', async (tableId) => await this.handleJoinTable(tableId));
        this.socket.on('inviteToPlay', async (to, from, game) => await this.handleInvitationToPlay(to, from, game))
        this.socket.on('acceptedInvitation', async (tableId, response) => await this.handleAcceptedInvitation(tableId, response))
        this.socket.on("declinedInvitation", async () => await this.handleDeclinedInvitation() )
        this.socket.on('getActiveUsers', async () => await this.broadcastAvailableUsers())
        this.socket.on('leaveTable', async () => await this.handleLeaveTable());
        this.socket.on('getOpponentsGameState', async (callback) => await this.handleGetOpponentsGameState(callback))
    }

    onConnect(){
        this.presenceService.userConnected(this.userId);
        this.presenceService.cancelDisconnect(this.userId)
        this.broadcastAvailableUsers();
        console.log("on line users", this.presenceService.getOnlineUsers())
        console.log("in game users", this.presenceService.getPlayingUsers())
        this.sendPresenceStatus()
    }

    private handleRegisterUser() {
        if (!this.userId) return;
        this.socket.join(this.userId);
        // console.log(`✅ User ${this.userId} registered to personal room`);
    }

    private async handleJoinGameLobby(response : (res : {status: "ok" | "not", reason?: string}) => void){
        if (this.presenceService.userInTable(this.userId)){
            response({status : "not", reason : "tu es déjà dans une partie"})
        } else {
            response({status : "ok"})
        }
    }
    
    private async handleGetUserStatsById(userId : User["id"], callback : (user : UserStats)=>void){
        const user = await this.userService.getUserStatsById(userId)
        callback(user)
    }

    private async handleGetOpponents(callback : (opponnents : User[])=>void){
        const tableId = this.socket.data.tableId
        if (!tableId) return
        const table = await this.tableService.getTableById(tableId)
        const ids = table.playersId.filter(id => id !== this.userId)
        const opponents = await this.userService.getUsers(ids)
        callback(opponents)
    }

    private async broadcastAvailableUsers() {
        const usersId = this.presenceService.getAvailableUsers();
        const users = await this.userService.getUsers(usersId);
        this.io.emit('activeUsers', users);
    }

    private async onDisconnect(reason : DisconnectReason){
        console.log('❌ Client déconnecté:', this.socket.id, '\nreason :', reason);
        const reallyOffline = this.presenceService.userDisconnected(this.userId);
        if (!reallyOffline) {
            return;
        }

        this.invitationService.removeUserFromSet(this.socket.data.userId)
        this.sendInvitedUsers()

        this.presenceService.scheduleDisconnect(this.userId, 5000, async () => {
            const tableId = this.socket.data.tableId;
            if (tableId && this.presenceService.userInTable(this.userId)) {
                await this.handleLeaveTable();
            }
            await this.broadcastAvailableUsers();
        });

    }

    private async handleJoinTable(tableId: Table["id"]){
        const table = await this.tableService.getTableById(tableId);
        const res = this.canJoinTable(table)
        console.log("can join table :", res.status, res.reason)
        if (res.status === "ok"){
            await this.joinTable(table, res.isRejoin)
        } else {
            this.sendRedirection("/")
            this.socket.emit("error", res.reason)
        }
    }

    private canJoinTable(table: Table): {status: "ok" | "not", reason?: string, isRejoin?: boolean} {
        if (!this.userId) return {status: 'not', reason: 'wrong userID'};
        const currentTableId = this.presenceService.getTableId(this.userId)
        if (currentTableId) {
            if (currentTableId === table.id) {
                return { status: "ok", isRejoin: true }; 
            } else {
                return { status: "not", reason: "user is already gaming on another table" };
            }
        }
        if (table.ready) return {status: 'not', reason: "table is already ready"};
        if (table.playersId.length === table.maxPlayers) return {status: 'not', reason: "table is already full"};
        return {status: "ok"};
    }

    private async joinTable(table : Table, isRejoin = false ) {
        // console.log("is rejoining :", isRejoin)
        let updatedTable = table

        if (!isRejoin) {
            updatedTable = await this.tableService.joinTable(table.id, this.userId);
            this.presenceService.joinTable(this.userId, table.id);
            await this.userService.setCurrentTableId(this.userId, table.id)
        }

        this.socket.data.tableId = table.id;
        this.socket.join(table.id);
        await this.broadcastAvailableUsers()
        this.sendPresenceStatus()
        
        const gameHandler = this.gameHandlerFactory.get(updatedTable);
        const tableIsReady = this.tableService.checkTableIsReady(updatedTable)
        // console.log('table is ready:', tableIsReady)
        if (tableIsReady && !isRejoin) {
            const tableReady = await this.tableService.setReady(table.id);
            await gameHandler.start(tableReady);
        }

        if (tableIsReady && isRejoin){
            await gameHandler.rejoinTable(this.socket, updatedTable, this.userId)
        }

        if (!tableIsReady && !isRejoin){
            await gameHandler.joinTable(updatedTable)
        }
 
    }

    private async handleGetOpponentsGameState(callback : (opponents : UserGameState[])=>void){
        const tableId = this.socket.data.tableId
        if (!tableId) return 
        const table = await this.tableService.getTableById(tableId)
        const ids = table.playersId.filter(id => id !== this.userId)
        const gameService = this.gameServiceFactory.get(table.gameType)
        const opponentsGameState = await gameService.getOpponentsGameState(tableId, ids)
        const opponentsGameStateDTO = opponentsGameState.map(s => ({...s, hand : []}) ) 
        callback(opponentsGameStateDTO)
    }

    private async handleInvitationToPlay(to : User["id"], from : User["id"], game : Table["gameType"]){
        const tableId = this.presenceService.getTableId(from)
        const inviter = await this.userService.getUserById(from)  
        if (tableId && inviter){
            this.invitationService.addUserToSet(to)
            this.sendInvitedUsers()
            this.io.to(to).emit('invitationToPlay', tableId, inviter?.name, game);
        }
    }

    private async handleAcceptedInvitation(tableId: string, response : (res : {status : "ok" | "not", reason? : string}) => void){
        const table = await this.tableService.getTableById(tableId);
        if (table.ready || table.playersId.length === table.maxPlayers){
            response({status : "not", reason : "table full or ready"})
        }
        response({status : "ok"})
    }

    private async handleDeclinedInvitation(){
        this.invitationService.removeUserFromSet(this.socket.data.userId)
        this.sendInvitedUsers()
    }

    private async handleAbortTable(table : Table, gameHandler : GameHandler){
        console.log("handle abort table")
        const tableId = table.id
        const ids = table.playersId
        
        await this.userService.cleanCurrentTableId(ids)
        this.presenceService.onAbortTable(ids)
        await gameHandler.onAbortTable(ids, table.id)
        await this.tableService.delete(tableId)
        this.invitationService.removeManyUserFromSet(table.playersId)
        this.sendInvitedUsers()
        // this.io.to(tableId).emit("abortedTable")
        await this.broadcastAvailableUsers()
        this.sendPresenceStatus()

        const socketIdLeaver = this.socket.id
        const room = this.io.sockets.adapter.rooms.get(tableId)
        if (room) {
            for (const socketId of room) {
                const socket = this.io.sockets.sockets.get(socketId)
                if (socket) {
                    if (socketIdLeaver === socketId){
                        socket.emit('redirection', "/")
                    } else {
                        socket.emit("abortedTable")
                    }
                    gameHandler.cleanup(socket)
                    gameHandler.reset(socket) 
                    socket.leave(tableId)
                    socket.data.tableId = null
                }
            }
        }
        this.gameHandlerFactory.remove(table.id)
    }

    private async handleLeaveTable() {
        console.log("event server : leave table")
        const tableId = this.presenceService.getTableId(this.userId)
        if (!tableId) return
        const table = await this.tableService.getTableById(tableId)
        const gameHandler = this.gameHandlerFactory.get(table)
        
        if (table.ready && !table.completed) {
            await this.handleAbortTable(table, gameHandler)
            return 
        }
        gameHandler.reset(this.socket)
        this.invitationService.removeUserFromSet(this.socket.data.userId)
        this.sendInvitedUsers()
        await gameHandler.onPlayerLeave(this.userId)
        await this.userService.setCurrentTableId(this.userId)
        await this.tableService.leaveTable(table, this.userId)
        this.presenceService.leaveTable(this.userId);
        this.socket.data.tableId = null
        this.socket.leave(tableId)
        this.gameHandlerFactory.remove(table.id)
        await this.broadcastAvailableUsers();
        this.sendPresenceStatus()
    }
    
    private sendPresenceStatus(){
        // console.log("status sent :", this.presenceService.getUserPresence(this.userId) )
        this.socket.emit("userPresence", this.presenceService.getUserPresence(this.userId))
    }

    private sendInvitedUsers(){
        const serializedInvitedUsers = [...this.invitationService.getInvitedUsers().keys()]
        this.io.emit("invitedUsers", serializedInvitedUsers)
    }

    private sendRedirection(url : string){
        // console.log(`redirection to ${url}`)
        this.socket.emit("redirection", url)
    }


}