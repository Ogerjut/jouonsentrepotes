import type { Table, YamsTable } from "$lib/types/table";
import type { User } from "$lib/types/user";
import type { DeleteResult } from "mongodb";
import { YamsRepo } from "./YamsRepo";
import type { DiceResult, FinalScore, Launches, UserYamsState, YamsTableState } from "$lib/types/games/yams";
import type { GameServices } from "$lib/types/services/gameServices";
import type { YamsServices } from "$lib/types/services/yamsServices";
import type { UserRepository } from "../core/repositories/UserRepository";
import type { TableRepository } from "../core/repositories/TableRepository";
import { Dice, DicesManager } from "./yamsEntities";
import { ScoreManager } from "./scoreManager";
import { DiceResultManager } from "./diceResultManager";
import { EndGameScore } from "./endGameManager";

export class YamsService implements GameServices, YamsServices{
    constructor(
        private userYamsRepo : YamsRepo,
        private userRepo : UserRepository,
        private tableRepo : TableRepository
    ){}

    async getUserYamsState(id: User["id"]){
        return this.userYamsRepo.getGameState(id)
    }

    async onPlayerLeave(userId : User["id"]) {
        console.log('deleted userYamsState')
        await this.userYamsRepo.delete(userId)
    }

    async getOpponentsGameState(tableId: Table["id"], ids: User["id"][]) : Promise<UserYamsState[]> {
        return this.userYamsRepo.getUsersYamsState(ids)
    }

    async onAbortTable(ids: User["id"][]): Promise<DeleteResult> {
        return this.userYamsRepo.deleteMany(ids)
    }

    async initYams(table : YamsTable) : Promise<YamsTable>{
        const gameState = table.gameState
        gameState.round = 1
        gameState.state = "game"
        gameState.currentPlayer = table.playersId[(table.gameState.round - 1) % table.playersId.length]
        gameState.dices = Array.from({ length: 5 }, (_, i) => new Dice(i+1) );
        await this.tableRepo.update(table.id, {gameState : gameState})
        return this.tableRepo.getTableById(table.id)  as unknown as YamsTable
    }

    async getTableState(tableId : Table["id"]) : Promise<YamsTableState> {
        return this.tableRepo.getTableState(tableId) as unknown as YamsTableState
    }

    rollDices(kept : Dice[]) : Dice[] {
        const dicesManager = new DicesManager(kept)
        dicesManager.launchDices()
        return dicesManager.dices
    }
    
    async getPossibleResults(dices: Dice[], listResults : DiceResult[]): Promise<DiceResult[]> {
        const scoreManager = new ScoreManager(dices, listResults)
        scoreManager.compute()
        return scoreManager.items
    }

    async updateAfterRolledDices(userId: User["id"], table : YamsTable, userYamsState : UserYamsState, possibleDiceResult: DiceResult[], dices : Dice[]): Promise<{table : YamsTable, userState : UserYamsState}> {
        if (userYamsState.launches <= 0) return {table, userState : userYamsState}
        const newLaunches = (userYamsState.launches - 1) as Launches
        const newGameState = {...table.gameState, dices}

        // faire promise.all() pour éviter que seulement l'un des deux soit maj en cas de problème
        await this.userYamsRepo.update(userId, {launches : newLaunches , listResults : possibleDiceResult })
        await this.tableRepo.update(table.id, { gameState : newGameState })

        return {
            table : {...table, gameState : newGameState} ,
            userState : {...userYamsState, launches : newLaunches, listResults : possibleDiceResult}
        }
    }

    async registerDiceResult(userId : User["id"], userYamsState : UserYamsState, diceResult: DiceResult): Promise<{updatedUserYamsState : UserYamsState}> {
        const listResultsManager = new DiceResultManager(userYamsState.listResults, diceResult)
        listResultsManager.updateItems()
        const newListResult = listResultsManager.diceResults
        await this.userYamsRepo.update(userId, {listResults : newListResult, launches : 3})
        return {updatedUserYamsState : {...userYamsState, listResults : newListResult, launches : 3}} 
    }

    async checkEndGame(ids: User["id"][]): Promise<boolean> {
        let endgame = true 
        const players = await this.userYamsRepo.getUsersYamsState(ids)
        players.forEach(p => {
            const listResults = p.listResults
            if (listResults.filter(r => r.done === false).length != 0){
                endgame = false
            }
        })
        console.log("endgame : ", endgame)
        return endgame
    }

    async nextTurn(table: YamsTable, userId : User["id"]): Promise<{updatedTable : YamsTable}> {
        console.log('next turn')
        const dicesManager = new DicesManager(table.gameState.dices)
        dicesManager.resetDices()
        const newDices = dicesManager.dices
        const ind = table.playersId.indexOf(userId);
	    const newPlayerId = table.playersId[(ind + 1) % table.playersId.length];
        const newGameState = {...table.gameState, currentPlayer : newPlayerId, dices :  newDices}
        await this.tableRepo.update(table.id, {gameState : newGameState})
        return {updatedTable : {...table, gameState : newGameState} }
    }

    async closeTable(table: YamsTable): Promise<YamsTable> {
        const gameState = table.gameState
        const newGameState = {...gameState, state : "endGame" as const}
        const newTable = {...table, gameState : newGameState, completed : true }
        await this.tableRepo.update(table.id, {completed : true, gameState : newGameState})
        return newTable
    }

    async setPlayersScores(table: YamsTable): Promise<{ winnerId: string; playersScores: Map<string, FinalScore> }> {
        const playersScores = new Map<string, FinalScore>()
        const players = await this.userYamsRepo.getUsersYamsState(table.playersId)
        
        const scores = players.map(p => ({
            id: p.id,
            score: new EndGameScore(p).scoreToJSON()
        }))

        scores.forEach(s => playersScores.set(s.id, s.score))

        await Promise.all(
            scores.map(s =>
                this.userYamsRepo.update(s.id, { finalScore: s.score })
            )
        )

        const winnerId = this.getWinnerId(playersScores)
        return {winnerId : winnerId, playersScores : playersScores}

    }

    getWinnerId(playersScores : Map<string, FinalScore>){
        let max = 0
        let winner = ""
        playersScores.forEach((score, id) => {
            if (score.total > max){
                max = score.total
                winner = id
            }
        })
        return winner
    }

    async updateYamsStats(winnerId : string, playersScores : Map<string, FinalScore>){
        await Promise.all(
            Array.from(playersScores.entries()).map(async ([id, p]) => {
                const userStats = await this.userRepo.getUserStatsById(id)
                const games = userStats.yams.games + 1
                const highestScore = Math.max(p.total,userStats.yams.highestScore)
                const victories = id === winnerId ? userStats.yams.victories + 1 : userStats.yams.victories
                await this.userRepo.updateStats(id, {yams : {...userStats.yams, victories : victories, games : games, highestScore : highestScore} })
                }
            )
        )
    }
}