import type { HandfulResponse } from "$lib/client/games/tarot/TarotController.svelte";
import type { Card, Handful, TarotBid } from "$lib/types/games/tarot";
import type { GameHandler } from "$lib/types/handlers/gameHandler";
import type { TypedServer, TypedSocket } from "$lib/types/socket";
import type { Table, TarotTable } from "$lib/types/table";
import type { User } from "$lib/types/user";
import type { TableService } from "../core/services/TableService";
import { TableTimerManager } from "../core/utils/TableTimerManager";
import type { TarotService } from "./TarotService";

const TIMER_DURATIONS = {
    auction : 15000,
    setupDog : 30000,
    declareHandfulSlam : 8000, 
    showHandful : 8000, 
    playRandomCard : 1000,
    endRound : 15000, 
}


export class TarotHandler implements GameHandler{
    private sockets: Map<string, TypedSocket> = new Map()
    private userIdToSocket : Map<string, TypedSocket> = new Map()

    constructor(
        private io : TypedServer,
        private tarotService : TarotService,
        private tableService : TableService,
        private timerManager : TableTimerManager

    ){}

    async start(table : Table){
        console.log("tarot started")
        this.setupSocketListeners(table.id);
        const updatedTable = await this.tarotService.startGame(table as TarotTable)
        const currentPlayer = updatedTable.gameState.currentPlayer
        const socketCurrentPlayer = this.userIdToSocket.get(currentPlayer)
        if (socketCurrentPlayer) {
            await this.scheduleAuctionNextTurn(socketCurrentPlayer, table.id)
            this.io.to(table.id).emit("tarot:table", updatedTable)
            this.emitGameStateUpdate(updatedTable.playersId)
        }
    }

    async rejoinTable(socket : TypedSocket, table : Table, userId : User["id"]){
        console.log('table rejoined')
        const userGameState = await this.tarotService.getUserTarotState(userId)
        this.setupSocketListeners(table.id);
        const timer = this.timerManager.get(table.id)
        socket.emit("tarot:table", table as TarotTable)
        socket.emit("tarot:userGameState", userGameState)
        if (timer) socket.emit("timer:start", {...timer, userId : socket.data.userId} )
        
    }

    async joinTable(table : Table){
        console.log('table joined')
        this.io.to(table.id).emit("tarot:table", table as TarotTable)
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
        socket.on("tarot:hasBid", async (bet) => await this.handleNewBid(socket, bet));
        socket.on('tarot:handleDog', async (card) => await this.handleDog(socket, card))
        socket.on("tarot:registerDog", async () => await this.registerDog(socket))
        socket.on("tarot:checkHandful", async (response) => await this.checkHandful(socket, response))
        socket.on("tarot:declareSlam", async () => await this.handleDeclareSlam(socket));
        socket.on("tarot:registerHandful", async (handfulSize, response) => await this.handleDeclareHandful(socket, handfulSize, response));
        socket.on("tarot:checkPlayableCard", async (card) => await this.handlePlayedCard(socket, card))
        socket.on("disconnect", () => this.cleanup(socket));  
    }

    cleanup(socket : TypedSocket){
        socket.removeAllListeners("tarot:hasBid");
        socket.removeAllListeners("tarot:handleDog");
        socket.removeAllListeners("tarot:registerDog");
        socket.removeAllListeners("tarot:checkHandful");
        socket.removeAllListeners("tarot:declareSlam");
        socket.removeAllListeners("tarot:registerHandful");
        socket.removeAllListeners("tarot:checkPlayableCard");
        this.sockets.delete(socket.id)
        this.userIdToSocket.delete(socket.data.userId)
    }

    reset(socket : TypedSocket){
        socket.emit("tarot:reset")
    }

    async onPlayerLeave(userId : User["id"]){
        await this.tarotService.onPlayerLeave(userId)
    }

    async onAbortTable(ids: User["id"][], tableId : string) {
        this.timerManager.clear(tableId)
        await this.tarotService.onAbortTable(ids) 
    }

    private async handleNewBid(socket : TypedSocket, bid : TarotBid ){
        const tableId = socket.data.tableId
        if (!tableId) return 
        this.stopTimer(tableId)
        const table = await this.tarotService.handleNewBid(tableId, socket.data.userId, bid) as TarotTable
        const socketCurrentPlayer = this.userIdToSocket.get(table.gameState.currentPlayer) 
        this.io.to(tableId).emit("tarot:table", table as TarotTable)
        await this.scheduledActionsAfterAuction(table, socketCurrentPlayer)
        await this.emitGameStateUpdate(table.playersId)
    }

    private async scheduledActionsAfterAuction(table : TarotTable, socket : TypedSocket | undefined){
        if (!socket) return
        switch (table.gameState.state){
            case "auction" : 
                await this.scheduleAuctionNextTurn(socket, table.id)
                break
            case "afterAuction" :
                await this.scheduleRandomDog(socket, table.id)
                break
            case 'beforeRound' :
                await this.scheduleEndDeclareHandfulSlam(table.id)
                break 
        }
    }

    private async scheduleAuctionNextTurn(socket : TypedSocket, tableId : string){
        // this.stopTimer(tableId)
        console.log('scheduled timer for auction')
        const timerInfo = this.timerManager.schedule(tableId, TIMER_DURATIONS.auction, async () => {
            await this.handleNewBid(socket, 0)
        })
        this.io.to(socket.data.userId).emit("timer:start", {...timerInfo, userId : socket.data.userId })

    }

    private async scheduleRandomDog(socket : TypedSocket, tableId : string){
        console.log('scheduled timer for setup dog')
        const timerInfo = this.timerManager.schedule(tableId, TIMER_DURATIONS.setupDog, async () => {
            await this.tarotService.selectRandomDog(socket.data.userId, tableId)
            await this.registerDog(socket)
        })
        this.io.to(tableId).emit("timer:start", {...timerInfo, userId : null })
    }

    private async scheduleEndDeclareHandfulSlam(tableId : string){
        console.log('scheduled timer end declaration slam & handful')
        const timerInfo = this.timerManager.schedule(tableId, TIMER_DURATIONS.declareHandfulSlam, async () => {
            await this.checkHandfulOrRound(tableId)
        })
        this.io.to(tableId).emit("timer:start", {...timerInfo, userId : null })
    }

    private async emitGameStateUpdate(ids : User["id"][]){
        for (const id of ids){
            const player = await this.tarotService.getUserTarotState(id)
            this.io.to(id).emit("tarot:userGameState", player)
        }
    }

    private async handleDog(socket : TypedSocket, card : Card){
        const tableId = socket.data.tableId
        if (!tableId) return
        const res = await this.tarotService.handleDog(socket.data.userId, tableId, card)
        socket.emit('tarot:table', res.table)
        socket.emit("tarot:userGameState", res.userGameState)
    }

    private async registerDog(socket : TypedSocket){
        const tableId = socket.data.tableId
        if (!tableId) return
        this.stopTimer(tableId)
        const table = await this.tarotService.registerDog(socket.data.userId, tableId) 
        this.io.to(tableId).emit('tarot:table', table)
        await this.scheduleEndDeclareHandfulSlam(tableId)
    }

    private async checkHandful(socket : TypedSocket, response : (res : HandfulResponse)=> void){
        const res = await this.tarotService.checkHandful(socket.data.userId)
        response(res)
    }

    private async handleDeclareSlam(socket : TypedSocket){
        const tableId = socket.data.tableId
        if (!tableId) return
        const res = await this.tarotService.handleSlam(socket.data.userId, tableId)
        const userGameState = await this.tarotService.getUserTarotState(socket.data.userId)
        socket.emit("tarot:userGameState", userGameState)
        if (res.userIsNotFirstPlayer){
            const table = await this.tableService.getTableById(tableId) as TarotTable
            this.io.to(tableId).emit('tarot:table', table)
        }
    }

    private async handleDeclareHandful(socket : TypedSocket, handfulSize : Handful, response : (handfulRegistered : boolean) => void){
        const tableId = socket.data.tableId
        if (!tableId) return
        const res = await this.tarotService.handleHandful(socket.data.userId, tableId, handfulSize)
        socket.emit("tarot:userGameState", res.userGameState)
        this.io.to(tableId).emit("tarot:table", res.table)
        response(true)
    }

    private async checkHandfulOrRound(tableId : string){
        const table = await this.tarotService.checkStateHandfulOrRound(tableId)
        this.io.to(tableId).emit("tarot:table", table)
        switch (table.gameState.state){
            case "round" :
                await this.scheduledPlayRandomCard(table)
                break
            case "showHandful" :
                await this.scheduledEndShowHandful(table)
                break
        }
    }

    private async scheduledEndShowHandful(table : TarotTable){
        console.log("scheduled timer end show handful")
        const timerInfo = this.timerManager.schedule(table.id, TIMER_DURATIONS.showHandful, async () => {
            const freshTable = await this.tarotService.endShowHandful(table)
            await this.scheduledPlayRandomCard(freshTable)
            this.io.to(table.id).emit("tarot:table", freshTable)

        })
        this.io.to(table.id).emit("timer:start", {...timerInfo, userId : null })
    }

    // créer une fonction playRandomCard() si jamais je sépare les timer dans une nouvelle classe
    private async scheduledPlayRandomCard(table : TarotTable){
        console.log('scheduled timer play random card')
        const currentPlayer = table.gameState.currentPlayer
        const socket = this.userIdToSocket.get(currentPlayer)
        if (!socket) return
        const userGameState = await this.tarotService.getUserTarotState(socket.data.userId)
        const timerInfo = this.timerManager.schedule(table.id, TIMER_DURATIONS.playRandomCard, async () => {
           const updatedTable =  await this.tarotService.playRandomCard(userGameState, table)
            this.io.to(table.id).emit("tarot:table", updatedTable)
            await this.emitGameStateUpdate(table.playersId)
            await this.checkNextState(socket, updatedTable)
        })
        this.io.to(socket.data.userId).emit("timer:start", {...timerInfo, userId : socket.data.userId })
    }

    private async handlePlayedCard(socket : TypedSocket, card : Card){
        const tableId = socket.data.tableId
        if (!tableId) return
        const table = await this.tableService.getTableById(tableId) as TarotTable
        const userGameState = await this.tarotService.getUserTarotState(socket.data.userId)
        const isPlayableCard = await this.tarotService.checkPlayableCard(userGameState.hand, table, card)
        if (!isPlayableCard) return
        this.stopTimer(tableId)
        const updatedTable = await this.tarotService.playCard(userGameState, table, card)
        this.io.to(tableId).emit("tarot:table", updatedTable)
        await this.emitGameStateUpdate(table.playersId)
        await this.checkNextState(socket, updatedTable)
    }

    private async checkNextState(socket : TypedSocket, table : TarotTable){
        // this.stopTimer(table.id)
        const turnState = await this.tarotService.checkNextState(table)
        const updatedTable = await this.tarotService.handleNewState(turnState, table, socket.data.userId)
        this.io.to(table.id).emit("tarot:table", updatedTable)
        await this.emitGameStateUpdate(table.playersId)
        if (turnState === "endRound"){ 
            await this.scheduleEndGame(updatedTable)
        }
        else {
            await this.scheduledPlayRandomCard(updatedTable)
        }
    }

    private async scheduleEndGame(table: TarotTable) {
        console.log("scheduled end game")
        // this.stopTimer(table.id)
        const timerInfo = this.timerManager.schedule(table.id, TIMER_DURATIONS.endRound, async ()=>{
            const freshTable = await this.tableService.getTableById(table.id) as TarotTable
            await this.checkEndGame(freshTable)
        })
        this.io.to(table.id).emit("timer:start", {...timerInfo, userId : null})
    }

    private async checkEndGame(table : TarotTable){
        // this.stopTimer(table.id)
        const endGame = this.tarotService.checkEndGame(table)
        let updatedTable = table
        if (endGame){
            updatedTable = await this.tarotService.gameOver(table)
            this.io.to(table.id).emit("tarot:table", updatedTable)
            await this.emitGameStateUpdate(table.playersId)
        } else {
            await this.startNewRound(await this.tarotService.resetTable(table))
        }
        
    }

    private stopTimer(tableId : string){
        console.log("stop timer")
        this.timerManager.clear(tableId)
        this.io.to(tableId).emit("timer:stop")
    }

    private async startNewRound(table : TarotTable){
        console.log("tarot new round")
        const updatedTable = await this.tarotService.startGame(table as TarotTable)
        const currentPlayer = updatedTable.gameState.currentPlayer
        const socketCurrentPlayer = this.userIdToSocket.get(currentPlayer)
        if (socketCurrentPlayer) {
            await this.scheduleAuctionNextTurn(socketCurrentPlayer, table.id)
            this.io.to(table.id).emit("tarot:table", updatedTable)
            this.emitGameStateUpdate(updatedTable.playersId)
        }

    }

    

}