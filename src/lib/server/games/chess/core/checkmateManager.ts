import type { ChessPiece, ChessTeams, KingType, Tile } from "$lib/types/games/chess";
import { areElementsArrayEqual, valueInArray } from "../utils/misc";
import Bishop from "./entities/bishop";
import King from "./entities/king";
import Knight from "./entities/knight";
import { LongRangePiece } from "./entities/longRangePiece";
import Pawn from "./entities/pawn";
import Queen from "./entities/queen";
import Rook from "./entities/rook";
import type { PiecesManager } from "./piecesManager";

export class CheckmateManager {
    private pm : PiecesManager
    private opponentKing : King

    constructor(pm : PiecesManager, team : ChessTeams){
        this.pm = pm
        this.opponentKing = this.pm.getOpponentKing(team)
    }

    execute(activePiece : ChessPiece, dest : Tile) : boolean{
        const pieces = this.pm.getPieces()

        const activePieceViewLine = this.getViewLine(this.opponentKing, activePiece, dest)
        const {kingMoves, opponentMoves} = this.getOpponentMoves(pieces, activePiece)
        const myMoves = this.pm.tilesControlled(activePiece.team)

        const validKingMoves = kingMoves.filter(m => !valueInArray(m, myMoves))
        const opponentValidMoves = opponentMoves.filter(m => valueInArray(m, activePieceViewLine))
        const isCheckmate = validKingMoves.length === 0 && opponentValidMoves.length === 0 && this.opponentKing.check
        if (isCheckmate){
            this.opponentKing.checkmate = true
        }
        return isCheckmate
    }

    private getViewLine(king : KingType, activePiece : ChessPiece, dest : Tile) : Tile[] {
        if (!(activePiece instanceof LongRangePiece)) return []
        console.log("active piece type to get view line :", activePiece.type)
        const viewLine = [dest]
        const directions = activePiece.getMoveDirection(dest, king.pos)
        let n = 0 
        const dx = Math.abs(king.pos[0] - activePiece.pos[0])
        const dy = Math.abs(king.pos[1] - activePiece.pos[1])
        if (dx === dy) {n = dx}
        if (dx === 0) {n = dy}
        if (dy === 0) {n = dx}

        for (let i = 1; i <= n ; i++) {
            const pos = activePiece.calculateCoords(dest, directions, i)
            if (activePiece.isMoveOnBoard(pos)) {
                if (!areElementsArrayEqual(pos, king.pos)) {
                    viewLine.push(pos)
                } 
            }
        }
        // console.log("viewLine : ", viewLine)
        return viewLine
    }

    private getOpponentMoves(pieces : ChessPiece[], activePiece : ChessPiece) {
        let kingMoves : Tile[] = []
        const opponentMoves : Tile[] = []

        pieces.forEach(piece => {
            if (piece.team !== activePiece.team){
                if (piece instanceof King) {
                    kingMoves = piece.computeValidMoves(piece.pos,  this.pm)
                }
                else if (piece instanceof Pawn) {
                    opponentMoves.push(...piece.computeValidMoves(piece.pos, this.pm))
                    opponentMoves.push(...piece.getMovesCheck(piece.pos))                    
                }
                else if (piece instanceof Queen || piece instanceof Rook || piece instanceof Bishop || piece instanceof Knight) {
                    opponentMoves.push(...piece.computeValidMoves(piece.pos, this.pm))
                }
            }
        })

        return {kingMoves, opponentMoves}
    }



}


 