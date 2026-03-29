import type { ChessTeams, ShortRangePieceType, Tile } from "$lib/types/games/chess"
import { Entities } from "./entities"

export class ShortRangePiece extends Entities implements ShortRangePieceType {
    constructor(pos : Tile, team : ChessTeams){
        super(pos, team)
    }

    calculateCoord(pos : Tile, move : Tile ) : Tile{
        return [pos[0] + move[0], pos[1] + move[1]]

    }
}