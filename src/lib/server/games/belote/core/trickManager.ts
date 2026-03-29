import type { Card, Suit } from "$lib/types/games/belote"
import { TRUMP_CARD_VALUE } from "./cardManager"


export class TrickManager{
    private trick : Map<string, Card>
    private trickSuit : Suit | null
    private playedTrumps : Card["value"][]
    private trumpSuit : Suit | null

    constructor(trick : Map<string, Card>, trickSuit : Suit | null, playedTrumps : Card["value"][], trumpSuit : Suit | null){
        this.trick = trick
        this.trickSuit = trickSuit
        this.playedTrumps = playedTrumps
        this.trumpSuit = trumpSuit
    }

    set(userId : string, card : Card){
        this.trick.set(userId, card)
        this.setPlayedAtouts(card)
        this.setTrickColor(card)
    }

    private setPlayedAtouts(card : Card){
        if (card.suit === this.trumpSuit) {
            this.playedTrumps.push(TRUMP_CARD_VALUE[card.value]);
        }
    }

    private setTrickColor(card : Card){
        if (!this.trickSuit){
            this.trickSuit = card.suit
        }
    }

    getData() {
        return {
            trick : Object.fromEntries(this.trick),
            trickSuit : this.trickSuit, 
            playedTrumps : this.playedTrumps
        }
    }

    getTrickWinner(){
        let winner = ""
        let max = 0
        let color = this.trickSuit
        let hasTrump = false
    
        this.trick.forEach((card, id) => {
            if (card.suit === this.trumpSuit){
                color = this.trumpSuit
                const cardValue = TRUMP_CARD_VALUE[card.value]
                if (!hasTrump){
                    hasTrump = true
                    max = cardValue
                    winner = id
                } else if (cardValue > max){
                    max = cardValue
                    winner = id
                }
            } else if (card.suit === color && card.value > max){
                max = card.value
                winner = id
            }
        })
        return winner
    }

    updateCardsWon(cardsWon : Card[]){
        this.trick.forEach((card) => {
            cardsWon.push(card)
        })
        return cardsWon
    }

    restartTrick(){
        this.trick.clear()
        this.playedTrumps = []
        this.trickSuit = null
    }

}