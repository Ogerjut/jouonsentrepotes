import type { ChessPiece, ChessTeams, PiecesType, Tile } from "$lib/types/games/chess";
import type { GameHandler } from "$lib/types/handlers/gameHandler";
import type { TypedServer, TypedSocket } from "$lib/types/socket";
import type { Table, ChessTable } from "$lib/types/table";
import type { User } from "$lib/types/user";
import type { TableService } from "../core/services/TableService";
import type { ChessService } from "./chessService";
import { ChessClock, ClockManager } from "./core/clockManager";


export class ChessHandler implements GameHandler{
    private sockets: Map<string, TypedSocket> = new Map()
    private userIdToSocket : Map<string, TypedSocket> = new Map()

    constructor(
        private io : TypedServer,
        private chessService : ChessService,
        private tableService : TableService,
        private clockManager : ClockManager

    ){}

    async start(table : Table){
        console.log("chess started")
        this.setupSocketListeners(table.id);        
        const updatedTable = await this.chessService.start(table as ChessTable)
        const duration = updatedTable.gameState.timer * 60 * 1000

        this.clockManager.setClocks(table.id, {
            white: new ChessClock(duration),
            black: new ChessClock(duration),
            current: "white"
        })
        this.clockManager.setTimeOut(table.id, async (looser) => await this.endGameOnTimeOut(table.id, looser))

        this.io.to(table.id).emit("chess:table", updatedTable)
        await this.emitGameStateUpdate(table.playersId)

        this.clockManager.startClock(table.id)
        this.clockManager.startUpdate(table.id, () => this.updateClocks(table.id))
    }

    async rejoinTable(socket : TypedSocket, table : Table, userId : User["id"]){
        console.log('table rejoined')
        const userGameState = await this.chessService.getUserChessState(userId)
        this.setupSocketListeners(table.id);
        const clockState = this.clockManager.update(table.id)
        socket.emit("chess:table", table as ChessTable)
        socket.emit("chess:userGameState", userGameState)
        if (!clockState) return 
        this.io.to(table.id).emit("clock:update", clockState)
    }

    async joinTable(table : Table){
        console.log('table joined')
        this.io.to(table.id).emit("chess:table", table as ChessTable)
        await this.emitGameStateUpdate(table.playersId)
    }

    private setupSocketListeners(tableId : Table['id']): void {
        const socketsInRoom = this.io.sockets.adapter.rooms.get(tableId);
        if (!socketsInRoom) return;
        socketsInRoom.forEach(socketId => {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                if (this.sockets.has(socketId)) return
                this.sockets.set(socketId, socket);
                this.userIdToSocket.set(socket.data.userId, socket)
                this.attachListeners(socket);
            }
        });
        console.log("listeners attached to sockets in the room")
    }

    private attachListeners(socket: TypedSocket): void {
        socket.on("chess:move", async (move, response) => await this.handleMove(socket, move, response));
        socket.on("chess:pawnPromoted", async (piece) => await this.handlePawnPromoted(socket, piece))
        socket.on("chess:giveup", async () => await this.handleGiveUp(socket))
        socket.on("chess:askDraw", async () => await this.handleAskDraw(socket))
        socket.on("chess:onAcceptedDraw", async () => await this.handleAcceptedDraw(socket))
        socket.on("disconnect", () => this.cleanup(socket));  
    }

    cleanup(socket : TypedSocket){
        socket.removeAllListeners("chess:move");
        socket.removeAllListeners("chess:pawnPromoted")
        socket.removeAllListeners("chess:giveup")
        socket.removeAllListeners("chess:askDraw")
        socket.removeAllListeners("chess:onAcceptedDraw")
        this.sockets.delete(socket.id)
        this.userIdToSocket.delete(socket.data.userId)
    }

    reset(socket : TypedSocket){
        socket.emit("chess:reset")
        const tableId = socket.data.tableId
        if (!tableId) return 
        this.clockManager.clear(tableId)
    }

    async onPlayerLeave(userId : User["id"]){
        await this.chessService.onPlayerLeave(userId)
    }

    async onAbortTable(ids: User["id"][], tableId : string) {
        this.clockManager.clear(tableId)
        await this.chessService.onAbortTable(ids) 
    }

    private async emitGameStateUpdate(ids : User["id"][]){
        for (const id of ids){
            const player = await this.chessService.getUserChessState(id)
            this.io.to(id).emit("chess:userGameState", player)
        }
    }

    private async handleMove(socket : TypedSocket, move : {piece : ChessPiece, dest : Tile}, response : (isLegal : boolean) => void){
        console.log("handle move", move)
        const tableId = socket.data.tableId
        if (!tableId) return
        const res = await this.chessService.handleMove(move.piece, move.dest, tableId)
        this.io.to(tableId).emit("chess:table", res.table)
        if (res.isLegal){
            this.clockManager.switch(tableId)
            this.updateClocks(tableId)
        }
        if (res.table.completed){
            this.clockManager.clear(tableId)
        }
        response(res.isLegal)
    }

    private async handlePawnPromoted(socket : TypedSocket, piece : PiecesType){
        console.log('handle pawn promoted')
        const tableId = socket.data.tableId
        if (!tableId) return
        const table = await this.chessService.handlePawnPromoted(piece, tableId)
        this.io.to(tableId).emit("chess:table", table)
    }

    private async handleGiveUp(socket : TypedSocket){
        console.log("handle give up")
        const tableId = socket.data.tableId
        const userId = socket.data.userId
        if (!tableId || !userId) return
        const table = await this.chessService.handleGiveUp(tableId, userId)
        this.io.to(tableId).emit("chess:table", table)
        this.clockManager.clear(tableId)
    }

    private async handleAskDraw(socket : TypedSocket){
        console.log("handle ask draw")
        const tableId = socket.data.tableId
        const userId = socket.data.userId
        if (!tableId || !userId) return

        const socketToNotify = await this.chessService.handleAskDraw(userId, tableId, this.userIdToSocket)
        console.log("socket to notify id", socketToNotify?.id)
        if (!socketToNotify) return

        const data = {
            title : "Demande de match nul", 
            message : "Ton adversaire demande un match nul par accord mutuel", 
            actions : ["accept", "decline"]
        }
        socketToNotify.emit("chess:showModale", data)       
    }

    private async handleAcceptedDraw(socket : TypedSocket){
        console.log("handle accepted draw ")
        const tableId = socket.data.tableId
        const userId = socket.data.userId
        if (!tableId || !userId) return
        const table = await this.chessService.handleDrawResponse(tableId)
        this.io.to(tableId).emit("chess:table", table)
        this.clockManager.clear(tableId)

    }
    
    private async endGameOnTimeOut(tableId : string, looser : ChessTeams){
        this.clockManager.clear(tableId)
        const winner = looser === "white" ? "black" : "white"
        const table = await this.chessService.handleEndGameOnTimeOut(tableId, winner)
        this.io.to(tableId).emit("chess:table", table)
        this.clockManager.clear(tableId)


    }

    private updateClocks(tableId : string){
        const clocksUpdate = this.clockManager.update(tableId)
        if (!clocksUpdate) return 
        this.io.to(tableId).emit("clock:update", clocksUpdate)
        
    }


        

}