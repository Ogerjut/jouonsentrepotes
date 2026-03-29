import type { ChessTeams, initChessPiece } from "$lib/types/games/chess";

export const BLACK: ChessTeams = "black";
export const WHITE: ChessTeams = "white";
export const SIZE = 8 ; 

export const PIECES_DEFAULT = [
    {type : "rook", team : BLACK, pos : [0, 0]},
    {type : "knight", team : BLACK, pos : [1, 0]}, 
    {type : "bishop", team : BLACK, pos : [2, 0]}, 
    {type : "queen", team : BLACK, pos : [3, 0]}, 
    {type : "king", team : BLACK, pos : [4, 0]}, 
    {type : "bishop", team : BLACK, pos : [5, 0]},
    {type : "knight", team : BLACK, pos : [6, 0]}, 
    {type : "rook", team : BLACK, pos : [7, 0]},
    ...Array.from({length : 8}, (_, i) : initChessPiece => ({type : "pawn", team : BLACK, pos : [i, 1]})),
    {type : "rook", team : WHITE, pos : [0, 7]},
    {type : "knight", team : WHITE, pos : [1, 7]}, 
    {type : "bishop", team : WHITE, pos : [2, 7]}, 
    {type : "queen", team : WHITE, pos : [3, 7]}, 
    {type : "king", team : WHITE, pos : [4, 7]}, 
    {type : "bishop", team : WHITE, pos : [5, 7]},
    {type : "knight", team : WHITE, pos : [6, 7]}, 
    {type : "rook", team : WHITE, pos : [7, 7]},
    ...Array.from({length : 8}, (_, i) : initChessPiece => ({type : "pawn", team : WHITE, pos : [i, 6]}))
] satisfies initChessPiece[]


export const PIECES_TEST_CHECK = [
    {type : "rook", team : BLACK, pos : [0, 0]},
    {type : "knight", team : BLACK, pos : [1, 0]}, 
    {type : "bishop", team : BLACK, pos : [2, 0]}, 
    {type : "queen", team : BLACK, pos : [3, 0]}, 
    {type : "king", team : BLACK, pos : [4, 0]}, 
    {type : "bishop", team : BLACK, pos : [5, 0]},
    {type : "knight", team : BLACK, pos : [6, 0]}, 
    {type : "rook", team : BLACK, pos : [7, 0]},
    {type : "rook", team : WHITE, pos : [0, 7]},
    {type : "knight", team : WHITE, pos : [1, 7]}, 
    {type : "bishop", team : WHITE, pos : [2, 7]}, 
    {type : "queen", team : WHITE, pos : [3, 7]}, 
    {type : "king", team : WHITE, pos : [4, 7]}, 
    {type : "bishop", team : WHITE, pos : [5, 7]},
    {type : "knight", team : WHITE, pos : [6, 7]}, 
    {type : "rook", team : WHITE, pos : [7, 7]},
] satisfies initChessPiece[]

export const PIECES_TEST_CASTLE = [
    {type : "rook", team : BLACK, pos : [5, 1]},
    {type : "knight", team : BLACK, pos : [1, 0]}, 
    {type : "bishop", team : BLACK, pos : [2, 0]}, 
    {type : "queen", team : BLACK, pos : [3, 0]}, 
    {type : "king", team : BLACK, pos : [4, 0]}, 
    {type : "bishop", team : BLACK, pos : [5, 0]},
    {type : "knight", team : BLACK, pos : [6, 0]}, 
    {type : "rook", team : BLACK, pos : [7, 0]},
    {type : "rook", team : WHITE, pos : [0, 7]},
    {type : "knight", team : WHITE, pos : [1, 7]}, 
    {type : "bishop", team : WHITE, pos : [2, 7]}, 
    {type : "queen", team : WHITE, pos : [3, 7]}, 
    {type : "king", team : WHITE, pos : [4, 7]}, 
    {type : "rook", team : WHITE, pos : [7, 7]},
] satisfies initChessPiece[]

export const PIECES_TEST_CHECKMATE = [
    {type : "king", team : BLACK, pos : [4, 0]}, 
    {type : "pawn", team : BLACK, pos : [5, 1]},
    {type : "rook", team : WHITE, pos : [0, 7]},
    {type : "knight", team : WHITE, pos : [1, 7]}, 
    {type : "bishop", team : WHITE, pos : [2, 7]}, 
    {type : "queen", team : WHITE, pos : [3, 7]}, 
    {type : "king", team : WHITE, pos : [4, 7]}, 
    {type : "rook", team : WHITE, pos : [7, 7]},
] satisfies initChessPiece[]


export const PIECES_TEST_STALEMATE = [
    {type : "king", team : BLACK, pos : [7, 0]}, 
    {type : "pawn", team : BLACK, pos : [7, 1]},
    {type : "rook", team : WHITE, pos : [0, 7]},
    {type : "knight", team : WHITE, pos : [1, 7]}, 
    {type : "bishop", team : WHITE, pos : [7, 2]}, 
    {type : "queen", team : WHITE, pos : [3, 7]}, 
    {type : "king", team : WHITE, pos : [4, 7]}, 
    {type : "rook", team : WHITE, pos : [7, 7]},
] satisfies initChessPiece[]


export const PIECES_TEST_PAWN_PROMOTION = [
    {type : "king", team : BLACK, pos : [7, 0]}, 
    {type : "pawn", team : BLACK, pos : [7, 1]},
    {type : "rook", team : WHITE, pos : [0, 7]},
    {type : "knight", team : WHITE, pos : [1, 7]}, 
    {type : "bishop", team : WHITE, pos : [7, 2]}, 
    {type : "queen", team : WHITE, pos : [3, 7]}, 
    {type : "king", team : WHITE, pos : [4, 7]}, 
    {type : "rook", team : WHITE, pos : [7, 7]},
    {type : "pawn", team : WHITE, pos : [4, 1]},
    
] satisfies initChessPiece[]

export const PIECES_TEST_DRAW = [
    {type : "king", team : BLACK, pos : [7, 0]}, 
    {type : "bishop", team : WHITE, pos : [7, 1]},
    {type : "bishop", team : WHITE, pos : [7, 2]}, 
    {type : "king", team : WHITE, pos : [4, 7]}, 
    
] satisfies initChessPiece[]