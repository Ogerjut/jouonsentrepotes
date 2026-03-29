import type { ChessTeams, KnightType, Tile } from "$lib/types/games/chess.js"
import type { PiecesManager } from "../piecesManager.js"
import { ShortRangePiece } from "./shortRangePiece.js"

export default class Knight extends ShortRangePiece implements KnightType {
    type = "knight" as const
    rulesMove : number[][] = [[2,1] , [1,2], [-2,1] , [-1,2], [2,-1] , [1,-2], [-2,-1] , [-1,-2]]
   
    static fromJSON(v: KnightType) {
        const p = new Knight(v.pos, v.team)
        p.captured = v.captured
        p.previousPos = v.previousPos
        return p
    }

    constructor (pos : Tile, team : ChessTeams) {
        super(pos, team)
    }
    
    computeValidMoves(origin : Tile, pm : PiecesManager) : Tile[] {
        const moves : Tile[] = []
        this.rulesMove.forEach(move => {
            const coord = this.calculateCoord(origin, move)
            if (!this.isMoveOnBoard(coord)){
                return
            }
           moves.push(coord)
            const piece = pm.getPieceOnTile(coord)
            if (piece && piece.team === this.team) {
                return  
            } else {
               moves.push(coord)
            }
        })
        return moves
    }
}