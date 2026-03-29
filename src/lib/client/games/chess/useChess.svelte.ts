import type { ClocksData } from "$lib/server/games/chess/core/clockManager"
import type { UserChessState } from "$lib/types/games/chess"
import type { UserGameState } from "$lib/types/games/gameCommon"
import type { ChessTable } from "$lib/types/table"
import type { User } from "$lib/types/user"
import { socket } from "../../socket"
import { useModale } from "../hook/useModale.svelte"
import { getChessActionsModale } from "./modaleChess.svelte"


export type Chess = {
    table : ChessTable,
    me : User,
    userGameState : UserChessState,
    opponentsGameState : UserChessState[],
    clocksData : ClocksData | null
}

let chess = $state<Chess | null>(null)

const modale = useModale()

export const useChess = () => {return chess}

export function resetChessState() {
    if (!chess) return 
    chess = null
    
}

export async function initChessState(table : ChessTable , user : User, gameState : UserChessState){
    chess = {
        table,
        me : user,
        userGameState : gameState,
        opponentsGameState : [], 
        clocksData : null
    }
    await fetchOpponentsChessState()
}

const onTable = async (table: ChessTable) => {
        // console.log('table updated : ', table)
        if (!chess) return
        chess.table = table;
        await fetchOpponentsChessState()
    }

const onUserGameState = (state: UserChessState) => {
    // console.log("userGameState updtate :", state)
    if (chess) {
        chess.userGameState = state;
    }
}

const onReset = () => {
    resetChessState()
}

const onShowModale = (data : {title : string, message : string, actions : string[]}) => {
    if (!data.title || !data.message) return 
    modale.show(data.title, data.message, getChessActionsModale(data.actions))
}

const onClockUpdate = (data : ClocksData) => {
    if (!chess) return 
    chess.clocksData = {
        ...data,
        serverDate: Date.now()
    }
    
}

export function initChessSocket(){
    // socket.on('chess:snapshot', (snapshot: Chess) => {
    //     chess = snapshot;
    // });
    socket.on('chess:table', onTable );
    socket.on('chess:userGameState', onUserGameState );
    socket.on('chess:reset', onReset);
    socket.on("chess:showModale", onShowModale)
    socket.on("clock:update", onClockUpdate)
}

export function destroyChessSocket(){
    if (!socket) return 
    socket.off('chess:table', onTable );
    socket.off('chess:userGameState', onUserGameState );
    socket.off('chess:reset', onReset);
    socket.off("chess:showModale", onShowModale)
    socket.off("clock:update", onClockUpdate)
    
}

export async function fetchOpponentsChessState() {
    socket.emit("getOpponentsGameState", (opponents : UserGameState[]) => {
        if (chess) chess.opponentsGameState = opponents as UserChessState[]
    })
}


