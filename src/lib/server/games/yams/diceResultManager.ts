
export const DICE_RESULTS = [
    "1", "2", "3", "4", "5", "6",
    "brelan", "carré", "full", "petite suite", "grande suite", "yam's", "chance"
]

export function getItems(){
    return DICE_RESULTS.map(item => new DiceResult(item))
}
class DiceResult{
    id : string
    value : number 
    done : boolean
    possibleValue : number
    constructor(id : string, value = 0, done = false, possibleValue = 0){
        this.id = id
        this.value = value
        this.done = done
        this.possibleValue = possibleValue
    }

}

export class DiceResultManager{
    diceResults : DiceResult[]
    private diceResult : DiceResult
    
    constructor(diceResults : DiceResult[], diceResult : DiceResult){
        this.diceResults = diceResults.map(diceResult => new DiceResult(diceResult.id, diceResult.value, diceResult.done, diceResult.possibleValue))
        this.diceResult = new DiceResult(diceResult.id, diceResult.value, diceResult.done, diceResult.possibleValue) 
    }

    updateItems(){
        this.diceResults.map(i => {
            if (i.id === this.diceResult.id){
                i.value = this.diceResult.possibleValue
                i.done = true 
            } else {
                i.possibleValue = 0
            }
        })
    }

    remainingItems(){
        return this.diceResults.filter(diceResult => diceResult.done !== true).length 
    }

    
}