import type { User } from "better-auth";

export interface TarotTableState {
    state : TarotState
    bidMap : Record<User["id"], TarotBid>,
    round : number,
    auctionRound : number,
    maxRound : number,
    actualBid : number,
    trick : Record<User["id"], Card>
    tricks : Array<Record<User["id"], Card>>,
    trickColor : Card["suit"] | null,
    lastTrick : Array<Card>,
    playedAtouts : Array<Card["value"]>,
    currentPlayer : User["id"],
    dog : Array<Card>,
    handfuls :  Record<User["name"], Array<Card>>,
    finalScores : Record<User["id"], number>
    roundDataScore : {oudlers : Oudlers, contrat : Contrat | null, score : number, hasWin : boolean, coef : CoefMarque, marque : number, 
        bonusHandfulDef : HandfulPoints, bonusHandfulTaker : HandfulPoints, bonusPetitAuBout : PetitAuBoutPoints, bonusSlam : SlamPoints,
        takerScore : number, defScore : number, partnerScore : number | null
    }
    taker : User["id"] | null,
    calledPlayer : User["id"] | null,
    calledSuit : Suit | null
}

export interface UserTarotState {
    id : string,
    username : string,
    bid : TarotBid | null
    hasBid : boolean,
    hand : Array<Card>, 
    hasTaken : boolean,
    cardsWon : Array<Card>,
    declaredSlam : boolean,
    declaredHandful : Handful | null,
    score : number, 
    hasPlayed : boolean,
    playedCard : Card | null,
    hasWin : boolean, 
    contrat : Contrat | null
}

export type TarotState  = "created" | "beforeAuction" | "auction" | "afterAuction" | "kingCall" | "showKingCalled" |"beforeRound" | "showHandful" |"round" | "afterRound" | "endGame"
export type Card = {value : number, suit : Suit}
export type Suit = "spade" | "heart" | "diamond" | "club" | "atout"
export type TarotBid = 0 | 1 | 2 | 3 | 4
export type Handful = 0 | 10 | 13 | 15
export type Oudlers = 0 | 1 | 2 | 3 
export type Contrat = 36 | 41 | 51 | 56
export type CoefMarque = 1 | 2 | 4 | 6
export type HandfulPoints = 0 | 20 | 30 | 40
export type PetitAuBoutPoints = -10 | 0 | 10
export type SlamPoints = -200 | 0 | 200 | 400
export type Handful5P = 0 | 8 | 10 | 13