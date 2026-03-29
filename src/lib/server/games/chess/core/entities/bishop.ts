import type { BishopType, ChessTeams, Tile } from "$lib/types/games/chess";
import { LongRangePiece } from "./longRangePiece";


export default class Bishop extends LongRangePiece implements BishopType {
    type = "bishop" as const

    static RULES : number[][] = [[1,1] , [-1,1], [-1,-1] , [1,-1]]

    static fromJSON(v: BishopType) {
        const p = new Bishop(v.pos, v.team)
        p.captured = v.captured
        p.previousPos = v.previousPos
        return p
    }

    constructor (pos : Tile, team : ChessTeams) {
        super(pos, team, Bishop.RULES)
       
    }

}