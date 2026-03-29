import type { BeloteBid, Card } from "../games/belote";
import type { ObjectId } from "mongodb";

export interface UserBeloteStateDB {
    _id : ObjectId
    id : ObjectId,
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

