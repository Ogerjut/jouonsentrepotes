import type { ObjectId } from "mongodb"
import type { Handful, TarotBid, Card, Contrat} from "../games/tarot"

export interface UserTarotStateDB {
    _id : ObjectId,
    id :  ObjectId,
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

