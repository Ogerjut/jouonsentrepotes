import type { DeleteResult } from "mongodb"
import type { Table } from "../table"
import type { User } from "../user"
import type { UserGameState } from "../games/gameCommon"


export interface GameServices {
    onPlayerLeave(userId: User["id"]): Promise<void>
    onAbortTable(ids : User["id"][]): Promise<DeleteResult>
    getOpponentsGameState(tableId: Table["id"], ids : User["id"][]):Promise<UserGameState[]>
  //   onTableEmpty(tableId: Table["id"]): Promise<void>
//   cleanupTable(tableId: Table["id"]): Promise<void>
}



