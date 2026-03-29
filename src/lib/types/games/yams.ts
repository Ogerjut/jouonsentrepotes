import type { User } from "$lib/types/user";

export interface YamsTableState {
    state : "created" | "game" | "afterRound" | "endGame",
    currentPlayer : User["id"],
    round : number,
    dices : Dice[]
}

export type Dice = {
    id : number, 
    value : 6 | 5 | 4 | 3 | 2 | 1
    selected : boolean
}

export type Launches = 3 | 2 | 1 | 0

export interface UserYamsState {
    id : string,
    username : string,
    hasPlayed : boolean,
    listResults : DiceResult[],
    launches : Launches , 
    finalScore : FinalScore
}

export type DiceResult = {
    id : string, 
    value : number, 
    done : boolean, 
    possibleValue : number 
}

export type FinalScore = {
    score1 : number, 
    hasBonus : boolean, 
    score2 : number, 
    total : number 
}


