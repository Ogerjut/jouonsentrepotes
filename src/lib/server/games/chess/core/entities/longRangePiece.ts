import type { ChessTeams, LongRangePieceType, Tile } from "$lib/types/games/chess";
import type { PiecesManager } from "../piecesManager";
import { Entities } from "./entities";

export class LongRangePiece extends Entities implements LongRangePieceType {
    rulesMove : number[][]
    constructor(pos : Tile, team : ChessTeams, rulesMove : number[][]){
        super(pos, team)
        this.rulesMove = rulesMove
    }

    calculateCoords(pos : Tile, move : Tile, i : number ) : Tile{
        return [pos[0] + i*move[0], pos[1] + i*move[1]]
    }

    computeValidMoves(origin : Tile, pm : PiecesManager) : Tile[] {
        const moves : Tile[] = []
        this.rulesMove.forEach(move => {
            for (let i = 1; i <= 8; i++) {
                const coord = this.calculateCoords(origin, move, i)

                if (!this.isMoveOnBoard(coord)){
                    break
                }

                const piece = pm.getPieceOnTile(coord)
                if (piece) {
                    moves.push(coord)
                    break
                } else {
                    moves.push(coord)
                }
            }
        })
        return moves
    }
}
