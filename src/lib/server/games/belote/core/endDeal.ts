import type { BeloteState, UserBeloteState } from "$lib/types/games/belote"
import type { BeloteTable } from "$lib/types/table"
import { Deck, type Card } from "./cardManager"

export class EndDeal {
    private usersBelote : UserBeloteState[]
    private table : BeloteTable
    private deck : Card[]
    private hands : Map<string, Card[]>

    constructor(usersBeloteState : UserBeloteState[], table : BeloteTable) {
        this.usersBelote = usersBeloteState
        this.table = table
        this.deck = table.gameState.deck
        this.hands = new Map()
    }

    execute(){
        this.usersBelote.map(u => this.hands.set(u.id, u.hand))
        this.usersBelote.forEach(u => {
            const hand = this.hands.get(u.id)
            if (!u.hasTaken){
                hand.push(...this.deck.splice(0,3))
            } else {
                hand.push(...this.deck.splice(0,2))
            }
            Deck.sort(hand)
        })
        
        const currentPlayer = this.table.playersId[(this.table.gameState.round - 1) % this.table.playersId.length]
        const newGameState = {...this.table.gameState, state : "round" as BeloteState, deck : this.deck, currentPlayer}
        
        return {gameState : newGameState, hands : this.hands}
    }


} 