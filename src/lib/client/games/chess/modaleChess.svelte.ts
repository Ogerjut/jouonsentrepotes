import { useModale, type ModaleActions } from "../hook/useModale.svelte"
import { chessController } from "./chessController.svelte"


const modale = useModale()

export function getChessActionsModale(actions : string[]): ModaleActions[] {
    return actions.map(a => actionMap[a])
}

const actionMap: Record<string, ModaleActions> = {
    home: {
        name: "Retour au menu",
        onclick: () => chessController.leave()
    }, 
    accept : {
        name : "Accepter", 
        onclick : () => {
            modale.close() 
            chessController.respDraw()
        }
    }, 
    decline : {
        name : "Refuser", 
        onclick : () => modale.close() 
    }, 
    giveup : {
        name : "Abandonner",
        onclick : () => {
            modale.close() 
            chessController.giveup()
        }
    }, 
    cancel : {
        name : "Annuler",
        onclick : () => modale.close()
    }, 
    askDraw : {
        name : "Demander la nulle",
        onclick : () => {
            modale.close() 
            chessController.askDraw()
        }
    }, 
};