// import type { UserGameState } from "$lib/types/games/gameCommon"
import type { UserGameState } from "$lib/types/games/gameCommon"
import type { UserYamsState } from "$lib/types/games/yams"
import type { YamsTable } from "$lib/types/table"
import type { User } from "$lib/types/user"
import { socket } from "../../socket"

export type Yams = {
    table : YamsTable,
    me : User,
    userGameState : UserYamsState,
    opponentsGameState : UserYamsState[],
}

let yams = $state<Yams | null>(null)

export const useYams = () => {return yams}

export function resetYamsState () {
    yams = null
}

const onTable = async (table: YamsTable) => {
        if (yams) yams.table = table;
        await fetchOpponentsYamsState()
    }

const onUserGameState = (state: UserYamsState) => {
        if (yams) {
            yams.userGameState = state;
        }
    }

const onReset = () => {
        yams = null;
    }

export async function initYamsState(table : YamsTable , user : User, gameState : UserYamsState){
    yams = {
        table,
        me : user,
        userGameState : gameState,
        opponentsGameState : []
    }
    await fetchOpponentsYamsState()
}

export function initYamsSocket(){
    socket.on('yams:table', onTable);
    socket.on('yams:userGameState', onUserGameState );
    socket.on('yams:reset', onReset);
}

export function destroyYamsSocket(){
    if (!socket) return 
    socket.off('yams:userGameState', onUserGameState)
    socket.off('yams:table', onTable)
    socket.off('yams:reset', onReset)
}

export async function fetchOpponentsYamsState() {
    socket.emit("getOpponentsGameState", (opponents : UserGameState[]) => {
        if (yams) yams.opponentsGameState = opponents as UserYamsState[]
    })
}