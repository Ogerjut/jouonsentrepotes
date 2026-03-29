import type { ChessPiece, ChessTeams, PawnType, Tile } from "$lib/types/games/chess.js"
import { BLACK, WHITE } from "../../utils/const.js"
import { areElementsArrayEqual, deleteArrayElement, valueInArray } from "../../utils/misc.js"
import type { PiecesManager } from "../piecesManager.js"
import { Entities } from "./entities"


export default class Pawn extends Entities implements PawnType {
    type = "pawn" as const
    rulesMove : number[][] = [[0,1], [-1,1], [1,1]]
    firstMove: boolean = true 
    canCaptureEnPassant: boolean = false
    canBeCapturedEnPassant: boolean = false

    static fromJSON(v: PawnType) {
        const p = new Pawn(v.pos, v.team)
        p.captured = v.captured
        p.previousPos = v.previousPos
        p.firstMove = v.firstMove
        p.canCaptureEnPassant = v.canCaptureEnPassant
        p.canBeCapturedEnPassant = v.canBeCapturedEnPassant
        return p
    }

    constructor(pos: Tile, team: ChessTeams) {
        super(pos, team)
    }

    calculateCoord(pos : Tile, pos2 : Tile){
        return this.team === WHITE ? [pos[0] - pos2[0], pos[1] - pos2[1]] : [pos[0] + pos2[0], pos[1] + pos2[1]]
    }

    computeValidMoves(origin : Tile, pm : PiecesManager ) : Tile[] {
        let moves : Tile[] = []

        if (this.firstMove){
            this.rulesMove.push([0,2])
        }

        this.rulesMove.forEach( move => {
        const coord = this.calculateCoord(origin, move)
        if (!this.isMoveOnBoard(coord)){
            return
        }

        // vérifier pas de piece devant pion si fait son 1er move
        if (areElementsArrayEqual(move, [0,2])) {
            const coord1 = this.calculateCoord(origin, [0,1])
            const piece = pm.getPieceOnTile(coord1)
            if (piece) return 
        }
        moves.push(coord)

        const piece = pm.getPieceOnTile(coord)
        if (!piece) {
            if (valueInArray(move, [[1,1], [-1,1]])  && valueInArray(coord, moves)){
                // console.log("pas de pièce sur la case de capture, coord retirée des cases possibles ", coord)
                moves = [...deleteArrayElement(coord, moves)]
            }
        } else {
            if (valueInArray(move, [[0,1], [0,2]]) && valueInArray(coord, moves)){
                // console.log("pièce alliée ou ennemie sur la trajectoire du pion", coord)
                moves = [...deleteArrayElement(coord, moves)]
            }
            if (piece.team === this.team && valueInArray(move, [[1,1], [-1,1]]) && valueInArray(coord, moves)) {
                // console.log("piece alliée sur case de capture", coord);
                moves = [...deleteArrayElement(coord, moves)]
            }
        }

        })

        if (this.firstMove){
            this.rulesMove.pop()
        }

        return moves

    }

    checkPriseEnPassant(dest : Tile, getPieceOnTile : (tile : Tile) => ChessPiece | undefined) : Pawn | undefined {
        console.log('check prise en passant')
        const coord = (this.team === WHITE && this.pos[1] === 3) ? [dest[0], dest[1] + 1] 
                    : (this.team === BLACK && this.pos[1] === 4) ? [dest[0], dest[1] - 1]
                    : null
        console.log('coord : ', coord)
        if (!coord) return 
        const piece = getPieceOnTile(coord)
        console.log(piece)
        if (!(piece && piece instanceof Pawn && piece.canBeCapturedEnPassant)) return
        this.canCaptureEnPassant = true
        // this.possibleTiles.push(dest)
        return piece
        
    }

    getMovesCheck(origin : Tile) : Tile[] {
        const moves : Tile[] = []
        this.rulesMove.forEach( move => {
            if (valueInArray(move, [[0,1], [0,2]])) {
                return 
            }
            const coord = this.calculateCoord(origin, move)
            if (this.isMoveOnBoard(coord)) {
                moves.push(coord)
            }
        })
        return moves
    }

    canPawnBePromoted(){
        if (this.team === WHITE && this.pos[1] === 0){
            return true 
        }
        if (this.team === BLACK && this.pos[1] === 7){
            return true 
        }
        return false
    }

    setBeCapturedEnPassant(origin : Tile, dest : Tile){
        console.log("check can be captured en passant")
        const dist = Math.abs(origin[1] - dest[1])
        if (this.firstMove && dist === 2 ){
            this.canBeCapturedEnPassant = true
            console.log("can be captured en passant next turn")
        }
    }

    }