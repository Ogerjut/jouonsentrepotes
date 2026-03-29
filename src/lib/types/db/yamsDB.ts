import type { ObjectId } from "mongodb";
import type { DiceResult, FinalScore, Launches } from "../games/yams";

export interface UserYamsStateDB {
    _id : ObjectId,
    id : ObjectId,
    username : string,
    hasPlayed : boolean,
    listResults : DiceResult[],
    launches : Launches, 
    finalScore : FinalScore
}

