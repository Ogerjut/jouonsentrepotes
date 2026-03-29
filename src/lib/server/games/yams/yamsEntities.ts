export type DiceValue = 6 | 5 | 4 | 3 | 2 | 1 

export class Dice {
    id : number
    value : DiceValue
    selected : boolean

    constructor(id = 0, value : DiceValue = 1, selected = false){
        this.id = id
        this.value = value
        this.selected = selected
    }
}

export class DicesManager{
    dices : Dice[]
    constructor(dicesArray : Dice[]){
        this.dices = dicesArray.map(dice => new Dice(dice.id, dice.value, dice.selected))
    }

    launchDices(){
        this.dices.map(dice =>{
            if (!dice.selected){
                dice.value = this.getValue()
            }
        })
    }

    private getValue(){
        return Math.floor(Math.random()*6+1) as DiceValue
    }

    resetDices(){
        this.dices.map(dice => {
            dice.selected = false
            dice.value = 1
        })
    }
}