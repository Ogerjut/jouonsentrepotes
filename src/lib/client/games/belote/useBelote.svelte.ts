import type { UserGameState } from "$lib/types/games/gameCommon"
import type { UserBeloteState } from "$lib/types/games/belote"
import type { BeloteTable } from "$lib/types/table"
import type { User } from "$lib/types/user"
import { socket } from "../../socket"

export type BeloteEvent = {
    show : boolean, 
    state : "belote" | "rebelote" | null
}

export type Belote = {
    table : BeloteTable,
    me : User,
    userGameState : UserBeloteState,
    opponentsGameState : UserBeloteState[],
    beloteEvent : BeloteEvent
}

let belote = $state<Belote | null>(null)

export const useBelote = () => {return belote}

export function resetBeloteState () {
    belote = null
}

export async function initBeloteState(table : BeloteTable , user : User, gameState : UserBeloteState){
    belote = {
        table,
        me : user,
        userGameState : gameState,
        opponentsGameState : [], 
        beloteEvent : {show : false, state : null}
    }
    await fetchOpponentsBeloteState()
}

const onTable = async (table: BeloteTable) => {
        // console.log('table updated : ', table)
        if (belote) belote.table = table;
        await fetchOpponentsBeloteState()
}

const onBelote = (duration : number) => {
        if (!belote) return
        belote.beloteEvent.show = true
        const newState = belote.beloteEvent.state === "belote" ? "rebelote" : "belote"
        belote.beloteEvent.state = newState
        
        setTimeout(() => {
            if (belote){
                belote.beloteEvent.show = false 
            }
        }, duration)
}

const onReset = () => {
        belote = null;
}

const onUserGameState = (state: UserBeloteState) => {
        // console.log("userGameState updtate :", state)
        if (belote) {
            belote.userGameState = state;
        }
}

export function initBeloteSocket(){
    socket.on('belote:table', onTable);
    socket.on('belote:userGameState', onUserGameState );
    socket.on('belote:reset', onReset);
    socket.on("belote:belote", onBelote)
}

export function destroyBeloteSocket(){
    if (!socket) return 
    socket.off('belote:userGameState', onUserGameState)
    socket.off('belote:table', onTable)
    socket.off('belote:reset', onReset)
    socket.off('belote:belote', onBelote)
    // socket.off('belote:showModale')
    
}

export async function fetchOpponentsBeloteState() {
    socket.emit("getOpponentsGameState", (opponents : UserGameState[]) => {
        if (belote) belote.opponentsGameState = opponents as UserBeloteState[]
    })
}