import type { ClocksData } from "$lib/server/games/chess/core/clockManager"
import type { UserGameState } from "../games/gameCommon"
import type { GameType, Table } from "../table"
import type { TimerScheduled } from "../timer"
import type { User, UserStats } from "../user"


export interface ServerToClientCoreEvents  {
    tableJoined: (table : Table) => void
    playerJoined : (payload : {userId : User["id"], username : User['name'] | string}) => void
    invitationToPlay : (tableId : Table["id"], from : User["name"], game : GameType) => void
    invitedUsers : (serializedInvitedUsers : string[]) => void
    activeUsers : (users : User[])=> void
    onLeaveAllTable : () => void
    abortedTable : () => void
    userPresence : (status :{online : boolean, inGame : boolean}) => void
    error : (reason : string | undefined) => void
    redirection : (url : string) => void 
    "timer:start" : (timer : TimerScheduled)=> void
    "timer:pause" : () => void
    "timer:stop" : () => void
    "clock:update" : (clocks : ClocksData) => void
}


export interface ClientToServerCoreEvents {
    registerUserSocket : () => void
    joinGameLobby : (response : (res : {status : "ok" |"not", reason? : string}) => void) => void
    joinTable : (tableId : Table["id"]) => void
    inviteToPlay : (to : User["id"], from : User["id"], game : GameType) => void
    declinedInvitation : () => void
    acceptedInvitation : (tableId : string, response : (res : {status : "ok" |"not", reason? : string}) => void) => void
    getActiveUsers: () => void
    getUserStatsById : (userId : User["id"], callback : (user : UserStats) => void) => void
    getOpponents : (callback : (users : User[]) => void) => void
    leaveTable : () => void
    getOpponentsGameState : (callback : (opponents : UserGameState[]) => void) => void
    rejoinTable : (tableId : Table["id"]) => void

}
