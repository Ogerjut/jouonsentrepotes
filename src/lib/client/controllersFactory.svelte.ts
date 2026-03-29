import type { GameType } from "$lib/types/table";
import { beloteController } from "./games/belote/BeloteController.svelte";
import { chessController } from "./games/chess/chessController.svelte";
import { tarotController } from "./games/tarot/TarotController.svelte";
import { yamsController } from "./games/yams/yamsController.svelte";


export class ControllerFactory {

    static get(gameType : GameType){
        switch(gameType){
            case "belote" : 
                return beloteController
            case "chess" : 
                return chessController
            case "tarot" : 
                return tarotController
            case "yams" : 
                return yamsController
        }
    }
}