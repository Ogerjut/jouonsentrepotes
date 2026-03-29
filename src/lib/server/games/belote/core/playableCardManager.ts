import type { Card, Suit } from "$lib/types/games/belote"
import { isSameCard, TRUMP_CARD_VALUE } from "./cardManager"
import { TrickManager } from "./trickManager"


export class PlayableCardManager{

    private trickSuit : Suit | null
    private playedTrumps : Card["value"][]
    private playableCards : Card[]
    private trumpSuit : Card["suit"] | null
    private trick : Map<string, Card>
    private partnerMaster : boolean

    constructor(trickSuit : Suit | null, playedTrumps : Card["value"][], trumpSuit : Card["suit"] | null, trick : Map<string, Card>){
        this.trickSuit = trickSuit
        this.playedTrumps = playedTrumps
        this.playableCards = []
        this.trumpSuit = trumpSuit
        this.trick = trick
        this.partnerMaster = this.getPartnerMaster()
    }

    private setPlayableCards(hand : Card[]){
        if (!this.trumpSuit) return
        
        if (!this.trickSuit) { 
            this.playableCards = hand.slice();
            return  
        } 
        
        if (this.trickSuit === this.trumpSuit) {
            const maxAtout = Math.max(...this.playedTrumps);
            this.playableCards = hand.filter(c => c.suit === this.trickSuit && TRUMP_CARD_VALUE[c.value] > maxAtout);
            if (this.playableCards.length === 0) {
                this.playableCards = hand.filter(c => c.suit === this.trickSuit);
            }
            if (this.playableCards.length === 0) {
                this.playableCards = hand.slice();
            }
            return 
        }

        this.playableCards = hand.filter(c => c.suit === this.trickSuit);

        if (this.playableCards.length === 0 && this.playedTrumps.length === 0) {
            if (!this.partnerMaster){
                this.playableCards = hand.filter(c => c.suit === this.trumpSuit);
            } else {
                this.playableCards = hand.slice();
            }
        }
        if (this.playableCards.length === 0 && this.playedTrumps.length !== 0) {
            if (!this.partnerMaster){
                const maxAtout = Math.max(...this.playedTrumps);
                this.playableCards = hand.filter(c => c.suit === this.trumpSuit && TRUMP_CARD_VALUE[c.value] > maxAtout);
            } else {
                this.playableCards = hand.slice();
            }
        }
        if (this.playableCards.length === 0) {
            this.playableCards = hand.filter(c => c.suit === this.trumpSuit);
        }
        if (this.playableCards.length === 0) {
            this.playableCards = hand.slice();
        }
    }
    

    execute(card : Card, hand : Card[] ){
        this.setPlayableCards(hand)
        return this.playableCards.some(c => isSameCard(c, card))
    }

    selectRandomCard(hand : Card[] ){
        this.setPlayableCards(hand)
        const n = Math.floor(Math.random()*this.playableCards.length)
        return this.playableCards[n]
    }

    private getPartnerMaster(){
        if (this.trick.size < 2) return false 
        let partner = ''
        const players =  [...this.trick.keys()]
        if (this.trick.size === 2){
            partner = players[0]
        }
        if (this.trick.size === 3){
            partner = players[1]
        }
    
        const trickManager = new TrickManager(this.trick, this.trickSuit, this.playedTrumps, this.trumpSuit )
        const idMaster = trickManager.getTrickWinner()

        return idMaster === partner
    }
    
}