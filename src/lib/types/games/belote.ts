import type { User } from "better-auth";
import type { UUID } from "crypto";

export interface BeloteTableState {
    state : BeloteState,
    scoreMode : ScoreMode,
    bidMap : Record<User["id"], BeloteBid>,
    auctionRound : 1 | 2
    round : Round,
    trick : Record<User["id"], Card>
    tricks : Array<Record<User["id"], Card>>,
    trickSuit : Card["suit"] | null,
    lastTrick : Array<Card>,
    lastTrickWinner : User["id"] | null,
    playedTrumps : Array<Card["value"]>,
    currentPlayer : User["id"],
    potentialTrump : Card | null,
    trumpSuit : Suit | null, 
    deck : Array<Card>,
    teams : Team[] | null, 
    litige : boolean
    scores : Record<Round, Record<Team["id"], Team["score"]>>
    roundDataScore : {status : string, takersFinalScore : number, takersScore : number, takersBelote : boolean, defFinalScore : number, defBelote : boolean}
}

export interface UserBeloteState {
    id : string,
    username : string,
    bid : BeloteBid | null
    hasBid : boolean,
    hand : Array<Card>, 
    hasTaken : boolean,
    cardsWon : Array<Card>,
    declaredBelote : boolean,
    hasPlayed : boolean,
    playedCard : Card | null,
}

export type BeloteState  = "created" | "teams" | "auction" | "endDeal" |"round" | "endRound" | "endGame"
export type Card = {value : number, suit : Suit}
export type Suit = "spade" | "heart" | "diamond" | "club"
export type BeloteBid = 0 | 1
export type Team = {id : UUID, score : number, players : User["id"][]}
export type ScoreMode = '1000' | "12"
export type Round = number
