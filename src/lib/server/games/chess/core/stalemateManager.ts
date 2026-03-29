import type { ChessPiece, ChessTeams } from "$lib/types/games/chess";
import { deleteArrayElement, valueInArray } from "../utils/misc";
import type { MovesHistory } from "./movesHistory";
import type { PiecesManager } from "./piecesManager";

export class DrawManager {
    static getDrawByMissingPiece(pieces : ChessPiece[]){
        const withoutKings = pieces.filter(p => p.type !== "king")
        if (withoutKings.length === 0) return true 
        if (withoutKings.length !== 1) return false  
        return withoutKings[0].type === "bishop" || withoutKings[0].type === "knight"
    }

    static getDrawData(params : {isKingStalemate ?: boolean, rule50thMoves ?: boolean, drawByRepetion ?: boolean, drawByMissingPieces ?: boolean}){
        const {isKingStalemate, rule50thMoves, drawByRepetion, drawByMissingPieces} = params
        if (isKingStalemate) return "le roi n'a plus de déplacement valide."
        if (rule50thMoves) return "il n'y a pas eu de capture ou de déplacement de pion depuis 50 coups."
        if (drawByRepetion) return "la position a été répétée 3 fois."
        if (drawByMissingPieces) return "il n'y a plus assez de matériel pour mener une attaque de mat"
    }
}

export class StalemateManager {
    private pm : PiecesManager
    private movesHistory : MovesHistory
    private positionHistory : Map<string, number>

    constructor(pm : PiecesManager, movesHistory : MovesHistory, positionHistory : Record<string, number>){
        this.movesHistory = movesHistory
        this.positionHistory = new Map(Object.entries(positionHistory))
        this.pm = pm
    }

    private checkIsKingStalemate(currentPlayer : ChessTeams) {
        const opponentKing = this.pm.getOpponentKing(currentPlayer)
        const kingMoves = opponentKing.computeValidMoves(opponentKing.pos, this.pm)
        const tiles = this.pm.tilesControlled(currentPlayer)
        let piecesMoves = this.pm.opponentPossibleMoves(currentPlayer)
        const kingMovesControlled = []
        kingMoves.forEach(move => {
            piecesMoves = deleteArrayElement(move, piecesMoves)
            if (valueInArray(move, tiles)){
                kingMovesControlled.push(move)
            }
        })
        const isStalemate = !opponentKing.check && piecesMoves.length === 0 && kingMovesControlled.length === kingMoves.length
        if (isStalemate) opponentKing.stalemate = true 
        return isStalemate
    }

    getPositionHistory(){
        return this.positionHistory
    }

    execute(currentPlayer : ChessTeams) : {isDraw : boolean, reason ?: string} {
        const isKingStalemate = this.checkIsKingStalemate(currentPlayer)
        const rule50thMoves = this.movesHistory.getIs50thMoveWithoutCaptureOrPawnMoved()
        const drawByRepetion = this.getDrawByRepetition(currentPlayer)
        const drawByMissingPieces = DrawManager.getDrawByMissingPiece(this.pm.getPieces())
    
        const isDraw = isKingStalemate || rule50thMoves || drawByRepetion || drawByMissingPieces
        const reason = DrawManager.getDrawData({isKingStalemate, rule50thMoves, drawByRepetion, drawByMissingPieces})

        return {isDraw, reason}
    } 

    private getDrawByRepetition(currentPlayer : ChessTeams){
        const key = this.generateKey(currentPlayer)
        const count = this.positionHistory.get(key) || 0
        this.positionHistory.set(key, count + 1)
        const repetition = this.positionHistory.get(key)
        if (!repetition) return false 
        return repetition >= 3
    }

    private generateKey(turn : ChessTeams) : string {
        const pieces = this.pm.getPieces()

        const boardPart = pieces
            .map(p => `${p.type}_${p.team}_${p.pos[0]}_${p.pos[1]}`)
            .sort()
            .join("|")

        const castlingPart = this.getCastlingRights()
        const enPassantPart = this.getEnPassantSquare()

        return `${boardPart}__${turn}__${castlingPart}__${enPassantPart}`
    }

    private getCastlingRights(): string {
        const whiteKing = this.pm.getMyKing("white")
        const blackKing = this.pm.getMyKing("black")

        return [
            whiteKing.firstMove ? "K" : "",
            blackKing.firstMove ? "k" : "",
        ].join("")
    }

    private getEnPassantSquare(): string {
        const pawn = this.pm.getPieces().find(
            p => p.type === "pawn" && p.canBeCapturedEnPassant
        )

        return pawn ? `${pawn.pos[0]}_${pawn.pos[1]}` : "-"
    }
}
