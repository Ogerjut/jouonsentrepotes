import type { ChessTeams, QueenType, Tile } from "$lib/types/games/chess.js"
import { LongRangePiece } from "./longRangePiece.js"

export default class Queen extends LongRangePiece implements QueenType {
    type = "queen" as const
    
    static RULES : number[][] = [[0,1] , [1,0], [-1,0 ], [0,-1], [1,1] , [1,-1], [-1,1 ], [-1,-1]]
   
    static fromJSON(v: QueenType) {
        const p = new Queen(v.pos, v.team)
        p.captured = v.captured
        p.previousPos = v.previousPos
        return p
    }

    constructor (pos : Tile , team : ChessTeams) {
        super(pos, team, Queen.RULES)
        
    }

}