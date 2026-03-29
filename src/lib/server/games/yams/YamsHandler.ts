import type { TypedServer, TypedSocket } from "$lib/types/socket";
import type { Table, YamsTable } from "$lib/types/table";
import type { YamsService } from "./YamsService";
import type { Dice } from "./yamsEntities";
import type { TableService } from "../core/services/TableService";
import type { DiceResult } from "$lib/types/games/yams";
import type { UserService } from "../core/services/UserService";
import type { User } from "$lib/types/user";
import type { GameHandler } from "$lib/types/handlers/gameHandler";
import { TableTimerManager } from "../core/utils/TableTimerManager";


export class YamsHandler implements GameHandler {
    private sockets: Map<string, TypedSocket> = new Map()
    
    constructor(
        private io : TypedServer,
        private yamsService : YamsService,
        private tableService : TableService,
        private userService : UserService,
        private timerManager : TableTimerManager
    ){}

    async start(table : Table){
        console.log("yams started")
        this.setupSocketListeners(table.id);
        const initTable = await this.yamsService.initYams(table as YamsTable);
        this.io.to(initTable.id).emit("yams:table", initTable);
    }

    joinTable(table : Table){
        this.io.to(table.id).emit("yams:table", table as YamsTable)
    }

    async rejoinTable(socket : TypedSocket, table : Table, userId : User["id"]){
        console.log('table rejoined')
        const userGameState = await this.yamsService.getUserYamsState(userId)
        this.setupSocketListeners(table.id);
        socket.emit("yams:table", table as YamsTable)
        socket.emit("yams:userGameState", userGameState)
    }

    private setupSocketListeners(tableId : Table['id']): void {
        const socketsInRoom = this.io.sockets.adapter.rooms.get(tableId);
        if (!socketsInRoom) return;

        socketsInRoom.forEach(socketId => {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                console.log("sockets has socket :", this.sockets.has(socketId))
                if (this.sockets.has(socketId)) return
                this.sockets.set(socketId, socket);
                this.attachListeners(socket);
            }
            console.log(" yams listeners attached to socket")
        });
    }

    private attachListeners(socket: TypedSocket ): void {
        socket.on("yams:rollDice",  async (kept: Dice[]) => await this.handleRollDice(socket, kept));
        socket.on("yams:registerDiceResult", async (diceResult: DiceResult, id : string) => await this.handleRegisterDiceResult(socket, diceResult, id))
        socket.on("disconnect", async () => this.cleanup(socket));
    }

    reset(socket : TypedSocket){
        socket.emit("yams:reset")
    }

    async onPlayerLeave(userId : User["id"]){
        await this.yamsService.onPlayerLeave(userId)
    }

    async onAbortTable(ids: User["id"][], tableId : string) {
        this.timerManager.clear(tableId)
        await this.yamsService.onAbortTable(ids) 
    }

    private async sendGameState(table : YamsTable){
        for (const playerId of table.playersId) {
            const privateState = await this.yamsService.getUserYamsState(playerId);
            this.io.to(playerId).emit("yams:userGameState", privateState)
        }
    }

    private async handleRollDice(socket : TypedSocket, kept : Dice[]){
        console.log("received event roll dice")
        const userId = socket.data.userId
        const tableId = socket.data.tableId
        if (!tableId || !userId) return 
        const userYamsState = await this.yamsService.getUserYamsState(userId)
        const table = await this.tableService.getTableById(tableId)

        const dices = this.yamsService.rollDices(kept)
        const possibleDiceResult = await this.yamsService.getPossibleResults(dices, userYamsState.listResults)
        const result = await this.yamsService.updateAfterRolledDices(userId, table as YamsTable, userYamsState, possibleDiceResult, dices)

        this.io.to(tableId).emit("yams:table", result.table)
        await this.sendGameState(table as YamsTable)
    }

    private async handleRegisterDiceResult(socket : TypedSocket, diceResult : DiceResult, id : string){
        console.log("server event : register dice result")
        const userId = socket.data.userId
        const tableId = socket.data.tableId
        if (!tableId || !userId || userId != id ) return 

        const userYamsState = await this.yamsService.getUserYamsState(userId)
        await this.yamsService.registerDiceResult(userId, userYamsState, diceResult)
        const table = await this.tableService.getTableById(tableId)
        await this.sendGameState(table as YamsTable)
        const isEndGame = await this.yamsService.checkEndGame(table.playersId)
        if (isEndGame){
            await this.handleEndGame(table as YamsTable) 
        } else {
            const {updatedTable} = await this.yamsService.nextTurn(table as YamsTable, userId)
            this.io.to(tableId).emit("yams:table", updatedTable)
        }
    }

    private async handleEndGame(table : YamsTable){
        const updatedTable = await this.yamsService.closeTable(table)
        const result = await this.yamsService.setPlayersScores(table)
        await this.yamsService.updateYamsStats(result.winnerId, result.playersScores)
        await this.sendGameState(table as YamsTable)
        this.io.to(table.id).emit("yams:table", updatedTable)

    }

    cleanup(socket : TypedSocket){
        socket.removeAllListeners("yams:rollDice");
        socket.removeAllListeners("yams:registerDiceResult");
        this.sockets.delete(socket.id)
       
    }







}