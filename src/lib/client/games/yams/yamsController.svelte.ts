import type { Yams } from "./Yams.svelte"
import type { Dice, DiceResult } from "$lib/types/games/yams"
import { socket } from "$lib/client/socket"
import { goto } from "$app/navigation"


class YamsController{
    
    constructor(){
    }

    sendPossibleDiceResult(diceResult : DiceResult, id : string, yams : Yams){
        const userId = yams?.me.id
        const table = yams?.table
        const currentPlayerId = table?.gameState.currentPlayer
        const userIsCurrentPlayer = currentPlayerId === userId

        if (!userIsCurrentPlayer || id != userId) return
        socket.emit("yams:registerDiceResult", diceResult, id )
    }

    rollDices(dicesArray : Dice[]){
        console.log("sent event roll dice")
        socket.emit("yams:rollDice", dicesArray)
    }

    quitTable(){
        socket.emit("leaveTable")
        goto('/')
    }

}

export const yamsController = new YamsController()