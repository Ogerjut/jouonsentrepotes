import type { ObjectId } from "mongodb";

export interface UserStatsDB {
    _id : ObjectId,
    id : ObjectId,
    username : string,
    tarot: GameStats;
    belote: GameStats;
    yams: GameStats;
    chess : GameStats;
    createdAt : Date
    updatedAt : Date
}
  
export interface GameStats {
  victories: number;
  games: number;
  highestScore: number;
}

