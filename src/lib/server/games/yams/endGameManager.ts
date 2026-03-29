import type { DiceResult, FinalScore, UserYamsState } from "$lib/types/games/yams"

export class EndGameScore{
    private listResults : DiceResult[]
    private score1 : FinalScore['score1']
    private score2 : FinalScore['score2']
    private hasBonus : FinalScore['hasBonus']
    private total : FinalScore['total']

    constructor(player : UserYamsState){
        this.listResults = player.listResults
        this.score1 = this.scorePart1()
        this.hasBonus = this.getHasBonus()
        this.applyBonus()
        this.score2 = this.scorePart2()
        this.total = this.score1 + this.score2
    }

    private scorePart1(){
        const part1Items = ["1", "2", "3", "4", "5", "6"];

        return this.listResults
            .filter(item => part1Items.includes(item.id) && item.done)
            .reduce((sum, item) => item.value + sum, 0)

    }

    private scorePart2(){
        const part2Items = ["brelan", "carré", "full", "petite suite", "grande suite", "yam's", "chance"];
        return this.listResults
            .filter(item => part2Items.includes(item.id) && item.done)
            .reduce((sum, item) => sum + item.value, 0);

    }

    private getHasBonus(){
        return this.score1 > 63   
    }

    private applyBonus(){
        if (!this.hasBonus) return 
        this.score1 += 35
    }

    scoreToJSON(){
        return {
            score1 : this.score1,
            hasBonus : this.hasBonus,
            score2 : this.score2,
            total : this.total
        }
    }






}