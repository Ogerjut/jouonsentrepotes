import type { User } from "$lib/types/user";
import type { DeleteResult } from "mongodb";
import type { GameServices } from "$lib/types/services/gameServices";
import type { TableRepository } from "../core/repositories/TableRepository";
import type { UserRepository } from "../core/repositories/UserRepository";
import type { ChessRepo } from "./chessRepository";
import type { ChessTable, Table } from "$lib/types/table";
import type { ChessBoard, ChessPiece, ChessState, ChessTeams, DrawCount, PiecesType, Tile, UserChessState } from "$lib/types/games/chess";
import { MoveManager } from "./core/moveManager";
import { MovesHistory } from "./core/movesHistory";
import { createBoard, reCreateBoard } from "./core/boardManager";
import { BLACK, WHITE } from "./utils/const";
import { PiecesManager } from "./core/piecesManager";
import { CheckManager } from "./core/checkManager";
import { CheckmateManager } from "./core/checkmateManager";
import type { TypedSocket } from "$lib/types/socket";
import { DrawManager, StalemateManager } from "./core/stalemateManager";
import { CastleManager } from "./core/castleManager";

export type handleMoveResult = {
    isLegal : boolean
    table : ChessTable,
}

export class ChessService implements GameServices {
    constructor(
        private chessRepo : ChessRepo,
        private tableRepo : TableRepository,
        private userRepo : UserRepository
    ){}

    async onPlayerLeave(userId : User["id"]) {
        console.log("player left, userState deleted : ", userId)
        await this.chessRepo.delete(userId)
    }

    async onAbortTable(ids: User["id"][]): Promise<DeleteResult> {
         return this.chessRepo.deleteMany(ids)
    }

    async getOpponentsGameState(tableId: Table["id"], ids: User["id"][]) : Promise<UserChessState[]> {
        return this.chessRepo.getUsersChessState(ids)
    }

    async getUserChessState(id: User["id"]){
        return this.chessRepo.getGameState(id)
    }

    private switchPlayer(currentPlayer : ChessTeams){
        return currentPlayer === WHITE ? BLACK : WHITE
    }

    async start(table : ChessTable) : Promise<ChessTable>{
        const ids = table.playersId
        const usersGameState = await this.chessRepo.getUsersChessState(ids)
        const shuffled = [...usersGameState].sort(() => Math.random() - 0.5)
        shuffled[0].team = WHITE
        shuffled[1].team = BLACK
        await Promise.all(
            shuffled.map(u => {
                this.chessRepo.update(u.id, {team : u.team})
            })
        )

        const board = createBoard()
        const newGameState = {...table.gameState, board, state : "game" as ChessState}
        await this.tableRepo.update(table.id, {gameState : newGameState})
        
        return {...table, gameState : newGameState} 
    }

    async handleMove(piece : ChessPiece, dest : Tile, tableId : string) : Promise<handleMoveResult>{
        const table = await this.tableRepo.getTableById(tableId) as ChessTable
        const board = table.gameState.board

        const pm = new PiecesManager(board)
        const activePiece = pm.getActivePiece(piece)
        const origin = activePiece.pos
      
        const moveManager = new MoveManager(pm)
        const castleManager = new CastleManager(pm)
        const checkManager = new CheckManager(pm, activePiece.team)
        const movesHistory = new MovesHistory(table.gameState.allMoves)

        const isValidMove = moveManager.checkIsValidMove(activePiece, dest)
        if (!isValidMove) return {table, isLegal : isValidMove}
        console.log("move valid ?", isValidMove)

        pm.updateBeforeMove(activePiece, origin, dest)
        activePiece.move(dest)

        const ownKingCheck = checkManager.isMyKingCheck()
        if (ownKingCheck) return {table, isLegal: false}

        const isCastle = castleManager.checkIsCastle(activePiece,origin)
        castleManager.execute(isCastle,origin, dest)

        pm.updateAfterMove(activePiece)
        const captureOccurred = pm.captureOccured
        checkManager.resetMyKingCheck()
        movesHistory.addMove({piece, dest, captureOccurred : captureOccurred})

        const promotion = moveManager.getPawnPromotion(activePiece)
        
        const resolved = this.resolveAfterMove(pm, activePiece, dest, table.gameState.currentPlayer, movesHistory, table.gameState.positionHistory)
   
        const newGameState = this.buildGameState({
            table,
            newBoard: resolved.newBoard,
            currentPlayer: table.gameState.currentPlayer,
            movesHistory,
            positionHistory : resolved.newPositionHistory,
            drawData: {
                isDraw : resolved.drawData.isDraw,
                reason : resolved.drawData.reason
            },
            moveData : {
                isValidMove, 
                isCheck: resolved.isCheck,
                isCheckmate: resolved.isCheckmate,
                promotion,
                winner: resolved.winner,
                captureOccurred
            }
        })

        const completed = await this.checkGameOver(resolved.isCheckmate, resolved.drawData.isDraw, table.playersId, resolved.winner)
        
        this.tableRepo.update(tableId, {gameState : newGameState, completed})
        const newTable = {...table, gameState : newGameState, completed}
        return {table : newTable, isLegal : isValidMove}
    }

    private resolveAfterMove(
        pm: PiecesManager,
        activePiece: ChessPiece,
        dest: Tile,
        currentPlayer: ChessTeams,
        movesHistory: MovesHistory,
        positionHistory: Record<string, number>
    ) {
        const checkManager = new CheckManager(pm, activePiece.team)
        const checkMateManager = new CheckmateManager(pm, activePiece.team)
        const stalemateManager = new StalemateManager(pm, movesHistory, positionHistory)

        const newBoard = reCreateBoard(pm.getPieces())

        const isCheck = checkManager.isOpponentKingCheck()
        checkManager.setOpponentKingCheck(isCheck)

        const isCheckmate = checkMateManager.execute(activePiece, dest)
        const winner = isCheckmate ? activePiece.team : undefined

        const drawData = stalemateManager.execute(currentPlayer)
        const newPositionHistory = stalemateManager.getPositionHistory()

        return {
            newBoard,
            isCheck,
            isCheckmate,
            winner,
            drawData,
            newPositionHistory
        }
    }

    private buildGameState(params: {
            table : ChessTable,
            newBoard: ChessBoard,
            currentPlayer: ChessTeams,
            movesHistory : MovesHistory,
            positionHistory : Map<string, number>,
            drawData: {
                isDraw : boolean,
                reason ?: string
            },
            moveData : {
                isValidMove : boolean | null, 
                isCheck: boolean,
                isCheckmate: boolean,
                promotion : boolean,
                winner: ChessTeams | undefined,
                captureOccurred : boolean
            }
        }) : ChessTable["gameState"] {
        
        const moveData = params.moveData
        const drawData = params.drawData
        const currentPlayer = params.currentPlayer
        const table = params.table
        const newBoard = params.newBoard
        const movesHistory = params.movesHistory

        let state: ChessState = "game"

        if (moveData.isCheckmate || drawData.isDraw) state = "endGame"
        else if (moveData.promotion) state = "pawnPromotion"

        const nextPlayer =
            state === "game"
                ? this.switchPlayer(currentPlayer)
                : currentPlayer
        
        const endGameType = moveData.isCheckmate ? "checkmate" : drawData.isDraw ? "draw" : undefined
        const endGameReason = this.getEndGameReason({type : endGameType, drawData,winner : moveData.winner})

        return {
            ...table.gameState,
            board: newBoard,
            currentPlayer: nextPlayer,
            state,
            allMoves: movesHistory.getAllMoves(),
            onMoveData: moveData,
            positionHistory : Object.fromEntries(params.positionHistory),
            endGameReason
        }
    }

    async handlePawnPromoted(piece : PiecesType, tableId : string) : Promise<ChessTable> {
        console.log("handle promoted pawn")
        const table = await this.tableRepo.getTableById(tableId) as ChessTable
        const board = table.gameState.board
        const team = table.gameState.currentPlayer
        const pm = new PiecesManager(board)

        const activePiece = pm.promotePawn(piece, team)
        if (!activePiece) return table

        const movesHistory = new MovesHistory(table.gameState.allMoves)
        const resolved = this.resolveAfterMove(pm, activePiece, activePiece.pos, table.gameState.currentPlayer, movesHistory, table.gameState.positionHistory)

        const newGameState = this.buildGameState({
            table,
            newBoard: resolved.newBoard,
            currentPlayer: table.gameState.currentPlayer,
            movesHistory,
            positionHistory : resolved.newPositionHistory,
            drawData: {
                isDraw : resolved.drawData.isDraw,
                reason : resolved.drawData.reason
            },
            moveData : {
                isValidMove : table.gameState.onMoveData.isValidMove, 
                isCheck: resolved.isCheck,
                isCheckmate: resolved.isCheckmate,
                promotion : table.gameState.onMoveData.promotion,
                winner: resolved.winner,
                captureOccurred : table.gameState.onMoveData.captureOccurred
            }
        })        
        
        this.tableRepo.update(tableId, {gameState : newGameState})
        const newTable = {...table, gameState : newGameState}
        return newTable
    }

    async handleAskDraw(userId : string, tableId : string, Map : Map<string, TypedSocket>){
        const table = await this.tableRepo.getTableById(tableId)
        const userGameState = await this.chessRepo.getGameState(userId)
        let askDraw = userGameState.askingDraw
        if (askDraw <= 0 || askDraw > 3) return
        const userIdToNotify = table.playersId.filter(id => id !== userId)[0]
        const socketToNotify = Map.get(userIdToNotify)
        if (!socketToNotify) return
        askDraw-- 
        this.chessRepo.update(userId, {askingDraw : askDraw as DrawCount})
        return socketToNotify
    }

    async handleGiveUp(tableId : string, userId : string) : Promise<ChessTable>{
        const table = await this.tableRepo.getTableById(tableId) as ChessTable
        const userGameState = await this.chessRepo.getGameState(userId)
        const winner = userGameState.team === "white" ? "black" : "white" as ChessTeams
        const winnerId =  await this.getWinnerId(table.playersId, winner)
        if (!winnerId) return table
        await this.gameOver(table.playersId, winnerId)
        const endGameReason = this.getEndGameReason({type : "resign", winner})
        const moveData = {isValidMove : false, promotion : false, winner, captureOccurred : false}
        const newTableState = {...table.gameState, state : "endGame" as ChessState, onMoveData : moveData, endGameReason}
        this.tableRepo.update(tableId, {gameState : newTableState, completed : true})
        const newTable = {...table, gameState : newTableState, completed : true }
        return newTable
    }

    private async gameOver(ids : string[], winnerId : string | undefined = undefined ){
        const usersStats = await this.userRepo.getUsersStats(ids)
        console.log("users stats :", usersStats)
        await Promise.all(
            usersStats.map(u => {
                console.log("user stats :", u)
                let games = u.chess.games
                let win = u.chess.victories
                games++
                if (winnerId === u.id) win++
                const newStats = {games, victories : win, highestScore : 0 }
                this.userRepo.updateStats(u.id, {chess : newStats})
            })
        )
    }

    async handleDrawResponse(tableId : string){
        const table = await this.tableRepo.getTableById(tableId) as ChessTable
        await this.gameOver(table.playersId)
        const endGameReason = "Match nul par accord mutuel !"
        const newTableState = {...table.gameState, state : "endGame" as ChessState, endGameReason}
        this.tableRepo.update(tableId, {gameState : newTableState, completed : true})
        const newTable = {...table, gameState : newTableState, completed : true }
        return newTable
    }

    private async checkGameOver(isCheckmate : boolean, isDraw : boolean, ids : string[], winner : ChessTeams | undefined) : Promise<boolean> {
        if (isCheckmate || isDraw){
            const winnerId = await this.getWinnerId(ids, winner)
            await this.gameOver(ids, winnerId)
            return true 
        }
        return false 
    }

    async handleEndGameOnTimeOut(tableId : string, winner : ChessTeams) : Promise<ChessTable> {
        const table = await this.tableRepo.getTableById(tableId) as ChessTable
        const pm = new PiecesManager(table.gameState.board)
        const isDraw = DrawManager.getDrawByMissingPiece(pm.getPieces())
        const reason = DrawManager.getDrawData({drawByMissingPieces : isDraw})
        const winnerId = await this.getWinnerId(table.playersId, winner)
        await this.gameOver(table.playersId, winnerId)
        const endGameReason = isDraw ? this.getEndGameReason({type : "draw", drawData : {isDraw, reason}}) : this.getEndGameReason({type : "timeout", winner})
        const newTableState = {...table.gameState, state : "endGame" as ChessState, endGameReason}
        this.tableRepo.update(tableId, {gameState : newTableState, completed : true})
        const newTable = {...table, gameState : newTableState, completed : true }
        return newTable 
    }

    private async getWinnerId(ids : string[], winner : ChessTeams | undefined) : Promise<string | undefined> {
        const usersGameState = await this.chessRepo.getUsersChessState(ids)
        return usersGameState.find(u => u.team === winner)?.id
    }

    private getEndGameReason(params : {
        type ?: "checkmate" | "timeout" | "resign" | "draw"
        drawData ?: {isDraw : boolean, reason ?: string},
        winner ?: ChessTeams
        }
    ){
        const { winner, drawData, type } = params
        const winnerFR = winner === "white" ? "blancs" : "noirs"
        if (type === "checkmate" && winner) return `Echec et mat ! Les ${winnerFR} ont gagné.`
        if (type === "resign" && winner) return `Abandon ! Les ${winnerFR} ont gagné.` 
        if (type ==="draw" && drawData?.isDraw) return `Match nul : ${drawData.reason}.`
        if (type === "timeout" && winner) return `Les ${winnerFR} ont gagné au temps.`
    }
        



}
