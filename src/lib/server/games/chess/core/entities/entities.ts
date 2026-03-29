import type { ChessTeams, EntitiesType, Tile } from "$lib/types/games/chess";

export class Entities implements EntitiesType {
    pos: Tile
    team: ChessTeams
    captured: boolean = false
    previousPos: Tile | null = null

    constructor (pos : Tile, team : ChessTeams) {
        this.pos = pos
        this.team = team
    }

    move(dest : Tile) {
        this.previousPos = this.pos
        this.pos = dest
    }

    cancelMove() {
        if (!this.previousPos) return 
        this.pos = this.previousPos
        this.previousPos = null
    }

    isMoveOnBoard(pos : Tile) {
        return pos[0] >= 0 && pos[0] < 8 && pos[1] >= 0 && pos[1] < 8
    }

    getMoveDirection(origin : Tile, dest : Tile) : Tile {
        const dx = dest[0] - origin[0]
        const dy = dest[1] - origin[1]
        return [Math.sign(dx), Math.sign(dy)]
    } 
}




