import type { Card, BeloteState, BeloteTableState, UserBeloteState } from "$lib/types/games/belote";
import type { BeloteTable } from "$lib/types/table";
import { Card as CardGame, Deck } from "./cardManager";

interface ExecuterType {
    gameState : BeloteTableState
    hands : Map<string, Card[]>
}

export class BeloteLoader{
    private usersBelote : UserBeloteState[]
    private table : BeloteTable
    private hands : Map<string, Card[]>

    constructor(usersBeloteState : UserBeloteState[], table : BeloteTable) {
        this.usersBelote = usersBeloteState
        this.table = table
        this.hands = new Map()
    }

    execute() : ExecuterType{
        const currentPlayer = this.table.playersId[(this.table.gameState.round - 1) % this.table.playersId.length]
        const {deck, potentialTrump} = this.dealCards()
        const newGameState = {...this.table.gameState, state : "auction" as BeloteState, deck, potentialTrump , currentPlayer}
        return {gameState : newGameState, hands : this.hands}
    }

    private dealCards() {
        this.hands = new Map()
        this.usersBelote.map(player => this.hands.set(player.id, []))
        const deck = new Deck().shuffle();
        // const deck = [...DECK_TEST]
        this.usersBelote.forEach(player => {
            const hand = this.hands.get(player.id)
            hand.push(...deck.splice(0, 5))
            Deck.sort(hand);    
        });

        const potentialTrump = deck.splice(0,1)[0]
        if (this.cancelDeal()) this.dealCards()
        return {deck, potentialTrump};
    }

    private cancelDeal(){
        return [...this.hands.values()].some(hand => {
            const seven = hand.filter(c => c.value === 7);
            return seven.length === 4
        });
    }
}

const DECK_TEST = [
    new CardGame(14, "heart"), new CardGame(13, "heart"), new CardGame(12, "heart"), new CardGame(11, "heart"), new CardGame(10, "heart"), 
    new CardGame(14, "club"), new CardGame(13, "club"), new CardGame(12, "club"), new CardGame(11, "club"), new CardGame(10, "club"),
    new CardGame(14, "diamond"), new CardGame(13, "diamond"), new CardGame(12, "diamond"), new CardGame(11, "diamond"), new CardGame(10, "diamond"),
    new CardGame(14, "spade"), new CardGame(13, "spade"), new CardGame(12, "spade"), new CardGame(11, "spade"), new CardGame(10, "spade"),
    new CardGame(9, "heart"), new CardGame(8, "heart"), new CardGame(7, "heart"),
    new CardGame(9, "club"), new CardGame(8, "club"), new CardGame(7, "club"),
    new CardGame(9, "diamond"), new CardGame(8, "diamond"), new CardGame(7, "diamond"),
    new CardGame(9, "spade"), new CardGame(8, "spade"), new CardGame(7, "spade"),
]
