import type { UserBeloteState } from "./belote";
import type { UserChessState } from "./chess";
import type { UserTarotState } from "./tarot";
import type { UserYamsState } from "./yams";

export type UserGameState = | UserYamsState | UserTarotState | UserBeloteState | UserChessState
