import type { Card, BeloteBid, Suit, UserBeloteState } from "$lib/types/games/belote";
import type { GameHandler } from "$lib/types/handlers/gameHandler";
import type { TypedServer, TypedSocket } from "$lib/types/socket";
import type { Table, BeloteTable } from "$lib/types/table";
import type { User } from "$lib/types/user";
import type { TableService } from "../core/services/TableService";
import { TableTimerManager } from "../core/utils/TableTimerManager";
import type { BeloteService } from "./BeloteService";

const TIMER_DURATIONS = {
    teams : 3000,
    auction : 30000,
    playRandomCard : 1000,
    endRound : 15000,
    beloteEvent : 2000
}


export class BeloteHandler implements GameHandler{
    private sockets: Map<string, TypedSocket> = new Map()
    private userIdToSocket : Map<string, TypedSocket> = new Map()

    constructor(
        private io : TypedServer,
        private beloteService : BeloteService,
        private tableService : TableService,
        private timerManager : TableTimerManager

    ){}

    async start(table : Table){
        console.log("belote started")
        this.setupSocketListeners(table.id);
        const updatedTable = await this.beloteService.createTeams(table as BeloteTable)
        this.io.to(table.id).emit("belote:table", updatedTable)
        await this.scheduleDealCard(updatedTable)
    }

    async rejoinTable(socket : TypedSocket, table : Table, userId : User["id"]){
        console.log('table rejoined')
        const userGameState = await this.beloteService.getUserBeloteState(userId)
        this.setupSocketListeners(table.id);
        const timer = this.timerManager.get(table.id)
        socket.emit("belote:table", table as BeloteTable)
        socket.emit("belote:userGameState", userGameState)
        if (timer) socket.emit("timer:start", {...timer, userId : socket.data.userId} )
        
    }

    async joinTable(table : Table){
        console.log('table joined')
        this.io.to(table.id).emit("belote:table", table as BeloteTable)
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
        socket.on("belote:hasBid", async (bet, suit) => await this.handleNewBid(socket, bet, suit));
        socket.on("belote:checkPlayableCard", async (card) => await this.handlePlayedCard(socket, card))
        socket.on("disconnect", () => this.cleanup(socket));  
    }

    cleanup(socket : TypedSocket){
        socket.removeAllListeners("belote:hasBid");
        socket.removeAllListeners("belote:declareBelote");
        socket.removeAllListeners("belote:checkPlayableCard");
        this.sockets.delete(socket.id)
        this.userIdToSocket.delete(socket.data.userId)
    }

    reset(socket : TypedSocket){
        socket.emit("belote:reset")
    }

    async onPlayerLeave(userId : User["id"]){
        await this.beloteService.onPlayerLeave(userId)
    }

    async onAbortTable(ids: User["id"][], tableId : string) {
        this.timerManager.clear(tableId)
        await this.beloteService.onAbortTable(ids) 
    }

    private async emitGameStateUpdate(ids : User["id"][]){
        for (const id of ids){
            const player = await this.beloteService.getUserBeloteState(id)
            this.io.to(id).emit("belote:userGameState", player)
        }
    }

    async scheduleDealCard(table : BeloteTable){
        const timerInfo = this.timerManager.schedule(table.id, TIMER_DURATIONS.teams, async () => {
            await this.startAuction(table)
        })
        this.io.to(table.id).emit("timer:start", {...timerInfo, userId : null})
    }

    async startAuction(table : BeloteTable){
        const updatedTable = await this.beloteService.startAuction(table)
        const currentPlayer = updatedTable.gameState.currentPlayer
        const socketCurrentPlayer = this.userIdToSocket.get(currentPlayer)
        const suit = updatedTable.gameState.potentialTrump?.suit
        if (socketCurrentPlayer && suit) {
            await this.scheduleAuctionNextTurn(socketCurrentPlayer, table.id, suit)
            this.io.to(table.id).emit("belote:table", updatedTable)
            this.emitGameStateUpdate(updatedTable.playersId)
        }
    }

    private async scheduleAuctionNextTurn(socket : TypedSocket, tableId : string, suit : Suit){
        console.log('scheduled timer for auction')
        const timerInfo = this.timerManager.schedule(tableId, TIMER_DURATIONS.auction, async () => {
            await this.handleNewBid(socket, 0, suit)
        })
        this.io.to(socket.data.userId).emit("timer:start", {...timerInfo, userId : socket.data.userId })
    }

    private async handleNewBid(socket : TypedSocket, bid : BeloteBid, suit : Suit ){
        const tableId = socket.data.tableId
        if (!tableId) return 
        this.stopTimer(tableId)
        const table = await this.beloteService.handleNewBid(tableId, socket.data.userId, bid, suit) as BeloteTable
        const socketCurrentPlayer = this.userIdToSocket.get(table.gameState.currentPlayer) 
        this.io.to(tableId).emit("belote:table", table)
        await this.scheduledActionsAfterAuction(table, socketCurrentPlayer, suit)
        await this.emitGameStateUpdate(table.playersId)
    }
    
    private async scheduledActionsAfterAuction(table : BeloteTable, socket : TypedSocket | undefined, suit : Suit){
        if (!socket) return
        switch (table.gameState.state){
            case "auction" : 
                await this.scheduleAuctionNextTurn(socket, table.id, suit)
                break
            case "endDeal" : {
                const updatedTable = await this.beloteService.endDeal(table)
                this.io.to(updatedTable.id).emit("belote:table", updatedTable)
                await this.beloteService.checkPlayerHasBelote(updatedTable.playersId, updatedTable.gameState.trumpSuit)
                await this.scheduleStartRound(updatedTable)
                break }  
        }
    }

    private async scheduleStartRound(table : BeloteTable){
        const timerInfo = this.timerManager.schedule(table.id, TIMER_DURATIONS.endRound, async () => {
            await this.scheduledPlayRandomCard(table)
        })
        this.io.to(table.id).emit("timer:start", {...timerInfo, userId : null})
    }

    private async scheduledPlayRandomCard(table : BeloteTable){
        console.log('scheduled timer play random card')
        const currentPlayer = table.gameState.currentPlayer
        const socket = this.userIdToSocket.get(currentPlayer)
        if (!socket) return
        const userGameState = await this.beloteService.getUserBeloteState(socket.data.userId)
        const timerInfo = this.timerManager.schedule(table.id, TIMER_DURATIONS.playRandomCard, async () => {
            const updatedTable =  await this.beloteService.playRandomCard(userGameState, table)
            this.emitBelote(userGameState, updatedTable)
            this.io.to(table.id).emit("belote:table", updatedTable)
            await this.emitGameStateUpdate(table.playersId)
            await this.checkNextState(socket, updatedTable)
           
        })
        this.io.to(socket.data.userId).emit("timer:start", {...timerInfo, userId : socket.data.userId })
    }

    private async handlePlayedCard(socket : TypedSocket, card : Card){
        const tableId = socket.data.tableId
        if (!tableId) return
        const table = await this.tableService.getTableById(tableId) as BeloteTable
        const userGameState = await this.beloteService.getUserBeloteState(socket.data.userId)
        const isPlayableCard = await this.beloteService.checkPlayableCard(userGameState.hand, table, card)
        if (!isPlayableCard) return
        this.stopTimer(tableId)
        const updatedTable = await this.beloteService.playCard(userGameState, table, card)
        this.emitBelote(userGameState, updatedTable)
        this.io.to(tableId).emit("belote:table", updatedTable)
        await this.emitGameStateUpdate(table.playersId)
        await this.checkNextState(socket, updatedTable)
    }

    private async checkNextState(socket : TypedSocket, table : BeloteTable){
        const turnState = await this.beloteService.checkNextState(table)
        const updatedTable = await this.beloteService.handleNewState(turnState, table, socket.data.userId)
        this.io.to(table.id).emit("belote:table", updatedTable)
        await this.emitGameStateUpdate(table.playersId)
        if (turnState === "endRound"){
            await this.scheduleEndGame(updatedTable)
        }
        else {
            await this.scheduledPlayRandomCard(updatedTable)
        }
    }

    private async scheduleEndGame(table: BeloteTable) {
        console.log("scheduled end game")
        const timerInfo = this.timerManager.schedule(table.id, TIMER_DURATIONS.endRound, async ()=>{
            const freshTable = await this.tableService.getTableById(table.id) as BeloteTable
            await this.checkEndGame(freshTable)
        })
        this.io.to(table.id).emit("timer:start", {...timerInfo, userId : null})
    }

    private async checkEndGame(table : BeloteTable){
        const endGame = this.beloteService.checkEndGame(table)
        let updatedTable = table
        if (endGame){
            updatedTable = await this.beloteService.gameOver(table)
            this.io.to(table.id).emit("belote:table", updatedTable)
            await this.emitGameStateUpdate(table.playersId)
        } else {
            await this.startNewRound(await this.beloteService.resetTable(table))
        }
        
    }

    private stopTimer(tableId : string){
        console.log("stop timer")
        this.timerManager.clear(tableId)
        this.io.to(tableId).emit("timer:stop")
    }

    private async startNewRound(table : BeloteTable){
        console.log('start new round')
        const updatedTable = await this.beloteService.startAuction(table as BeloteTable)
        const socketCurrentPlayer = this.userIdToSocket.get(updatedTable.gameState.currentPlayer)
        if (socketCurrentPlayer && updatedTable.gameState.potentialTrump?.suit) {
            console.log("belote start new round")
            await this.scheduleAuctionNextTurn(socketCurrentPlayer, table.id, updatedTable.gameState.potentialTrump?.suit)
            this.io.to(table.id).emit("belote:table", updatedTable)
            this.emitGameStateUpdate(updatedTable.playersId)
        }

    }

    private emitBelote(userGameState : UserBeloteState, table : BeloteTable){
        if (this.beloteService.cardBelotePlayed(userGameState, table)){
            console.log('belote / rebelote')
            this.io.to(table.id).emit("belote:belote", TIMER_DURATIONS.beloteEvent)
        }
    }

}