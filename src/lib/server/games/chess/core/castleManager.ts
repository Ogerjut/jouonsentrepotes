import type { ChessPiece, Tile } from "$lib/types/games/chess";
import King from "./entities/king";
import type { PiecesManager } from "./piecesManager";

export class CastleManager {
    private pm : PiecesManager

    constructor(pm : PiecesManager){
        this.pm = pm
    }

    execute(isCastle : boolean, origin : Tile, dest : Tile) {
        if (isCastle) {
            const y = origin[1]
            if (dest[0] === 6) {
                const rook = this.pm.getPieceOnTile([7, y])
                rook?.move([5, y])
            } else if (dest[0] === 2) {
                const rook = this.pm.getPieceOnTile([0, y])
                rook?.move([3, y])
            }
        }

    }

    checkIsCastle(piece : ChessPiece, origin : Tile){
        return ((piece instanceof King) && Math.abs(piece.pos[0] - origin[0]) === 2)
    }
    
}