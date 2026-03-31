import type { Card, CoefMarque, Contrat, Handful, HandfulPoints, Oudlers, PetitAuBoutPoints, SlamPoints, TarotBid, UserTarotState } from "$lib/types/games/tarot"
import type { TarotTable } from "$lib/types/table"

export class ScoreManager{

    private taker : UserTarotState
    private partner : UserTarotState | null
    private tricks : Map<string, Card>[]
    private handfuls : Map<string, Card[]>
    private oudlers : Oudlers
    private cards : Card[]
    private maxPlayers : 4 | 5

    constructor(params : { table : TarotTable, taker : UserTarotState, partner : UserTarotState | null }){
        this.taker = params.taker
        this.partner = params.partner && params.partner.id !== params.taker.id ? params.partner : null
        this.tricks = params.table.gameState.tricks.map(t => new Map(Object.entries(t))) 
        this.handfuls = new Map(Object.entries(params.table.gameState.handfuls)) 
        this.oudlers = 0
        this.cards = this.partner ? [...this.taker.cardsWon, ...this.partner.cardsWon] : this.taker.cardsWon
        this.maxPlayers = params.table.playersId.length as 4 | 5
    }

    private getContrat() : Contrat{
        switch (this.oudlers){
            case 1 : return 51
            case 2 : return 41
            case 3 : return 36
            default : return 56
        }
    }

    private hasWin(contrat : Contrat, score : number){
        console.log("contrat / nbbouts :", contrat, this.oudlers)
        return contrat <= score
    }

    compute() {
        let score = 0
        this.oudlers = 0
        this.cards.forEach(card => {
            let pts = 0
            if (card.suit === "atout"){
                if (card.value === 21 || card.value === 1 || card.value === 0){
                    this.oudlers+=1
                    pts = 4.5
                } else {
                    pts = 0.5
                }
            } else {
                switch (card.value){
                    case 11 :
                    case 12 :
                    case 13 :
                    case 14 : 
                        pts = card.value - 9.5
                        break
                    default : 
                    pts = 0.5
                    break
                }
            }
            score += pts
        })
        return score
    }

    private getCoef(bid : TarotBid) : CoefMarque{
        switch(bid){
            case 2 : return 2
            case 3 : return 4
            case 4 : return 6
            default : return 1
        }
    }

    private defenseHasHandful() : Handful {
        const usernames = Array.from(this.handfuls.keys())
        const filtered = usernames.filter(u => 
            u !== this.taker.username && 
            (!this.partner || u !== this.partner.username)
        )
        if (filtered.length === 0) return 0
        const handful = this.handfuls.get(filtered[0])
        return handful ? handful.length as Handful : 0
    }

    private getBonusHandful(handful : Handful) : HandfulPoints{
        switch(handful){
            case 10 : return 20
            case 13 : return 30
            case 15 : return 40
            default : return 0
        }
    }

    private getBonusSlam() : SlamPoints{
        const chelemDone = this.checkSlamDone()
        console.log("chelem done  ?", chelemDone )
        if (this.taker.declaredSlam && chelemDone){
            return 400
        } else if (this.taker.declaredSlam && !chelemDone){
            return -200
        } else if (!this.taker.declaredSlam && chelemDone){
            return 200
        } 
        return 0
    }
        
    private checkSlamDone() {
        const len = this.cards.length;
        console.log("length cards won :", len)
        const bid = this.taker.bid ?? 0;
        const thresholds = bid <= 3 ? [77, 78] : bid === 4 ? [71, 72] : [];
        return thresholds.includes(len);
    }

    private isCardPlayedLastTurn(cardToCheck : Card, offset = 0) {
        const lastPli = this.getPliAt(offset);
        if (!lastPli) return { result: false, byTaker: false, winner: false };
    
        const cardInPli = this.cardIsInPli(lastPli, cardToCheck);
        const byTaker = this.cardPlayedByTaker(lastPli, cardToCheck, this.taker.id) || (this.partner ? this.cardPlayedByTaker(lastPli, cardToCheck, this.partner.id) : false);
        const winner = this.trickHasSingleAtout(lastPli);
        console.log(cardInPli, byTaker, winner)
        return { cardInPli, byTaker, winner };
    }
    
    private checkPetitAuBout(hasWin : boolean) : PetitAuBoutPoints {
        console.log("check petit au bout")
        const offset = this.taker.declaredSlam ? 1 : 0;
        const { cardInPli, byTaker, winner } = this.isCardPlayedLastTurn({ value: 1, suit: "atout" }, offset);
        if (!winner || !cardInPli) return 0;
        const success = (byTaker && hasWin) || (!byTaker && !hasWin);
        return success ? 10 : -10;
    }
    
    private trickHasSingleAtout(trick : Map<string, Card>) {
        const atouts = Array.from(trick.values()).filter(c => c.suit === "atout");
        return atouts.length === 1;
    }
    
    private cardPlayedByTaker(trick : Map<string, Card>, cardToCheck : Card, takerId : string) {
        return Array.from(trick.entries()).some(
            ([id, c]) =>
                id === takerId &&
                c.suit === cardToCheck.suit &&
                c.value === cardToCheck.value
        );
    }
    
    private getPliAt(offset = 0) {
        const index = this.tricks.length - 1 - offset;
        return this.tricks[index] ?? null;
    }

    private cardIsInPli(trick : Map<string, Card>, cardToCheck : Card) {
        return Array.from(trick.values()).some(
            c => c.suit === cardToCheck.suit && c.value === cardToCheck.value
        );
    }

    private getTakersMultiplier(hasWin : boolean) : number {
        const isFivePlayers = this.maxPlayers === 5
        const hasPartner = !!this.partner

        if (isFivePlayers && hasPartner){
            return hasWin ? 2 : -2
        } else if (isFivePlayers && !hasPartner){
            return hasWin ? 4 : -4
        }   
        return hasWin ? 3 : -3
    }
    
    
    getMarque(score : number){
        const contrat = this.getContrat()
        const hasWin = this.hasWin(contrat, score)
        const coef = this.taker.bid ? this.getCoef(this.taker.bid) : 1
        const bonusHandfulTaker = this.taker.declaredHandful ? this.getBonusHandful(this.taker.declaredHandful) : 0
        const handfulDef = this.defenseHasHandful()
        const bonusHandfulDef = this.getBonusHandful(handfulDef)
        const bonusSlam = this.getBonusSlam()
        const bonusPetitAuBout = this.checkPetitAuBout(hasWin)
        
        const marque = (25 + Math.abs(score - contrat))*coef
        const finalScore = marque + bonusHandfulTaker + bonusHandfulDef + bonusSlam + bonusPetitAuBout*coef

        const takerScore = finalScore * (this.getTakersMultiplier(hasWin))
        const partnerScore = this.partner ? (hasWin ? finalScore : finalScore*(-1)) : null
        const defScore = hasWin ? finalScore*(-1) : finalScore
        console.log("contrat", contrat,  "marque", marque, "coef", coef, "\nscore", finalScore,  "\nbonus handful taker : UserTarotState / def", bonusHandfulTaker, bonusHandfulDef,  "\nbonus petit au bout", bonusPetitAuBout, "\nbonus chelem", bonusSlam)
        
        const scoreData = {
            oudlers : this.oudlers,
            contrat, 
            score,
            hasWin, 
            coef, 
            marque, 
            bonusHandfulDef, bonusHandfulTaker, bonusPetitAuBout, bonusSlam,
            takerScore , defScore, partnerScore
        }
        
        return {contrat, hasWin, takerScore, defScore, scoreData, partnerScore}
        
    }


}
