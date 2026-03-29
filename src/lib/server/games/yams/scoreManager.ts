import type { DiceResult } from "$lib/types/games/yams"
import type { Dice, DiceValue } from "./yamsEntities"

export class ScoreManager{
    private dices : Dice[]
    items : DiceResult[]
    constructor(dices : Dice[], items : DiceResult[]){
        this.items = items
        this.dices = dices
    }

    compute(){
        this.items.map(item => {
            item.possibleValue = this.getScore(item.id) as number
        })

    }

    private getScore(rule : string) {
        switch(rule){
            case "1" :
            case "2" :
            case "3" :
            case "4" :
            case "5" :
            case "6" :
                return this.getScorePartOne(rule)
            case "brelan" : 
                return this.getBrelan()
            case "carré" : 
                return this.getSquare()
            case "full" : 
                return this.getFull(rule)
            case "petite suite" : 
                return this.getPS()
            case "grande suite" : 
                return this.getGS()
            case "yam's" : 
                return this.getYams()
            case "chance" : 
                return this.getLuck()
        }

    }

    private getScorePartOne(rule : string){
        const dices = this.dices.filter(dice => dice.value === Number(rule))
        return dices.length*Number(rule)
    }

    private getSumDices(){
        return this.dices.reduce((sum, dice)=> sum + dice.value, 0)
    }

    private areEqualDicesOfLength(nb : number, rule : string | undefined = undefined){
        for (let i = 1; i < 7; i++){
            const dices = this.dices.filter(dice => dice.value === i)
            if (!rule && dices.length >= nb){
                return true 
            } else if (rule === "full" && dices.length === nb){
                return true 
            }
        }
        return false 
    }



    private getBrelan(){
        if (this.areEqualDicesOfLength(3)){
            return this.getSumDices()
        } else return 0
    }

    private getSquare(){
        if (this.areEqualDicesOfLength(4)){
            return this.getSumDices()
        } else return 0
    }
    
    private getFull(rule : string | undefined){
        if (this.areEqualDicesOfLength(3, rule) && this.areEqualDicesOfLength(2, rule)){
            return 25
        } else return 0
    }

    private getPS(){
        const patterns = [[1,2,3,4], [2,3,4,5], [3,4,5,6]]
        const values = this.dices.map(dice => dice.value)
        const isPS = patterns.some(pattern =>
            pattern.every(v => values.includes(v as DiceValue))
        )
        if (isPS) return 30
        else return 0

    }

    private getGS(){
        const patterns = [[1,2,3,4,5], [2,3,4,5,6]]
        const values = this.dices.map(dice => dice.value)
        const isGS = patterns.some(pattern =>
            pattern.every(v => values.includes(v as DiceValue))
        )
        if (isGS) return 40
        else return 0

    }

    private getYams(){
        if (this.areEqualDicesOfLength(5)){
            return 50
        } else return 0

    }

    private getLuck(){
        return this.getSumDices()
    }









}