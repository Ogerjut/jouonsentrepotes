import type { Card, TarotState, TarotTableState, UserTarotState } from "$lib/types/games/tarot";
import type { TarotTable } from "$lib/types/table";
import { Deck, DECK_CHELEM } from "./CardManager";

interface ExecuterType {
    gameState : TarotTableState
    hands : Map<string, Card[]>
}

export class TarotLoader{
    private usersTarot : UserTarotState[]
    private table : TarotTable
    private hands : Map<string, Card[]>

    constructor(usersTarotState : UserTarotState[], table : TarotTable) {
        this.usersTarot = usersTarotState
        this.table = table
        this.hands = new Map()
    }

    execute() : ExecuterType{
        const currentPlayer = this.table.playersId[((this.table.gameState.round + this.table.gameState.auctionRound)-1) % this.table.playersId.length]
        const newGameState = {...this.table.gameState, state : "auction" as TarotState, dog : this.dealCards(), currentPlayer}
        return {gameState : newGameState, hands : this.hands}
    }

    private dealCards() {
        const nbCardsChien = this.table.playersId.length === 4 ? 6 : 3;
        
        while (true) {
            this.hands = new Map()
            this.usersTarot.map(player => this.hands.set(player.id, []))
            const deck = new Deck().shuffle();
            // console.log("deck :", deck)
            // const deck = [...DECK_CHELEM]
            while (deck.length > nbCardsChien) {
                this.usersTarot.forEach(player => {
                    const hand = this.hands.get(player.id)!
                    hand.push(...deck.splice(0, 3))
                    Deck.sort(hand);    
                });
            }
            if (!this.cancelDeal()) {
                return deck;
            }
           
        }
        
    }

    private cancelDeal(){
        return [...this.hands.values()].some(hand => {
            const atouts = hand.filter(c => c.suit === "atout");
            return atouts.length === 1 && atouts[0].value === 1;
        });
    }

}