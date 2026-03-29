import type { Table, BeloteTable } from "$lib/types/table";
import type { User } from "$lib/types/user";
import type { DeleteResult } from "mongodb";
import type { Card, BeloteBid, BeloteState, BeloteTableState, UserBeloteState, Suit } from "$lib/types/games/belote";
import type { GameServices } from "$lib/types/services/gameServices";
import type { TableRepository } from "../core/repositories/TableRepository";
import { AuctionManager } from "./core/auctionManager";
import type { UserRepository } from "../core/repositories/UserRepository";
import type { BeloteRepo } from "./BeloteRepo";
import { registerTeams } from "./core/createTeam";
import { BeloteLoader } from "./core/beloteLoader";
import { isSameCard, TRUMP_CARD_VALUE } from "./core/cardManager";
import { PlayableCardManager } from "./core/playableCardManager";
import { TrickManager } from "./core/trickManager";
import { ScoreManager } from "./core/scoreManager";
import { EndGameManager } from "./core/endGameManager";
import { EndDeal } from "./core/endDeal";

const TIMEOUT_DURATION = 1000

export class BeloteService implements GameServices {
    constructor(
        private beloteRepo : BeloteRepo,
        private tableRepo : TableRepository,
        private userRepo : UserRepository
    ){}

    async onPlayerLeave(userId : User["id"]) {
        console.log("player left, userState deleted : ", userId)
        await this.beloteRepo.delete(userId)
    }

    async onAbortTable(ids: User["id"][]): Promise<DeleteResult> {
         return this.beloteRepo.deleteMany(ids)
    }

    async getOpponentsGameState(tableId: Table["id"], ids: User["id"][]) : Promise<UserBeloteState[]> {
        return this.beloteRepo.getUsersBeloteState(ids)
    }

    async getUserBeloteState(id: User["id"]){
        return this.beloteRepo.getGameState(id)
    }

    async createTeams(table : BeloteTable) : Promise<BeloteTable>{
        const teams = registerTeams(table.playersId)
        const teamA = teams[0].players
        const teamB = teams[1].players
        const newPlayersId = [teamA[0], teamB[0], teamA[1], teamB[1]]
        const newTableState = {...table.gameState, teams, state : "teams" as BeloteState}
        await this.tableRepo.update(table.id, {gameState : newTableState, playersId : newPlayersId})
        return {...table, playersId : newPlayersId, gameState : newTableState}
    }

    async startAuction(table : BeloteTable){
        const usersBeloteState = await this.beloteRepo.getUsersBeloteState(table.playersId)
        const beloteLoader = new BeloteLoader(usersBeloteState, table)
        const res = beloteLoader.execute();
        await this.tableRepo.update(table.id, {gameState : res.gameState})
        await Promise.all(
            usersBeloteState.map(u => {
                const hand = res.hands.get(u.id);
                return this.beloteRepo.update(u.id, { hand });
            })
        )
        return {...table, gameState : res.gameState}
    }

    getFirstPlayer(ids : string[], gameState : BeloteTableState){
        return ids[(gameState.round-1) % ids.length]
    }
    
    async handleNewBid(tableId : string, userId : string, bid : BeloteBid, suit : Suit) : Promise<Table>{
        console.log("handle new bid :", bid)
        const table = await this.tableRepo.getTableById(tableId) as BeloteTable
        const hand = (await this.beloteRepo.getGameState(userId)).hand
        const auctionManager = new AuctionManager(table)
        const potentialTrump = table.gameState.potentialTrump
        if (!potentialTrump) return table
        const res = auctionManager.resolve(userId, bid, suit)
        let gameState = res.gameState
        
        if (res.status === "continueAuction" || res.status ===  'endFirstRoundAuction'){ 
            gameState = this.nextPlayer({...table, gameState}, userId)
        }
        if (res.status === "endAuction"){ 
            const newHand = [...hand, potentialTrump]
            await this.beloteRepo.update(res.userHasTaken, {hasTaken : true, hand : newHand})
            const newCurrentPlayer = this.getFirstPlayer(table.playersId, gameState)
            gameState = {...gameState, currentPlayer : newCurrentPlayer}
        }
        if (res.status === "restartAuction"){
            await Promise.all(
                table.playersId.map(id => 
                    this.beloteRepo.update(id, {hasBid : false, bid : null, hasTaken : false, hand : []})
                )
            )
            return await this.startAuction({...table, gameState})
        }
        await this.tableRepo.update(tableId, {gameState : gameState})
        await this.beloteRepo.update(userId, {hasBid : true, bid : bid})
        return {...table, gameState}
    }

    async endDeal(table : BeloteTable) : Promise<BeloteTable>{
        const users = await this.beloteRepo.getUsersBeloteState(table.playersId)
        const endDealManager = new EndDeal(users, table)
        const res = endDealManager.execute()
        await this.tableRepo.update(table.id, {gameState : res.gameState})
        await Promise.all(
            users.map(u => {
                const hand = res.hands.get(u.id);
                return this.beloteRepo.update(u.id, { hand });
            })
        )
        return {...table, gameState : res.gameState}
    }

    private nextPlayer(table: BeloteTable, userId : User["id"]): BeloteTableState {
        const ind = table.playersId.indexOf(userId);
        const newPlayerId = table.playersId[(ind + 1) % table.playersId.length];
        console.log('next turn belote : ', newPlayerId)
        return {...table.gameState, currentPlayer : newPlayerId}
    }

    async checkPlayableCard(hand : Card[], table : BeloteTable, card : Card) : Promise<boolean>{
        console.log("check playable card :", card)
        const trick = new Map(Object.entries(table.gameState.trick));
        const playableCardsManager = new PlayableCardManager(table.gameState.trickSuit, table.gameState.playedTrumps, table.gameState.trumpSuit, trick)
        return playableCardsManager.execute(card, hand)
    }
     
    async playCard(userGameState : UserBeloteState, table : BeloteTable, card : Card) : Promise<BeloteTable> {
        console.log("play card :", card)
        const trick = new Map(Object.entries(table.gameState.trick))
        const trickManager = new TrickManager(trick, table.gameState.trickSuit, table.gameState.playedTrumps, table.gameState.trumpSuit)
        let hand = userGameState.hand
        if (userGameState.hand.some((c) => isSameCard(c, card))) {
            trickManager.set(userGameState.id, card)
            hand = hand.filter((c) => !isSameCard(c, card));
        }
        const data = trickManager.getData()
        const newTableState = {...table.gameState, trick : data.trick, trickSuit : data.trickSuit, playedTrumps : data.playedTrumps}
        await this.tableRepo.update(table.id, {gameState : newTableState})
        await this.beloteRepo.update(userGameState.id, {hand, hasPlayed : true, playedCard : card})
        return {...table, gameState : newTableState}
    }

    async playRandomCard(userGameState : UserBeloteState, table : BeloteTable){
        console.log('select random card')
        const trick = new Map(Object.entries(table.gameState.trick));
        const playableCardsManager = new PlayableCardManager(table.gameState.trickSuit, table.gameState.playedTrumps, table.gameState.trumpSuit, trick)
        const card = playableCardsManager.selectRandomCard(userGameState.hand)
        return this.playCard(userGameState, table, card)
    }

    async checkNextState(table : BeloteTable){
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
            const player = await this.beloteRepo.getGameState(playerId)
            if (player?.hand.length !== 0) {
                handEmpty = false 
            }
        }
        return handEmpty
    }

    async handleNewState(tableState : string, table : BeloteTable, userId : string) : Promise<BeloteTable>{
        switch (tableState) {
            case 'endRound':
                await new Promise((r) => setTimeout(r, TIMEOUT_DURATION));
                return this.handleEndRound(await this.handleEndTrick(table));
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

    private async handleEndRound(table : BeloteTable) : Promise<BeloteTable>{
        console.log("end round")
        const taker = await this.beloteRepo.getTaker(table.playersId)
        const usersGameState = await this.beloteRepo.getUsersBeloteState(table.playersId)
        const scoreManager = new ScoreManager(table, usersGameState, taker)
        const points = scoreManager.compute()
        const {takersFinalScore, defFinalScore, status, takersBelote, defBelote , takersScore} = scoreManager.getFinalScore(points)
        const roundDataScore = {status, takersFinalScore, takersScore, takersBelote, defFinalScore, defBelote}
        
        await Promise.all(
            table.playersId.map(async (id) => {
                const user = await this.beloteRepo.getGameState(id)
                const newUserState = {
                    bid : null,
                    hasBid : false, 
                    hasTaken : false,
                    cardsWon : [],
                    declaredBelote : false, 
                    hasPlayed : false, 
                    playedCard : null, 
                }
                await this.beloteRepo.update(user.id, {...newUserState})
            })
        )

        let litige = false
        if (status === "litige"){
            litige = true
        }
        let round = table.gameState.round
        const scores = new Map(Object.entries(table.gameState.scores))
        const scoreTeam : Map<string, number> = new Map()
        const teams = table.gameState.teams

        if (!teams) return table
        teams.forEach(t => {
            if (t.players.includes(taker.id)){
                t.score += takersFinalScore
                scoreTeam.set(t.id, takersFinalScore )
            } else {
                t.score += defFinalScore
                scoreTeam.set(t.id, defFinalScore )
            }
        })

        scores.set(round.toString(), Object.fromEntries(scoreTeam))
        
        round++
        const newTableState = {...table.gameState, state : "endRound" as BeloteState, round, teams, scores : Object.fromEntries(scores), roundDataScore, litige}
        await this.tableRepo.update(table.id, {gameState : newTableState})
        return {...table, gameState : newTableState}
    }

    async resetTable(table : BeloteTable) : Promise<BeloteTable>{
        const tableGameState = table.gameState
        const newTableState = {
            ...tableGameState,
            bidMap : Object.fromEntries(new Map()),
            trick : Object.fromEntries(new Map()), 
            tricks : [],
            lastTrick : [],
            trickSuit : null, 
            playedTrumps : [],
            lastTrickWinner : "", 
            currentPlayer : "",
            potentialTrump : null, 
            trumpSuit : null, 
            deck : [],
            auctionRound : 1 as const
        }
        await this.tableRepo.update(table.id, {gameState : newTableState})
        return {...table, gameState : newTableState}
    }

    private async handleEndTrick(table : BeloteTable) : Promise<BeloteTable>{
        console.log('end trick')
        const trick = new Map(Object.entries(table.gameState.trick))
        const trickManager = new TrickManager(trick, table.gameState.trickSuit, table.gameState.playedTrumps, table.gameState.trumpSuit)
        const winnerId = trickManager.getTrickWinner()
        const winnerGameState = await this.beloteRepo.getGameState(winnerId)
        console.log("-------- winner trick --------> :", winnerGameState.username)
        const res = trickManager.updateCardsWon(winnerGameState.cardsWon)
        await this.beloteRepo.update(winnerId, {cardsWon : res})
        await Promise.all(
            table.playersId.map(id => 
                this.beloteRepo.update(id, {hasPlayed : false, playedCard : null} )
            )
        )
        await this.tableRepo.updatePush(table.id, {"gameState.tricks" : table.gameState.trick})
        const lastTrick = [...trick.values()]
        const lastTrickWinner = winnerId
        const newTableState = {...table.gameState, currentPlayer : winnerId, trick : Object.fromEntries(new Map()), trickSuit : null, playedTrumps : [], lastTrick, lastTrickWinner }
        await this.tableRepo.update(table.id, {gameState : newTableState})
        return {...table, gameState : newTableState}
    }

    private async continueTrick(table: BeloteTable, userId : string) : Promise<BeloteTable> {
        console.log('next player to play a card')
        const tableState = this.nextPlayer(table, userId)
        return {...table, gameState : tableState}
    }

    checkEndGame(table : BeloteTable){
        console.log('check end game')
        const scoreMode = table.gameState.scoreMode
        if (scoreMode === "12"){
            return table.gameState.round >= 12
        } else {
            const teams = table.gameState.teams
            if (!teams) return false 
            return teams.some(t => t.score >= 1000)
        }
    }

    async gameOver(table : BeloteTable){
        console.log('game over')
        // const usersGameState = await this.beloteRepo.getUsersBeloteState(table.playersId)
        const usersStats = await this.userRepo.getUsersStats(table.playersId)
        const teams = table.gameState.teams
        if (!teams) return table
        const endGameManager = new EndGameManager(teams)
        const res = endGameManager.execute()

        await Promise.all(
            usersStats.map(u => {
                const score = res.playersScore.get(u.id)
                let games = u.belote.games
                let win = u.belote.victories
                let highest = u.belote.highestScore
                games++
                if (res.winners.includes(u.id)) win++
                if (score && score > highest) {highest = score}
                const newBeloteStats = {games, victories : win, highestScore : highest }
                this.userRepo.updateStats(u.id, {belote : newBeloteStats})
            })
        )
        const newTableState = {...table.gameState, state : "endGame" as BeloteState}
        await this.tableRepo.update(table.id, {completed : true, gameState : newTableState})
        return {...table, completed : true,  gameState : newTableState}
    }


    async checkPlayerHasBelote(ids : string[], trumpSuit : Suit | null){
        if (!trumpSuit) return
        const users = await this.beloteRepo.getUsersBeloteState(ids)
        for (const u of users) {
            const hasBelote =
                u.hand.some(c => TRUMP_CARD_VALUE[c.value] === 3 && c.suit === trumpSuit) &&
                u.hand.some(c => TRUMP_CARD_VALUE[c.value] === 4 && c.suit === trumpSuit)

            if (hasBelote) {
                await this.beloteRepo.update(u.id, { declaredBelote: true })
                return
            }
        }
    }

    cardBelotePlayed(user : UserBeloteState, table : BeloteTable){
        if (!user.declaredBelote) return false
        const trick = table.gameState.trick
        const lastCard = Object.values(trick).pop()
        if (!lastCard) return false
        const isKingOrQueen = TRUMP_CARD_VALUE[lastCard.value] === 3 || TRUMP_CARD_VALUE[lastCard.value] === 4 
        const isTrump = lastCard.suit === table.gameState.trumpSuit
        return isKingOrQueen && isTrump
    }

}
