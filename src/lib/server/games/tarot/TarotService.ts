import type { Table, TarotTable } from "$lib/types/table";
import type { User } from "$lib/types/user";
import type { DeleteResult } from "mongodb";
import type { TarotRepo } from "./TarotRepo";
import type { Card, Handful, TarotBid, TarotState, TarotTableState, UserTarotState } from "$lib/types/games/tarot";
import type { GameServices } from "$lib/types/services/gameServices";
import type { TableRepository } from "../core/repositories/TableRepository";
import { AuctionManager } from "./core/AuctionManager";
import { TarotLoader } from "./core/TarotLoader";
import { DogManager } from "./core/DogManager";
import type { HandfulResponse } from "$lib/client/games/tarot/TarotController.svelte";
import { TrickManager } from "./core/TrickManager";
import { isSameCard } from "./core/CardManager";
import { PlayableCardManager } from "./core/PlayableCardManager";
import { ScoreManager } from "./core/ScoreManager";
import { EndGameManager } from "./core/EndGameManager";
import type { UserRepository } from "../core/repositories/UserRepository";

const TIMEOUT_DURATION = 1000

export class TarotService implements GameServices {
    constructor(
        private tarotRepo : TarotRepo,
        private tableRepo : TableRepository,
        private userRepo : UserRepository
    ){}

    async onPlayerLeave(userId : User["id"]) {
        console.log("player left, userState deleted : ", userId)
        await this.tarotRepo.delete(userId)
    }

    async onAbortTable(ids: User["id"][]): Promise<DeleteResult> {
         return this.tarotRepo.deleteMany(ids)
    }

    async getOpponentsGameState(tableId: Table["id"], ids: User["id"][]) : Promise<UserTarotState[]> {
        return this.tarotRepo.getUsersTarotState(ids)
    }

    async getUserTarotState(id: User["id"]){
        return this.tarotRepo.getGameState(id)
    }

    async startGame(table : TarotTable){
        const usersTarotState = await this.tarotRepo.getUsersTarotState(table.playersId)
        const tarotLoader = new TarotLoader(usersTarotState, table)
        const res = tarotLoader.execute();
        await this.tableRepo.update(table.id, {gameState : res.gameState})
        await Promise.all(
            usersTarotState.map(u => {
                const hand = res.hands.get(u.id);
                return this.tarotRepo.update(u.id, { hand });
            })
        )
        return {...table, gameState : res.gameState}
    }

    getFirstPlayer(ids : string[], gameState : TarotTableState){
        return ids[((gameState.round + gameState.auctionRound)-1) % ids.length]
    }
    
    async handleNewBid(tableId : string, userId : string, bid : TarotBid) : Promise<Table>{
        console.log("handle new bid :", bid)
        const table = await this.tableRepo.getTableById(tableId) as TarotTable
        const auctionManager = new AuctionManager(table)
        const res = auctionManager.resolveBid(userId, bid)
        let gameState = res.gameState
        
        if (res.status === "continueAuction"){ 
            gameState = this.nextPlayer({...table, gameState}, userId)
        }
        if (res.status === "endAuction"){ 
            await this.tarotRepo.update(res.userHasTaken, {hasTaken : true})
            const newCurrentPlayer = this.getFirstPlayer(table.playersId, gameState)
            gameState = {...gameState, currentPlayer : newCurrentPlayer}
        }
        if (res.status === "restartAuction"){
            await Promise.all(
                table.playersId.map(id => 
                    this.tarotRepo.update(id, {hasBid : false, bid : null, hasTaken : false, hand : []})
                )
            )
            return await this.startGame({...table, gameState})
        }
        await this.tableRepo.update(tableId, {gameState : gameState})
        await this.tarotRepo.update(userId, {hasBid : true, bid : bid})
        return {...table, gameState}
    }

    private nextPlayer(table: TarotTable, userId : User["id"]): TarotTableState {
        const ind = table.playersId.indexOf(userId);
        const newPlayerId = table.playersId[(ind + 1) % table.playersId.length];
        console.log('next turn tarot : ', newPlayerId)
        return {...table.gameState, currentPlayer : newPlayerId}
    }

    async handleDog(userId : string, tableId : string, card : Card){
        console.log("handle dog :", card)
        const table = await this.tableRepo.getTableById(tableId) as TarotTable
        const userGameState = await this.tarotRepo.getGameState(userId)
        const dogManager = new DogManager(table , userGameState)
        const res = dogManager.handle(card)
        const newTableState = {...table.gameState, dog : res.dog}
        await this.tableRepo.update(tableId, {gameState : newTableState})
        await this.tarotRepo.update(userId, {hand : res.hand, cardsWon : res.cardsWon})
        return {
            table : {...table, gameState : newTableState}, 
            userGameState : {...userGameState, hand : res.hand, cardsWon : res.cardsWon}
        }
    }

    async selectRandomDog(userId : string, tableId : string){
        console.log('select random chien')
        const table = await this.tableRepo.getTableById(tableId) as TarotTable
        const userGameState = await this.tarotRepo.getGameState(userId)
        const dogManager = new DogManager(table , userGameState)
        const res = dogManager.selectRandomDog()
        const newTableState = {...table.gameState, dog : res.dog}
        await this.tableRepo.update(tableId, {gameState : newTableState})
        await this.tarotRepo.update(userId, {hand : res.hand, cardsWon : res.cardsWon})
        return {
            table : {...table, gameState : newTableState}, 
            userGameState : {...userGameState, hand : res.hand, cardsWon : res.cardsWon}
        }
    }

    async registerDog(userId : string, tableId : string){
        console.log("register dog")
        const table = await this.tableRepo.getTableById(tableId) as TarotTable
        const user = await this.tarotRepo.getGameState(userId)
        const newGameState = {...table.gameState, state : "beforeRound" as TarotState, dog : [...user.cardsWon]}
        await this.tableRepo.update(tableId, {gameState : newGameState})
        return {...table, gameState : newGameState}
    }

    async checkHandful(userId : string) : Promise<HandfulResponse> {
        console.log("check handful :", userId)
        const userGameState = await this.tarotRepo.getGameState(userId)
        const atoutInHand = userGameState.hand.filter(c => c.suit === "atout")
        const hasHandful = atoutInHand.length >= 10
        const handfulSize = 
            atoutInHand.length >= 15 ? 15 :
            atoutInHand.length >= 13 ? 13 :
            atoutInHand.length >= 10  ? 10 : 0;
        return {hasHandful, handfulSize}
    }

    async handleSlam(userId : string, tableId : string){
        console.log("register slam")
        const table = await this.tableRepo.getTableById(tableId) as TarotTable
        const firstPlayerId = table.gameState.currentPlayer
        let gameState = table.gameState
        if (firstPlayerId !== userId){
            gameState = {...gameState, currentPlayer : userId}
            await this.tableRepo.update(tableId, {gameState : gameState})
        }
        await this.tarotRepo.update(userId, {declaredSlam : true})
        return {userIsNotFirstPlayer : firstPlayerId !== userId}
    }

    async handleHandful(userId : string, tableId : string, handfulSize : Handful){
        console.log("register handful")
        const handfuls : Map<string, Card[]> = new Map()
        const userGameState = await this.tarotRepo.getGameState(userId)
        const hand = userGameState.hand
        const handful = hand.filter(c => c.suit === "atout").slice(0, handfulSize)
        handfuls.set(userGameState.username, handful)

        const table = await this.tableRepo.getTableById(tableId) as TarotTable
        const tableState = {...table.gameState, handfuls : Object.fromEntries(handfuls)}
        await this.tarotRepo.update(userId, {declaredHandful : handfulSize })
        await this.tableRepo.update(tableId, {gameState : tableState})
        return {
            table : {...table, gameState : tableState},
            userGameState : {...userGameState, declaredHandful : handfulSize}
        }
    }

    async checkStateHandfulOrRound(tableId : string){
        console.log("check state showhandful or round")
        const table = await this.tableRepo.getTableById(tableId) as TarotTable
        const handfuls = new Map(Object.entries(table.gameState.handfuls))
        let tableState = table.gameState
        if (handfuls.size != 0){
            tableState = {...tableState, state : "showHandful"}
        } else {
            tableState = {...tableState, state : "round" }
        }
        await this.tableRepo.update(tableId, {gameState : tableState})
        return {...table, gameState : tableState}
    }

    async endShowHandful(table : TarotTable){
        const tableState = {...table.gameState, state : "round" as TarotState}
        await this.tableRepo.update(table.id, {gameState : tableState})
        return {...table, gameState : tableState}
    }

    async checkPlayableCard(hand : Card[], table : TarotTable, card : Card) : Promise<boolean>{
        console.log("check playable card :", card)
        const playableCardsManager = new PlayableCardManager(table.gameState.trickColor, table.gameState.playedAtouts)
        return playableCardsManager.execute(card, hand)
    }
     
    async playCard(userGameState : UserTarotState, table : TarotTable, card : Card) : Promise<TarotTable> {
        console.log("play card :", card)
        const trick = new Map(Object.entries(table.gameState.trick))
        const trickManager = new TrickManager(trick, table.gameState.trickColor, table.gameState.playedAtouts)
        let hand = userGameState.hand
        if (userGameState.hand.some((c) => isSameCard(c, card))) {
            trickManager.set(userGameState.id, card)
            hand = hand.filter((c) => !isSameCard(c, card));
        }
        const data = trickManager.getData()
        const newTableState = {...table.gameState, trick : data.trick, trickColor : data.trickColor, playedAtouts : data.playedAtouts}
        await this.tableRepo.update(table.id, {gameState : newTableState})
        await this.tarotRepo.update(userGameState.id, {hand, hasPlayed : true, playedCard : card})
        return {...table, gameState : newTableState}
    }

    async playRandomCard(userGameState : UserTarotState, table : TarotTable){
        console.log('select random card')
        const playableCardsManager = new PlayableCardManager(table.gameState.trickColor, table.gameState.playedAtouts)
        const card = playableCardsManager.selectRandomCard(userGameState.hand)
        return this.playCard(userGameState, table, card)
    }

    async checkNextState(table : TarotTable){
        console.log("check next state")
        const trick = new Map(Object.entries(table.gameState.trick));
        const ids = table.playersId
        const isEndRound = await this.areHandsEmpties(ids);
        const isEndTrick = trick.size === ids.length;
        return isEndRound ? 'endRound' : isEndTrick ? 'endTrick' : 'continueTrick';
    }

    private async areHandsEmpties(playersId : string[]){
        let handEmpty = true 
        for (const playerId of playersId){
            const player = await this.tarotRepo.getGameState(playerId)
            if (player?.hand.length !== 0) {
                handEmpty = false 
            }
        }
        return handEmpty
    }

    async handleNewState(tableState : string, table : TarotTable, userId : string) : Promise<TarotTable>{
        switch (tableState) {
            case 'endRound':
                await new Promise((r) => setTimeout(r, TIMEOUT_DURATION));
                return this.handleEndRound(table);
            case 'endTrick':
                await new Promise((r) => setTimeout(r, TIMEOUT_DURATION));
                return this.handleEndTrick(table);
            case 'continueTrick':
                return this.continueTrick(table, userId);
            default:
                console.log('error in turn state');
                return table
        }
    }

    private async handleEndRound(table : TarotTable) : Promise<TarotTable>{
        console.log("end round")
        const taker = await this.tarotRepo.getTaker(table.playersId)
        const scoreManager = new ScoreManager(table, taker)
        const points = scoreManager.compute()
        const {contrat, hasWin, takerScore, defScore, scoreData} = scoreManager.getMarque(points)
        let round = table.gameState.round
        if (round < table.gameState.maxRound){round++}
        await Promise.all(
            table.playersId.map(async (id) => {
                const user = await this.tarotRepo.getGameState(id)
                let score = user.score
                const newUserState = {
                    bid : null,
                    hasBid : false, 
                    hasTaken : false,
                    cardsWon : [],
                    declaredSlam : false, 
                    declaredHandful : null, 
                    hasPlayed : false, 
                    playedCard : null, 
                }
                if (user.hasTaken){
                    score += takerScore
                    await this.tarotRepo.update(user.id, {...newUserState, score, hasWin, contrat})
                } else {
                    score += defScore
                    await this.tarotRepo.update(user.id, {...newUserState, score})
                }
            })
        )
        const newTableState = {...table.gameState, state : "afterRound" as TarotState, round, roundDataScore : scoreData}
        await this.tableRepo.update(table.id, {gameState : newTableState})
        return {...table, gameState : newTableState}
    }

    async resetTable(table : TarotTable) : Promise<TarotTable>{
        const tableGameState = table.gameState
        const newTableState = {
            ...tableGameState,
            bidMap : Object.fromEntries(new Map()),
            actualBid : 0, 
            trick : Object.fromEntries(new Map()), 
            tricks : [],
            lastTrick : [],
            trickColor : null, 
            playedAtouts : [], 
            currentPlayer : "", 
            dog : [],
            handfuls : Object.fromEntries(new Map()),
            finalScores : Object.fromEntries(new Map()),
            roundDataScore : {oudlers : 0 as const, contrat : null, score : 0, hasWin : false, coef : 1 as const, marque : 0, 
                    bonusHandfulDef : 0 as const, bonusHandfulTaker : 0 as const, bonusPetitAuBout : 0 as const, bonusSlam : 0 as const, 
                    takerScore : 0, defScore : 0
            }
        }
        await this.tableRepo.update(table.id, {gameState : newTableState})
        return {...table, gameState : newTableState}
    }

    private async handleEndTrick(table : TarotTable) : Promise<TarotTable>{
        console.log('end trick')
        const trick = new Map(Object.entries(table.gameState.trick))
        const trickManager = new TrickManager(trick, table.gameState.trickColor, table.gameState.playedAtouts)
        const taker = await this.tarotRepo.getTaker(table.playersId)
        const winnerId = trickManager.getTrickWinner(table.gameState.tricks, taker)
        const winnerGameState = await this.tarotRepo.getGameState(winnerId)
        const res = trickManager.updateCardsWon(winnerGameState.cardsWon, winnerId)
        if (res.excuseOwner){
            await this.tarotRepo.updatePush(res.excuseOwner, {cardsWon : {value : 0, suit : "atout"}})
        }
        await this.tarotRepo.update(winnerId, {cardsWon : res.cardsWon})
        await Promise.all(
            table.playersId.map(id => 
                this.tarotRepo.update(id, {hasPlayed : false, playedCard : null} )
            )
        )
        await this.tableRepo.updatePush(table.id, {"gameState.tricks" : table.gameState.trick})
        const lastTrick = [...trick.values()]
        const newTableState = {...table.gameState, currentPlayer : winnerId, trick : Object.fromEntries(new Map()), trickColor : null, playedAtouts : [], lastTrick }
        await this.tableRepo.update(table.id, {gameState : newTableState})
        return {...table, gameState : newTableState}
    }

    private async continueTrick(table: TarotTable, userId : string) : Promise<TarotTable> {
        console.log('next player to play a card')
        const tableState = this.nextPlayer(table, userId)
        return {...table, gameState : tableState}
    }

    checkEndGame(table : TarotTable){
        console.log('check end game')
        return table.gameState.round >= table.gameState.maxRound
    }

    async gameOver(table : TarotTable){
        console.log('game over')
        const usersGameState = await this.tarotRepo.getUsersTarotState(table.playersId)
        const usersStats = await this.userRepo.getUsersStats(table.playersId)
        const endGameManager = new EndGameManager(usersGameState)
        const res = endGameManager.execute()
        await Promise.all(
            usersStats.map(u => {
                const score = res.playersScore.get(u.username)
                let games = u.tarot.games
                let win = u.tarot.victories
                let highest = u.tarot.highestScore
                games++
                if (res.winnerId === u.id) win++
                if (score && score > highest) {highest = score}
                const newTarotStats = {games, victories : win, highestScore : highest }
                this.userRepo.updateStats(u.id, {tarot : newTarotStats})
            })
        )
        const newTableState = {...table.gameState, state : "endGame" as TarotState, finalScores : Object.fromEntries(res.playersScore)}
        await this.tableRepo.update(table.id, {completed : true, gameState : newTableState})
        return {...table, completed : true,  gameState : newTableState}
    }



}