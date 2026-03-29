import type { ChessMove } from "$lib/types/games/chess";

export class MovesHistory {
    private moves : ChessMove[]

    constructor(moves : ChessMove[]){
        this.moves = moves
    }

    addMove(move : ChessMove){
        this.moves.push(move)
    }

    getAllMoves(){
        return this.moves
    }

    // getTeamMoves(team : ChessTeams) : ChessMove[] {
    //     return this.moves.filter(m => m.piece.team === team)
    // }

    getIs50thMoveWithoutCaptureOrPawnMoved() : boolean{
        const last50moves = this.moves.slice(-100)
        if (last50moves.length < 100) return false 
        const pawnMoved = last50moves.some(m => m.piece.type === "pawn")
        const pieceCaptured = last50moves.some(m => m.captureOccurred)
        return !pawnMoved && !pieceCaptured
    }
        
}
