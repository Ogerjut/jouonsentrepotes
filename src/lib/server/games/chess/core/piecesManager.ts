import type { ChessBoard, ChessPiece, ChessTeams, PiecesType, Tile } from "$lib/types/games/chess"
import { WHITE } from "../utils/const"
import King from "./entities/king"
import Pawn from "./entities/pawn"
import { PiecesFactory } from "./entities/piecesFactory"
import Rook from "./entities/rook"

export class PiecesManager {
    private board : ChessBoard
    private pieces : ChessPiece[]
    private pawnToBeCapturedEnPassant : Pawn | undefined = undefined
    private pieceToBeCaptured : ChessPiece | undefined = undefined
    private piecesFactory : PiecesFactory = new PiecesFactory()
    captureOccured : boolean = false

    constructor(board : ChessBoard){
        this.board = board
        this.pieces = this.getPiecesArrayFromBoard()
    }

    // isLegalMove(activePiece : ChessPiece, dest : Tile, origin : Tile){
    //     const moves = activePiece.computeValidMoves(origin, this)

    //     if (activePiece instanceof King) {
    //        moves.push(...activePiece.getCastleMoves(this))
    //     }
    //     if (activePiece instanceof Pawn) {
    //         this.pawnToBeCapturedEnPassant = activePiece.checkPriseEnPassant(dest, this.getPieceOnTile)
    //         if (this.pawnToBeCapturedEnPassant) moves.push(dest)
    //     }
    //     console.log("possibles moves : ", moves)
    //     return valueInArray(dest, moves) && !this.allyOnDest(activePiece.team, dest)
    // }

    getPieces(){
        return this.pieces
    }

    getPiecesArrayFromBoard() : ChessPiece[] {
        return this.board.flatMap(row =>
            row.filter(p => p !== null).map(p => this.piecesFactory.fromJSON(p))
        )
    }

    getActivePiece(activePiece : ChessPiece) : ChessPiece {
        const piece = this.pieces.find(p => p.pos[0] === activePiece.pos[0] && p.pos[1] === activePiece.pos[1])
        if (!piece) throw new Error("error in getActivePiece, return undefined")
        return piece
    }

    getPieceOnTile = (tile : Tile) : ChessPiece | undefined => {
        return this.pieces.find(p => p.pos[0] === tile[0] && p.pos[1] === tile[1])
    }

    allyOnDest(team : ChessTeams, dest : Tile) : boolean {
        const p = this.getPieceOnTile(dest)
        return p?.team === team 
    }

    ennemyOnDest(team : ChessTeams, dest : Tile) : boolean {
        const p = this.getPieceOnTile(dest)
        return p?.team !== team 
    }

    getMyKing(team : ChessTeams) : King {
        const king = this.pieces.find(p => p.team === team && p instanceof King)
        if (!king || !(king instanceof King)) throw new Error("error in get king")
        return king
    }

    getOpponentKing(team : ChessTeams) : King{
        const king = this.pieces.find(p => p.team !== team && p instanceof King)
        if (!king || !(king instanceof King)) throw new Error("error in get opponent king")
        return king
    }

    tilesControlled(team : ChessTeams) : Tile[] {
        const tiles : Tile[] = []
        this.pieces.forEach(p => {
            if (p.team === team ){
                const moves = (p instanceof Pawn) ? p.getMovesCheck(p.pos) : p.computeValidMoves(p.pos, this)
                tiles.push(...moves)
            }
        })
        return tiles
    }

    tilesControlledByOpponnent(team : ChessTeams) : Tile[] {
        const tiles : Tile[] = []
        this.pieces.forEach(p => {
            if (p.team !== team ){
                const moves = (p instanceof Pawn) ? p.getMovesCheck(p.pos) : p.computeValidMoves(p.pos, this)
                tiles.push(...moves)
            }
        })
        return tiles
    }

    setPieceToBeCaptured(team : ChessTeams, dest : Tile){
        console.log("set piece to be capture :", team, dest)
        console.log(this.ennemyOnDest(team, dest))
        console.log(this.getPieceOnTile(dest))
        this.pieceToBeCaptured = this.ennemyOnDest(team, dest) ? this.getPieceOnTile(dest) : undefined
        console.log("piece to be captured : ", this.pieceToBeCaptured)
    }

    setPieceToBeCapturedEnPassant(piece : ChessPiece, origin : Tile, dest : Tile){
        if (!(piece instanceof Pawn)) return
        piece.setBeCapturedEnPassant(origin, dest)     
    }

    capture(piece : ChessPiece | null | undefined){
        if (!piece) return
        if (piece instanceof King) return 
        console.log('piece captured :', piece)
        piece.captured = true
        this.captureOccured = true 
        this.pieces = this.pieces.filter(p => p.captured === false)
    }

    resolveCapture(){
        this.capture(this.pieceToBeCaptured)
    }

    resolveCaptureEnPassant(activePiece : ChessPiece){
        if (!this.pawnToBeCapturedEnPassant || !(activePiece instanceof Pawn)) return
        const dist = Math.abs(this.pawnToBeCapturedEnPassant.pos[0]-activePiece.pos[0])
        if (dist !== 0) return  
        this.capture(this.pawnToBeCapturedEnPassant)
        console.log("pawn captured en passant")
    }

    updateEnPassant(team : ChessTeams){
        this.pieces.forEach(p => {
            if((p instanceof Pawn) && team != p.team){
                p.canBeCapturedEnPassant = false
            } else if ((p instanceof Pawn) && team === p.team){
                p.canCaptureEnPassant = false 
            }
        })
    }

    updateFirstMove(activePiece : ChessPiece){
        if (!(activePiece instanceof Rook) && !(activePiece instanceof King) && !(activePiece instanceof Pawn) ) return
        activePiece.firstMove = false 
    }

    opponentPossibleMoves(team : ChessTeams){
        const tiles : Tile[] = []
        this.pieces.forEach(piece => {
            if (piece.team !== team){
                tiles.push(...piece.computeValidMoves(piece.pos, this))
            }
        })
        return tiles
    }

    updateBeforeMove(activePiece : ChessPiece, origin : Tile, dest : Tile) {
        console.log("update before move")
        this.setPieceToBeCaptured(activePiece.team, dest)
        this.setPieceToBeCapturedEnPassant(activePiece, origin, dest)
    }

    updateAfterMove(activePiece : ChessPiece){
        console.log("update after move")
        this.resolveCapture()
        this.resolveCaptureEnPassant(activePiece)
        this.updateEnPassant(activePiece.team)
        this.updateFirstMove(activePiece)
    }

    promotePawn(piece : PiecesType, team : ChessTeams){
        const y = team === WHITE ? 0 : 7
        const predicat = (p : ChessPiece) => {return p.pos[1] === y && p.team === team && p.type === "pawn"}
        const pawn = this.pieces.find(p => predicat(p) )
        if (!pawn) return
        
        this.pieces.filter(p => !predicat(p))
        const newPiece = PiecesFactory.get({type : piece, team, pos : pawn.pos})
        if (newPiece instanceof Rook) {
            newPiece.firstMove = false 
        }
        this.pieces.push(newPiece)
        return newPiece
    }

    setPawnToBeCapturedEnPassant(pawn : Pawn){
        this.pawnToBeCapturedEnPassant = pawn
    }


}