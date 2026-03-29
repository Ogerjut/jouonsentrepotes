import type { HandfulResponse } from "$lib/client/games/tarot/TarotController.svelte"
import type { Tarot } from "$lib/client/games/tarot/useTarot.svelte"
import type { Card, Handful, TarotBid, UserTarotState } from "../games/tarot"
import type { TarotTable } from "../table"

export interface ServerToClientTarotEvents  {
    'tarot:snapshot': (snapshot : Tarot)=> void
    'tarot:table' : (table: TarotTable) => void
    'tarot:userGameState' : (state : UserTarotState) => void
    'tarot:reset' : () => void
}

export interface ClientToServerTarotEvents {
    "tarot:hasBid": (bid : TarotBid) => void
    "tarot:handleDog": (card : Card) => void 
    "tarot:checkPlayableCard": (card : Card) => void
    "tarot:declareSlam" : () => void
    "tarot:registerHandful" : (handfulSize : Handful, response : (res : boolean) => void) => void
    'tarot:checkHandful' : (response : (res : HandfulResponse)=> void ) => void
    "tarot:endHandfulSlam" : () => void
    "tarot:registerDog" : () => void


}