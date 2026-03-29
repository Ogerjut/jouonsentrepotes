import type { TarotTableState } from "./games/tarot";
import type { BeloteTableState } from "./games/belote";
import type { YamsTableState } from "./games/yams";
import type { ChessTableState } from "./games/chess";

interface GlobalTable {
    id : string,
    createdAt: Date;
    updatedAt: Date;
    ready : boolean,
    completed : boolean,
    playersId : Array<string>,
    maxPlayers : number
}

export type Table = 
    | TarotTable
    | BeloteTable
    | YamsTable
    | ChessTable;


export interface TarotTable extends GlobalTable {
    gameType : "tarot",
    gameState : TarotTableState

}

export interface BeloteTable extends GlobalTable {
    gameType : "belote",
    gameState : BeloteTableState

}

export interface ChessTable extends GlobalTable {
    gameType : "chess",
    gameState : ChessTableState
}

export interface YamsTable extends GlobalTable {
    gameType : "yams",
    gameState : YamsTableState
}

export type GameType = "yams" | "tarot" | "belote" | "chess"