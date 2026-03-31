import { socket } from "$lib/client/socket";
import type { ChessPiece, PiecesType, Tile } from "$lib/types/games/chess";


class ChessController {

    async sendMove(piece : ChessPiece, dest : Tile){
        return socket.emitWithAck("chess:move", {piece, dest})
    }

    async pawnPromoted(pieceType : PiecesType){
        socket.emit("chess:pawnPromoted", pieceType)
    }

    async giveup(){
        socket.emit("chess:giveup")
    }

    async askDraw(){
        socket.emit("chess:askDraw")
    }

    async respDraw(){
        socket.emit("chess:onAcceptedDraw")
    }

}

export const chessController = new ChessController()