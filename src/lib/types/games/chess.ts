// faire DTO ??? 

import type { PiecesManager } from "$lib/server/games/chess/core/piecesManager"

export interface ChessTableState {
        state : ChessState,
        timer : ChessTimer, 
        currentPlayer : ChessTeams, 
        board : ChessBoard, 
        allMoves : ChessMove[],
        onMoveData : OnMoveData, 
        positionHistory: Record<string, number>
        endGameReason ?: string
}

export interface UserChessState {
        id : string,
        username : string,
        team : ChessTeams | null,
        askingDraw : DrawCount
}

export type PiecesType = "pawn" | "knight" | "bishop" | "queen" | "king" | "rook"
export type ChessState = "created" | "game" | "pawnPromotion" | "endGame"
export type ChessTimer = 3 | 10 | 30 
export type ChessTeams = "black" | "white"
export type ChessPiece = PawnType | KnightType | BishopType | QueenType | KingType | RookType
export type Tile = number[]
export type ChessBoard = (ChessPiece | null)[][]
export type ChessMove = {piece : ChessPiece, dest : Tile, captureOccurred : boolean}
export type DrawCount = 3 | 2 | 1 | 0
export type ChessClockType = {
        startTime : number | null, 
        duration : number,
}

export type OnMoveData = {
        isValidMove : boolean | null,
        promotion : boolean,
        isCheck?: boolean,
        isCheckmate?: boolean,
        isStalemate?: boolean, 
        winner?: ChessTeams, 
        captureOccurred : boolean
}

export type EntitiesType = {
        isMoveOnBoard : (pos : Tile) => boolean
        move : (dest : Tile) => void
        getMoveDirection : (origin : Tile, dest : Tile) => Tile

}

export type LongRangePieceType = {
        calculateCoords : (pos : Tile, move : Tile, i : number ) => Tile

}

export type ShortRangePieceType = {
        calculateCoord : (pos : Tile, move : Tile ) => Tile
}

export type BasePiece = {
        pos : Tile
        team : ChessTeams
        rulesMove : number[][]
        captured : boolean
        previousPos : Tile | null
        computeValidMoves : (origin : Tile, pm : PiecesManager) => Tile[]
}

export type initChessPiece = {
        type : PiecesType
        pos : Tile
        team : ChessTeams
}

export type PawnType = BasePiece & EntitiesType & {
        type : "pawn"
        firstMove: boolean
        canCaptureEnPassant: boolean
        canBeCapturedEnPassant: boolean
}

export type KingType = BasePiece & EntitiesType & {
        type : "king"
        checkmate : boolean;
        check : boolean
        stalemate : boolean;
        firstMove : boolean
}

export type BishopType = BasePiece & EntitiesType & LongRangePieceType &{
        type : "bishop"
}

export type RookType = BasePiece & EntitiesType & LongRangePieceType &{
        type : "rook"
        firstMove : boolean
}

export type QueenType = BasePiece & EntitiesType & LongRangePieceType &{
        type : "queen"
}

export type KnightType = BasePiece & EntitiesType &{
        type : "knight"
}