import type { Card, UserTarotState } from "$lib/types/games/tarot";
import type { TarotTable } from "$lib/types/table";
import { Deck, isSameCard } from "./CardManager";

interface handledChien {
    dog : Card[],
    cardsWon : Card[],
    hand : Card[],
}

export class DogManager{
    private dog : Card[]
    private newDog : Card[]
    private hand : Card[]
    private dogMaxSize : 6 | 3 
    
    constructor(table : TarotTable, userGameState : UserTarotState){
        this.dog = table.gameState.dog
        this.newDog = userGameState.cardsWon
        this.hand = userGameState.hand
        this.dogMaxSize = table.maxPlayers === 4 ? 6 : 3
    }

    private isForbidenCard(card : Card){
        if (card.suit === "atout"){
            if (card.value === 0 || card.value === 1 || card.value === 21){
                return true 
            }
        } else if (card.value === 14){
            return true 
        }
        return false
    }

    handle(card : Card) : handledChien{
        if (this.hand.some(c => isSameCard(c, card))) {
            if (this.newDog.length < this.dogMaxSize && !this.isForbidenCard(card) ){
                this.newDog.push(card)
                this.hand = this.hand.filter(c => !isSameCard(c, card))
            }
        } 
        else if (this.dog.some(c => isSameCard(c, card))) {
            this.hand.push(card)
            this.dog = this.dog.filter(c => !isSameCard(c, card))
        } 
        else if (this.newDog.some(c => isSameCard(c, card))) {
            this.hand.push(card)
            this.newDog = this.newDog.filter(c => !isSameCard(c, card))
        }
        Deck.sort(this.hand)

        return {
            hand : this.hand,
            cardsWon : this.newDog,
            dog : this.dog
        }
    }

    selectRandomDog(){
        let missingCards = this.dogMaxSize - this.dog.length
        const cardsWon = [...this.dog]
        this.dog = []
        while (missingCards > 0){
            const validCards = this.hand.filter(c => c.value < 14 && c.suit != "atout")
            const n = Math.floor(Math.random()*validCards.length)
            const card = validCards[n]
            this.hand = this.hand.filter(c => !(c.value === card.value && c.suit === card.suit))
            cardsWon.push(card)
            missingCards-- 
        }

        return {
            hand : this.hand,
            cardsWon : cardsWon,
            dog : this.dog
        } 
    }


}