import type { User as AuthUser} from "better-auth";
import type { GameStats } from "./db/userStatsDB";

export interface User extends AuthUser {
    role : string
    currentTableId : string | null
}

export interface UserStats {
    id : string,
    username : string,
    tarot: GameStats;
    belote: GameStats;
    yams: GameStats;
    chess : GameStats
    createdAt : Date
    updatedAt : Date
}
