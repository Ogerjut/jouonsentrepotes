// atout = trump

import type { UserTarotState } from "$lib/types/games/tarot"


export class EndGameManager{
    private playersScore : Map<string, number>
    private usersState : UserTarotState[]

    constructor(usersGameState : UserTarotState[] ){
        this.playersScore = new Map() 
        this.usersState = usersGameState 
    }

    private setPlayersScore(){
        this.usersState.map(u => this.playersScore.set(u.username, u.score))
    }

    private getWinnerId(){
        let max = 0
        let winner
        this.playersScore.forEach((score, id) => {
            if (score > max){
                max = score
                winner = id
            }
        })
        return winner
    }

    execute(){
        this.setPlayersScore()
        const winnerId = this.getWinnerId()
        return { playersScore : this.playersScore, winnerId }
    }
}