import type { UserGameState } from "$lib/types/games/gameCommon"
import type { UserTarotState } from "$lib/types/games/tarot"
import type { TarotTable } from "$lib/types/table"
import type { User } from "$lib/types/user"
import { socket } from "../../socket"

export type Tarot = {
    table : TarotTable,
    me : User,
    userGameState : UserTarotState,
    opponentsGameState : UserTarotState[],
}

let tarot = $state<Tarot | null>(null)

export const useTarot = () => {return tarot}

export function resetTarotState () {
    tarot = null
}

export async function initTarotState(table : TarotTable , user : User, gameState : UserTarotState){
    tarot = {
        table,
        me : user,
        userGameState : gameState,
        opponentsGameState : []
    }
    await fetchOpponentsTarotState()
}

const onTable = async (table: TarotTable) => {
    // console.log('table updated : ', table)
    if (tarot) tarot.table = table;
    await fetchOpponentsTarotState()
}

const onUserGameState = (state: UserTarotState) => {
    // console.log("userGameState updtate :", state)
    if (tarot) {
        tarot.userGameState = state;
    }
}

const onReset = () => {
    tarot = null;
}


export function initTarotSocket(){
    socket.on('tarot:table', onTable );
    socket.on('tarot:userGameState', onUserGameState);
    socket.on('tarot:reset', onReset);
}

export function destroyTarotSocket(){
    if (!socket) return 
    socket.off('tarot:userGameState', onUserGameState)
    socket.off('tarot:table', onTable)
    socket.off('tarot:reset', onReset)
    // socket.off('tarot:snapshot')
}

export async function fetchOpponentsTarotState() {
    socket.emit("getOpponentsGameState", (opponents : UserGameState[]) => {
        if (tarot) tarot.opponentsGameState = opponents as UserTarotState[]
    })
}