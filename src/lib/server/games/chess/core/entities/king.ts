import { deleteArrayElement, valueInArray } from "../../utils/misc.js";
import { ShortRangePiece } from "./shortRangePiece.js";
import type { ChessTeams, KingType, Tile } from "$lib/types/games/chess.js";
import type { PiecesManager } from "../piecesManager.js";
import Rook from "./rook.js";

export default class King extends ShortRangePiece implements KingType {
    type = "king" as const
    rulesMove : number[][] = [[0,1] , [1,0], [-1,0 ], [0,-1], [1,1],[-1,-1], [1,-1], [-1,1]]
    checkmate : boolean = false 
    check : boolean = false 
    stalemate : boolean = false 
    firstMove: boolean = true

    static fromJSON(v: KingType) {
        const p = new King(v.pos, v.team)
        p.captured = v.captured
        p.previousPos = v.previousPos
        p.checkmate = v.checkmate
        p.check = v.check
        p.firstMove = v.firstMove
        p.stalemate = v.stalemate
        return p
    }

    constructor (pos : Tile, team : ChessTeams) {
        super(pos, team)
    }

    computeValidMoves(origin : Tile, pm : PiecesManager) : Tile[] {
        let moves : Tile[] = []
        this.rulesMove.forEach(move => {
            const coord = this.calculateCoord(origin, move)
            if (!this.isMoveOnBoard(coord)) return
            moves.push(coord)
            const piece = pm.getPieceOnTile(coord)
            if (piece && piece.team === this.team){
                moves = deleteArrayElement(coord, moves)
            }
        })
        return moves
    }

    getCastleMoves(pm: PiecesManager) : Tile[] {
        const moves : Tile[] = []
        if (!this.firstMove || this.check) return []
        const y = this.pos[1]

        const rookRight = pm.getPieceOnTile([7, y])
        if (
            rookRight instanceof Rook &&
            rookRight.firstMove &&
            this.isPathClear([[5,y], [6,y]], pm) &&
            this.isSafePath([[4,y], [5,y], [6,y]], pm)
        ) {
            moves.push([6, y])
        }

        const rookLeft = pm.getPieceOnTile([0, y])
        if (
            rookLeft instanceof Rook &&
            rookLeft.firstMove &&
            this.isPathClear([[1,y], [2,y], [3,y]], pm) &&
            this.isSafePath([[4,y], [3,y], [2,y]], pm)
        ) {
            moves.push([2, y])
        }
        return moves
    }

    isPathClear(coords: Tile[], pm: PiecesManager): boolean {
        return coords.every(c => !pm.getPieceOnTile(c))
    }

    isSafePath(coords: Tile[], pm: PiecesManager): boolean {
        const enemyTiles = pm.tilesControlledByOpponnent(this.team)
        return coords.every(c => !valueInArray(c, enemyTiles))
    }

    // setCheckmate(){
    //     this.checkmate = !this.checkmate
    // }

    // setStalemate(){
    //     this.stalemate = !this.stalemate
    // }
}
