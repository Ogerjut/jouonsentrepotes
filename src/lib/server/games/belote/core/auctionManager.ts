import type { BeloteBid, BeloteState, BeloteTableState, Suit } from "$lib/types/games/belote";
import type { BeloteTable } from "$lib/types/table";


type AuctionResolution =
  | { status: "restartAuction"; gameState: BeloteTableState }
  | { status: "endAuction"; gameState: BeloteTableState; userHasTaken: string }
  | { status: "continueAuction"; gameState: BeloteTableState }
  | { status: "endFirstRoundAuction"; gameState: BeloteTableState }
  | { status: "error",  gameState: BeloteTableState}

export class AuctionManager {
    private table : BeloteTable
    private bidMap : Map<string, BeloteBid>
    private auctionRound : 1 | 2


    constructor(table : BeloteTable){
        this.table = table
        this.bidMap = new Map(Object.entries(this.table.gameState.bidMap))
        this.auctionRound = table.gameState.auctionRound
    }

    private getAuctionOver(bid : BeloteBid){
        return this.bidMap.size === this.table.maxPlayers || bid === 1
    }

    private getUserIdHasTaken(){
        let userId : string | null = null
        this.bidMap.forEach((bid, id) => {
            if (bid === 1){
               userId = id
            }
        });
         return userId
    }


    private resetTableGameState(){
        const round = this.table.gameState.round
        const newCurrentPlayer = this.table.playersId[(round-1) % this.table.playersId.length]
        const resetGameState : BeloteTableState = {
            ...this.table.gameState,
            bidMap : Object.fromEntries(new Map()), 
            currentPlayer : newCurrentPlayer, 
            state : "auction", 
            deck : [],
            potentialTrump : null,
            auctionRound : 1,
            trumpSuit : null
            
        }
        return resetGameState
    }

    resolve(userId : string, bid : BeloteBid, suit : Suit) : AuctionResolution{
        this.bidMap.set(userId, bid)
        if (!this.getAuctionOver(bid)){
            const newGameState = {...this.table.gameState, bidMap : Object.fromEntries(this.bidMap)}
            return {status : "continueAuction", gameState : newGameState}
        }
        
        const userHasTaken = this.getUserIdHasTaken()
        if (this.auctionRound === 1){
            if (userHasTaken){
                if (!this.table.gameState.potentialTrump) return {status : 'error', gameState : this.table.gameState}
                const trumpSuit = this.table.gameState.potentialTrump?.suit
                const newGameState = {...this.table.gameState, state : "endDeal" as BeloteState, bidMap : Object.fromEntries(this.bidMap), trumpSuit }
                return {status : "endAuction", gameState : newGameState, userHasTaken } 
            } else {
                this.auctionRound = 2
                this.bidMap.clear()
                const newGameState = {...this.table.gameState, auctionRound : this.auctionRound, bidMap : Object.fromEntries(this.bidMap)}
                return {status : "endFirstRoundAuction", gameState : newGameState}
            }
        } else {
            if (userHasTaken){
                const newGameState = {...this.table.gameState, state : "endDeal" as BeloteState, bidMap : Object.fromEntries(this.bidMap), trumpSuit : suit }
                return {status : "endAuction", gameState : newGameState, userHasTaken } 
            } else {
                return {status : "restartAuction", gameState : this.resetTableGameState()}
            }
        }


        


    }


    



}