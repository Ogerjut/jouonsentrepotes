import type { Card, Suit } from "$lib/types/games/tarot"
import { isSameCard } from "./CardManager"


export class PlayableCardManager{

    private trickColor : Suit | null
        private playedAtouts : Card["value"][]
        private playableCards : Card[]
    
        constructor(trickColor : Suit | null, playedAtouts : Card["value"][]){
            this.trickColor = trickColor
            this.playedAtouts = playedAtouts
            this.playableCards = []
        }
    
        private setPlayableCards(hand : Card[]){
            if (!this.trickColor) { 
                this.playableCards = hand.slice();
                return  
            } 
            
            if (this.trickColor === "atout") {
                const maxAtout = Math.max(...this.playedAtouts);
                this.playableCards = hand.filter(c => c.suit === this.trickColor && c.value > maxAtout);
                if (this.playableCards.length === 0) {
                    this.playableCards = hand.filter(c => c.suit === this.trickColor);
                }
                if (this.playableCards.length === 0) {
                    this.playableCards = hand.slice();
                }
                return 
            }
    
            this.playableCards = hand.filter(c => c.suit === this.trickColor);
            if (this.playableCards.length === 0 && this.playedAtouts.length === 0) {
                this.playableCards = hand.filter(c => c.suit === "atout");
            }
            if (this.playableCards.length === 0 && this.playedAtouts.length !== 0) {
                const maxAtout = Math.max(...this.playedAtouts);
                this.playableCards = hand.filter(c => c.suit === "atout" && c.value > maxAtout);
            }
            if (this.playableCards.length === 0) {
                this.playableCards = hand.filter(c => c.suit === "atout");
            }
            if (this.playableCards.length === 0) {
                this.playableCards = hand.slice();
            }
        }
        
    
        execute(card : Card, hand : Card[] ){
            this.setPlayableCards(hand)
            return this.playableCards.some(c => isSameCard(c, card)) || card.value === 0
                // Pas ici !!! 
            // if (card.suit === "atout" && card.value !== 0) {
            //     this.playedAtouts.push(card.value);
            // }
        }

        selectRandomCard(hand : Card[] ){
            this.setPlayableCards(hand)
            const n = Math.floor(Math.random()*this.playableCards.length)
            return this.playableCards[n]
        }
    
}