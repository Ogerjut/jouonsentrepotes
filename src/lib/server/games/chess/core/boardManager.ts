import type { ChessBoard, ChessPiece } from "$lib/types/games/chess";
import { PIECES_DEFAULT, PIECES_TEST_CASTLE, PIECES_TEST_CHECK, PIECES_TEST_CHECKMATE, PIECES_TEST_DRAW, PIECES_TEST_PAWN_PROMOTION, PIECES_TEST_STALEMATE, SIZE } from "../utils/const";
import { PiecesFactory } from "./entities/piecesFactory";


export function createBoard() : ChessBoard{
    const board = Array.from({ length: SIZE }, () =>
        Array<ChessPiece | null>(SIZE).fill(null)
    );
    for (const piece of PIECES_TEST_DRAW) {
        board[piece.pos[1]][piece.pos[0]] = PiecesFactory.get(piece);
    }
    return board
}

export function reCreateBoard(pieces : ChessPiece[]) : ChessBoard {
    const board = Array.from({ length: SIZE }, () =>
        Array<ChessPiece | null>(SIZE).fill(null)
    );
    for (const piece of pieces) {
        board[piece.pos[1]][piece.pos[0]] = piece
    }
    return board
}