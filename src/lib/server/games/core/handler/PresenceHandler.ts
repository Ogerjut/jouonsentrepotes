// // LOGIQUE RESEAU GENERAL
// import type { TypedServer, TypedSocket } from "$lib/types/socket";
// import type { Table } from "$lib/types/table";
// import type { User } from "$lib/types/user";
// import type { DisconnectReason } from "socket.io";
// import type { GameLauncherFactory } from "../GameLauncherFactory";
// import type { PresenceService } from "../services/PresenceService";
// import type { TableService } from "../services/TableService";
// import type { UserService } from "../services/UserService";


// export class PresenceHandler {
//     userId : User["id"]
//     constructor(
//         private io: TypedServer,
//         private socket: TypedSocket,
//         private userService : UserService,
//         private tableService: TableService,
//         private presenceService : PresenceService,
//         private gameLauncher : GameLauncherFactory

//     ) {
//         this.userId = this.socket.data.userId;
//         this.registerEvents();
//     }
    
//     private registerEvents() {
//         this.socket.on('disconnect', (reason)=> this.onDisconnect(reason))
//         this.socket.on('registerUserSocket', () => this.handleRegisterUser());
//         this.socket.on('joinTable', (tableId) => this.handleJoinTable(tableId));
//         this.socket.on('inviteToPlay', (tableId, to, from, game) => this.handleInvitationToPlay(tableId, to, from, game))
//         this.socket.on('getActiveUsers', () => this.broadcastAvailableUsers())
//         this.socket.on('leaveTable', (url, callback) => this.handleLeaveTable(url, callback));
//         this.socket.on("leaveAllTable", () => this.handleLeaveAllTable())
//         // socket.on('rejoinTable', (tableId) => {rejoinTable(socket, tableId)});
//         // socket.on("quitTable", (tableId) => {socket.leave(tableId)})
//         // socket.on('leaveAllTable', (tableId, game) => leaveAllTable(io, tableId, game));
//         // socket.on('getEndTime', (duration, callback) => getEndTime(duration, callback))
//     }

//     onConnect(){
// 		this.presenceService.userConnected(this.userId);
//         this.broadcastAvailableUsers();
//     }

//     private async broadcastAvailableUsers() {
//         const usersId = this.presenceService.getAvailableUsers();
//         const users = await this.userService.getUsers(usersId);
//         this.io.emit('activeUsers', users);
//     }

//     private onDisconnect(reason : DisconnectReason){
//  		console.log('❌ Client déconnecté:', this.socket.id, '\nreason :', reason);
//         const reallyOffline = this.presenceService.userDisconnected(this.userId);
//         // penser à aussi le faire sauter de la table (playersId) et socket.leave() + maj activeUsers
//         if (reallyOffline){
//             this.presenceService.leaveTable(this.userId)
//             this.broadcastAvailableUsers();
//         } 
//     }

//     private handleRegisterUser() {
//         if (!this.userId) return;
//         this.socket.join(this.userId);
//         console.log(`✅ User ${this.userId} registered to personal room`);
//     }
    
//     private async handleJoinTable(tableId: Table["id"]) {
//         if (!this.userId) return;
    
//         try {
//             await this.tableService.joinTable(tableId, this.userId);
//             this.presenceService.joinTable(this.userId, tableId)
//             this.broadcastAvailableUsers();
//             this.socket.data.tableId = tableId;
//             this.socket.join(tableId);
            
//             console.log(`✅ User ${this.userId} joined table ${tableId}`);
            
//             const table = await this.tableService.getTableById(tableId)
//             const tableReady = await this.tableService.checkTableIsReady(tableId)
//             if (tableReady){
//                 await this.gameLauncher.start(table)
//             }

//         } catch (error) {
//             console.log(error)
//             // this.socket.emit('error', { 
//             //     message: error instanceof Error ? error.message : 'Failed to join table' 
//             // });
//         }
//     }

//     private async handleInvitationToPlay(tableId : Table["id"], to : User["id"], from : User["id"], game : Table["gameType"]){
//         // console.log("invitation to play received : ", tableId, to, from)
//         // Supprimer tableId car dispo dans socket.data idem, to = userId dispo dans socket.data
//         this.io.to(to).emit('invitationToPlay', tableId, from, game);
//     }

//     private async handleLeaveTable(url : string, callback : (url : string) => void){
//         const tableId = this.socket.data.tableId
//         this.presenceService.leaveTable(this.userId);
//         // réinit userGameState ! => dans yamsService !! 
//         // this.userService.leaveTable(this.userId)
//         this.broadcastAvailableUsers();
//         this.socket.leave(tableId)
//         callback(url)
//     }

//     private async handleLeaveAllTable(){
//         // presenceService pour logique 
//         this.io.to(this.socket.data.tableId).emit("onLeaveAllTable")

//     }

// }