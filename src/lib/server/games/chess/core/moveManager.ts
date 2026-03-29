import type { ChessPiece, Tile } from "$lib/types/games/chess";
import Pawn from "./entities/pawn";
import type { PiecesManager } from "./piecesManager";
import King from "./entities/king";
import { valueInArray } from "../utils/misc";

export class MoveManager {
    private pm : PiecesManager

    constructor(pm : PiecesManager){
        this.pm = pm 
    }
    

    checkIsValidMove(activePiece : ChessPiece, dest : Tile): boolean {
        const origin = activePiece.pos
        const moves = activePiece.computeValidMoves(origin, this.pm)
        
        if (activePiece instanceof King) {
            moves.push(...activePiece.getCastleMoves(this.pm))
        }
        if (activePiece instanceof Pawn) {
            const pawn = activePiece.checkPriseEnPassant(dest, this.pm.getPieceOnTile)
            if (pawn){
                moves.push(dest)
                this.pm.setPawnToBeCapturedEnPassant(pawn)
            }
        }
        console.log("possibles moves : ", moves)
        return valueInArray(dest, moves) && !this.pm.allyOnDest(activePiece.team, dest)
    }



    // a mettre dans l'instance de Pawn !!! 
    getPawnPromotion(activePiece : ChessPiece){
        if (!(activePiece instanceof Pawn)) return false            
        return activePiece.canPawnBePromoted()
    }


    



}

   
