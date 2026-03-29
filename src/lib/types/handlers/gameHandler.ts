import type { TypedSocket } from "../socket"
import type { Table } from "../table"
import type { User } from "../user"


export interface GameHandler {
    onPlayerLeave(userId: User["id"]): Promise<void>
    onAbortTable(ids : User["id"][], tableId : Table["id"]): Promise<void>
    reset : (socket : TypedSocket) => void
    cleanup : (socket : TypedSocket) => void
}


