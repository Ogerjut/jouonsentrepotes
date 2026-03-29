import type { ChessTeams, RookType, Tile } from "$lib/types/games/chess.js"
import { LongRangePiece } from "./longRangePiece.js"

export default class Rook extends LongRangePiece implements RookType {
    type = "rook" as const
    firstMove : boolean = true

    static RULES : number[][] = [[0,1] , [1,0], [-1,0 ], [0,-1]]

    static fromJSON(v: RookType) {
        const p = new Rook(v.pos, v.team)
        p.captured = v.captured
        p.previousPos = v.previousPos
        p.firstMove = v.firstMove
        return p
    }

    constructor (pos : Tile , team : ChessTeams) {
        super(pos, team, Rook.RULES)
    }

}