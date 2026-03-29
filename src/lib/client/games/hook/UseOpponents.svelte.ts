import type { User } from "$lib/types/user"
import { socket } from "../../socket"

let opponents = $state<User[]|[]>([])

export const useOpponents = () => opponents

export function resetOpponent(){opponents = []}

export async function fetchOpponents() {
    socket.emit("getOpponents", (users : User[]) => {
        opponents = users
    })
}
