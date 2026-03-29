import type { Belote } from "$lib/client/games/belote/useBelote.svelte"
import type { Card, BeloteBid, UserBeloteState, Suit } from "../games/belote"
import type { BeloteTable } from "../table"

export interface ServerToClientBeloteEvents  {
    'belote:snapshot': (snapshot : Belote)=> void
    'belote:table' : (table: BeloteTable) => void
    'belote:userGameState' : (state : UserBeloteState) => void
    'belote:reset' : () => void
    'belote:belote' : (duration : number) => void
    // 'belote:endBelote' : () => void
}

export interface ClientToServerBeloteEvents {
    "belote:hasBid": (bid : BeloteBid, suit : Suit) => void
    "belote:checkPlayableCard": (card : Card) => void
}