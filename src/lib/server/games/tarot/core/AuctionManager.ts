import type { TarotBid, TarotState, TarotTableState } from "$lib/types/games/tarot";
import type { TarotTable } from "$lib/types/table";


type AuctionResolution =
  | { status: "restartAuction"; gameState: TarotTableState }
  | { status: "endAuction"; gameState: TarotTableState; maxBid: TarotBid; userHasTaken: string }
  | { status: "continueAuction"; gameState: TarotTableState };

export class AuctionManager {
    private table : TarotTable
    private bidMap : Map<string, TarotBid>

    constructor(table : TarotTable){
        this.table = table
        this.bidMap = new Map(Object.entries(this.table.gameState.bidMap))
    }

    private getAuctionOver(bid : TarotBid){
        return this.bidMap.size === this.table.maxPlayers || bid === 4
    }

    private getMaxBid(){
        let max: TarotBid = 0;
        let userHasTaken = "";

        this.bidMap.forEach((bid, id) => {
            if (bid > max){
                max = bid;
                userHasTaken = id;
            }
        });

        return { maxBid: max, userHasTaken };
    }


    private resetTableGameState(){
        let auctionRound = this.table.gameState.auctionRound
        auctionRound++
        const round = this.table.gameState.round
        const newCurrentPlayer = this.table.playersId[((round + auctionRound)-1) % this.table.playersId.length]
        const resetGameState : TarotTableState = {
            ...this.table.gameState,
            bidMap : Object.fromEntries(new Map()), 
            actualBid : 0, 
            currentPlayer : newCurrentPlayer, 
            state : "auction", 
            dog : [], 
            auctionRound
        }
        return resetGameState
    }

    resolveBid(userId : string, bid : TarotBid) : AuctionResolution{
        this.bidMap.set(userId, bid)
        if (this.getAuctionOver(bid)){
            const {maxBid, userHasTaken} = this.getMaxBid()
            if (maxBid === 0){
                return {status : "restartAuction", gameState : this.resetTableGameState()}
            } else {
                const newState : TarotState = maxBid < 3 ? "afterAuction" : "beforeRound" 
                const newGameState = {...this.table.gameState, state : newState, bidMap : Object.fromEntries(this.bidMap) }
                return {status : "endAuction", gameState : newGameState, maxBid, userHasTaken, }
            }
        }
        const newGameState = {...this.table.gameState, actualBid : bid, bidMap : Object.fromEntries(this.bidMap)}
        return {status : "continueAuction", gameState : newGameState}
    }



}