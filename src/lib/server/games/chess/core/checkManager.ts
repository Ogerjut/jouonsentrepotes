import type { ChessTeams } from "$lib/types/games/chess";
import { valueInArray } from "../utils/misc";
import King from "./entities/king";
import type { PiecesManager } from "./piecesManager";


export class CheckManager {
    private pm : PiecesManager
    private myTeam : ChessTeams
    private myKing : King
    private opponentKing : King

    constructor(pm : PiecesManager, team : ChessTeams){
        this.pm = pm
        this.myTeam = team
        this.myKing = pm.getMyKing(team)
        this.opponentKing = pm.getOpponentKing(team)
    }

    isMyKingCheck(){
        const tiles = this.pm.tilesControlledByOpponnent(this.myTeam)
        return valueInArray(this.myKing.pos, tiles)
    }

    resetMyKingCheck(){
        if (this.myKing.check){
            this.myKing.check = false
        }
    }

    isOpponentKingCheck(){
        const tiles = this.pm.tilesControlled(this.myTeam)
        return valueInArray(this.opponentKing.pos, tiles)
    }

    setOpponentKingCheck(isCheck : boolean){
        if (!isCheck) return 
        this.opponentKing.check = true 
    }




}