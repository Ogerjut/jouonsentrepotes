import type { ObjectId } from "mongodb";
import type { TarotTableState } from "../games/tarot";
import type { BeloteTableState } from "../games/belote";
import type { YamsTableState } from "../games/yams";
import type { ChessTableState } from "../games/chess";


interface GlobalTableDB {
    _id : ObjectId,
    createdAt: Date;
    updatedAt: Date;
    ready : boolean,
    completed : boolean,
    playersId : Array<string>,
    maxPlayers : number
}


export type TableDB = 
    | TarotTableDB
    | BeloteTableDB
    | YamsTableDB
    | ChessTableDB;


export interface TarotTableDB extends GlobalTableDB {
    gameType : "tarot",
    gameState : TarotTableState

}

export interface BeloteTableDB extends GlobalTableDB {
    gameType : "belote",
    gameState : BeloteTableState

}

export interface ChessTableDB extends GlobalTableDB {
    gameType : "chess",
    gameState : ChessTableState
}

export interface YamsTableDB extends GlobalTableDB {
    gameType : "yams",
    gameState : YamsTableState
}

