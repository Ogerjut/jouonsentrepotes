import type { ObjectId } from "mongodb";
import type { ChessTeams } from "../games/chess";

export interface UserChessStateDB {
        _id : ObjectId
        id : ObjectId,
        username : string,
        team : ChessTeams | null,
        askingDraw : 3 | 2 | 1 | 0
}