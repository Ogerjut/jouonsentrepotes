import { useModale, type ModaleActions } from "./games/hook/useModale.svelte";
import { socket } from "./socket";


const modale = useModale()

export function sendLeaveTable(){
    modale.show(
        "Quitter la partie",
        "Es-tu sûr de vouloir quitter la partie en cours ?\n Une défaite te sera comptée.",
        getCoreActionsModale(["leave", "cancel"])
    )
}

export function getCoreActionsModale(actions : string[]): ModaleActions[] {
    return actions.map(a => actionMap[a])
}

const actionMap: Record<string, ModaleActions> = { 
    leave : {
        name : "Abandonner",
        onclick : () => {
            modale.close() 
            socket.emit("leaveTable")
        }
    }, 
    cancel : {
        name : "Annuler",
        onclick : () => modale.close()
    }, 
    
};