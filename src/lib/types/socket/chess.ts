import type { Chess } from "$lib/client/games/chess/useChess.svelte"
import type { ChessPiece, PiecesType, Tile, UserChessState } from "../games/chess"
import type { ChessTable } from "../table"


export interface ServerToClientChessEvents  {
    'chess:snapshot': (snapshot : Chess)=> void
    'chess:table' : (table: ChessTable) => void
    'chess:userGameState' : (state : UserChessState) => void
    'chess:reset' : () => void
    "chess:showModale" : (data : {title : string, message : string, actions : string[]}) => void
}

export interface ClientToServerChessEvents {
    "chess:move": (move : {piece : ChessPiece, dest : Tile}, response : (isLegal : boolean) => void) => void
    "chess:pawnPromoted" : (piece : PiecesType) => void
    "chess:giveup" : () => void
    "chess:askDraw" : () => void 
    "chess:onAcceptedDraw" : () => void

}