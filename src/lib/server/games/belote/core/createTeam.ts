import { randomUUID, type UUID } from "crypto"


export const registerTeams = (ids: string[]) => {
    const shuffled = [...ids].sort(() => Math.random() - 0.5)

    const teamA = new Team()
    const teamB = new Team()

    shuffled.slice(0, 2).forEach(id => teamA.addPlayer(id))
    shuffled.slice(2, 4).forEach(id => teamB.addPlayer(id))

    return [teamA, teamB]
}

// a voir utilisaion uuid avec mongoDB

export class Team {
    id : UUID
    players : string[]
    score : number

    constructor(){
        this.id = randomUUID()
        this.score = 0
        this.players = []
    }

    addPlayer(player : string){
        this.players.push(player)
    }

}