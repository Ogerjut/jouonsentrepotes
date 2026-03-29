import type { Card, Suit, Team, UserBeloteState } from "$lib/types/games/belote"
import type { BeloteTable } from "$lib/types/table"

const CONTRAT = 81

export class ScoreManager{

    private usersGameState : UserBeloteState[]
    private takersCardsWon : Card[]
    private takers : string[]
    private trumpSuit : Suit | null
    private lastTrickWinner : string | null
    private taker : UserBeloteState
    private teams : Team[] | null
    private litige : boolean

    constructor(table : BeloteTable, usersGameState : UserBeloteState[], taker : UserBeloteState ){
        this.usersGameState = usersGameState
        this.trumpSuit = table.gameState.trumpSuit
        this.lastTrickWinner = table.gameState.lastTrickWinner
        this.taker = taker
        this.teams = table.gameState.teams
        this.takers = this.getTakers()
        this.takersCardsWon = this.getTakersCardsWon()
        this.litige = table.gameState.litige
        console.log("takers card won length", this.takersCardsWon.length)

    }

    private getTakers(){
        let takers : string[] = []
        if (!this.teams) return []
        this.teams.map(t => {
            if (t.players.includes(this.taker.id)){
                takers = t.players
            }
        })
        return takers
    }

    private getTakersCardsWon(){
        const cards : Card[] = []
        this.usersGameState.map(u => {
            if (this.takers.includes(u.id)){
                cards.push(...u.cardsWon) 
            }
        })
        return cards
    }

    private getContratFulfill(takersScore : number, defScore : number){
        if (takersScore > CONTRAT && takersScore > defScore) return "hasWin"
        if (takersScore === defScore) return "litige"
        return "hasLose"
    }


    compute() {
        let score = this.takersHaveTheLastTrick()
        this.takersCardsWon.forEach(card => {
            let pts = 0
            if (card.suit === this.trumpSuit){
                switch (card.value){
                    case 14 :
                        pts = 11
                        break
                    case 13 :
                        pts = 10
                        break
                    case 12 :
                        pts = 4
                        break
                    case 11 : 
                        pts = 3
                        break
                    case 10 :
                        pts = 20
                        break
                    case 9 :
                        pts = 14
                        break
                    case 8 :
                    case 7 : 
                        pts = 0
                        break
                }
                
            } else {
                switch (card.value){
                    case 14 :
                        pts = 11
                        break
                    case 13 :
                        pts = 10
                        break
                    case 12 :
                        pts = 4
                        break
                    case 11 : 
                        pts = 3
                        break
                    case 10 :
                        pts = 2
                        break
                    case 9 :
                    case 8 :
                    case 7 : 
                        pts = 0
                        break
                }
            }
            score += pts
        })
        return score
    }
        
    private takersHaveTheLastTrick(){
        if (!this.lastTrickWinner) return 0
        return this.takers.includes(this.lastTrickWinner) ? 10  : 0
    }

    capot(){
        return this.takersCardsWon.length === 32
    }

    takersHaveBelote(){
        return this.usersGameState.some(u => u.declaredBelote === true && this.takers.includes(u.id))
    }

    defHaveBelote(){
        return this.usersGameState.some(u => u.declaredBelote === true && !this.takers.includes(u.id))
    }

    
    getFinalScore(score : number){
        const takersBelote = this.takersHaveBelote() ? 20 : 0
        const defBelote = this.defHaveBelote() ? 20 : 0
        const bonusLitige = this.litige ? 81 : 0

        let takersFinalScore = score + takersBelote + bonusLitige
        let defFinalScore = 162 - score + defBelote
        
        const status = this.getContratFulfill(takersFinalScore, defFinalScore)
        
        const capot = this.capot()
        
        if (capot){
            takersFinalScore = 252 + takersBelote + bonusLitige
            defFinalScore = 0 + defBelote
        }

        if (status === "litige"){
            takersFinalScore = 0 + takersBelote
        }

        if (status === "hasLose"){
            takersFinalScore = 0 + takersBelote
            defFinalScore = 162 + defBelote + bonusLitige
        }
  
        return {takersFinalScore, defFinalScore, status, takersBelote  : this.takersHaveBelote(), defBelote : this.defHaveBelote(), takersScore : score }
        
    }


}
