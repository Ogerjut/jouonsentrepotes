import type { Dice, DiceResult, FinalScore, UserYamsState } from "../games/yams"
import type { Table, YamsTable } from "../table"
import type { User } from "../user"

export interface YamsServices {
    rollDices(kept : Dice[]) : Dice[]
    initYams(table : Table):void
    getPossibleResults(dices : Dice[], listResults : DiceResult[]):Promise<DiceResult[]>
    updateAfterRolledDices(userId : User["id"], table : YamsTable, userYamsState : UserYamsState, possibleDiceResult : DiceResult[], dices : Dice[]):void
    registerDiceResult(id : User['id'], userYamsState : UserYamsState, diceResult :  DiceResult):Promise<{updatedUserYamsState : UserYamsState}>
    checkEndGame(ids : User['id'][]):Promise<boolean>
    nextTurn(table : YamsTable, userId :User['id']):Promise<{updatedTable : YamsTable}>
    closeTable(table : YamsTable):Promise<YamsTable> 
    setPlayersScores(table : YamsTable):Promise<{winnerId : string, playersScores : Map<string, FinalScore>}>  
}

 