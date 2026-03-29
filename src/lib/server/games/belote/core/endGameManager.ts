import type { Team } from "$lib/types/games/belote"


export class EndGameManager{
    private teams : Team[]
    private playersScore : Map<string, number>

    constructor(teams : Team[] ){
        this.teams = teams
        this.playersScore = new Map()
    }


    private setPlayersScore(){
        this.teams.forEach(t => {
            t.players.forEach(p => this.playersScore.set(p, t.score))
        })
    }

    private getWinnersTeam(){
        let max = 0
        let winners : string[] = []
        this.teams.forEach(t => {
            if (t.score > max){
                max = t.score
                winners = t.players
            }
        })
        return winners
    }

    execute(){
        const winners = this.getWinnersTeam()
        this.setPlayersScore()
        return { playersScore : this.playersScore, winners }
    }
}