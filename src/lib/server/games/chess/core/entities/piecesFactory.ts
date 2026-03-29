import type { ChessPiece, initChessPiece } from "$lib/types/games/chess";
import Bishop from "./bishop";
import King from "./king";
import Knight from "./knight";
import Pawn from "./pawn";
import Queen from "./queen";
import Rook from "./rook";

export class PiecesFactory {

    static get(piece : initChessPiece){
        switch (piece.type) {
            case "pawn":
                return new Pawn(piece.pos, piece.team)
            case "rook":
                return new Rook(piece.pos, piece.team)
            case "knight":
                return new Knight(piece.pos, piece.team)
            case "bishop":
                return new Bishop(piece.pos, piece.team)
            case "queen":
                return new Queen(piece.pos, piece.team)
            case "king":
                return new King(piece.pos, piece.team)
            default :
                throw new Error("this piece doesnt exist")
        }
    }

    fromJSON(piece : ChessPiece){
        switch (piece.type) {
            case "pawn":
                return Pawn.fromJSON(piece)
            case "rook":
                return Rook.fromJSON(piece)
            case "knight":
                return Knight.fromJSON(piece)
            case "bishop":
                return Bishop.fromJSON(piece)
            case "queen":
                return Queen.fromJSON(piece)
            case "king":
                return King.fromJSON(piece)
            default :
                throw new Error("this piece doesnt exist")
        }
    }


}