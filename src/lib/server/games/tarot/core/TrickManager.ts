import type { Card, Suit, UserTarotState } from "$lib/types/games/tarot"


export class TrickManager{
    private trick : Map<string, Card>
    private trickColor : Suit | null
    private playedAtouts : Card["value"][]

    constructor(trick : Map<string, Card>, trickColor : Suit | null, playedAtouts : Card["value"][]){
        this.trick = trick
        this.trickColor = trickColor
        this.playedAtouts = playedAtouts
        
    }

    set(userId : string, card : Card){
        this.trick.set(userId, card)
        this.setPlayedAtouts(card)
        this.setTrickColor(card)
    }

    private setPlayedAtouts(card : Card){
        if (card.suit === "atout" && card.value !== 0) {
            this.playedAtouts.push(card.value);
        }
    }

    private setTrickColor(card : Card){
        if (!this.trickColor){
            this.trickColor = card.suit
        }
    }

    getData() {
        return {
            trick : Object.fromEntries(this.trick),
            trickColor : this.trickColor, 
            playedAtouts : this.playedAtouts
        }
    }

    getTrickWinner(tricksRecord : Array<Record<string, Card>>, taker : UserTarotState){
        let winner = taker.id
        let max = 0
        let color = this.trickColor
        let hasAtout = false
        const tricks = tricksRecord.map(t => new Map(Object.entries(t)))
        
        if (tricks.length === 17 && taker.declaredSlam) {
            console.log('check excuse jouée en dernier')
            const atouts : Array<{id : string, card : Card}> = [];
            this.trick.forEach((card, id) => {
                if (card.suit === "atout") {
                    atouts.push({ id, card });
                }
            });

            if (atouts.length === 1 && atouts[0].card.value === 0) {
                console.log('excuse jouée en dernier gagne le trick')
                winner = atouts[0].id;
            }
        }
        
        this.trick.forEach((card, id) => {
            if (card.suit === "atout" && card.value !==0){
                color = "atout"
                if (!hasAtout){
                    hasAtout = true
                    max = card.value
                    winner = id
                } else if (card.value > max){
                    max = card.value
                    winner = id
                }
            } else if (card.suit === color && card.value > max){
                max = card.value
                winner = id
            }
        })
        
        return winner
    }

    updateCardsWon(cardsWon : Card[], winnerTrick : string){
        let excuseOwner : string | null = null

        this.trick.forEach((card, id) => {
            if (card.value !== 0 || (card.value === 0 && id === winnerTrick) ){
                cardsWon.push(card)
            } 
            
            if (card.value === 0 && id !== winnerTrick) {
                excuseOwner = id
            }
        })
        return {cardsWon, excuseOwner}
    }

    restartTrick(){
        this.trick.clear()
        this.playedAtouts = []
        this.trickColor = null
    }

}