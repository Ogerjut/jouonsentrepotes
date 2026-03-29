import type { Yams } from "$lib/client/games/yams/Yams.svelte"
import type { Dice, DiceResult, UserYamsState } from "../games/yams"
import type { YamsTable } from "../table"


export interface ServerToClientYamsEvents  {
    'yams:snapshot': (snapshot : Yams)=> void
    'yams:table' : (table: YamsTable) => void
    'yams:userGameState' : (state : UserYamsState) => void
    'yams:reset' : () => void
}

// idem yamsService, faire remonter au CoreHandler avec type UserGameState
export interface ClientToServerYamsEvents {
    "yams:rollDice":(kept : Dice[]) => Promise<void>
    "yams:registerDiceResult": (diceResult : DiceResult, id : string) => void 

}
