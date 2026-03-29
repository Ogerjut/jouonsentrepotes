import { goto } from "$app/navigation";
import { socket } from "$lib/client/socket";
import type { Card, BeloteBid, Suit } from "$lib/types/games/belote";
import type { Belote } from "./useBelote.svelte";

class BeloteController {

    sendBid(bid : BeloteBid, potentialTrumpSuit : Suit){
        socket.emit("belote:hasBid", bid, potentialTrumpSuit )
    }

    onCardClick(card : Card, belote : Belote) {  
        const isCurrentPlayer = belote?.table.gameState.currentPlayer === belote?.me.id
        const state = belote?.table.gameState.state

        if (state === "round" && isCurrentPlayer) {
        socket.emit("belote:checkPlayableCard", card);
        }
    }

    quitTable(){
        socket.emit("leaveTable")
        goto('/')
    }

}

export const beloteController = new BeloteController()