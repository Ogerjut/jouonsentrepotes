import type { BeloteTableDB, ChessTableDB, TableDB, TarotTableDB } from "$lib/types/db/tableDB"
import type { ScoreMode } from "$lib/types/games/belote"
import type { ChessTimer } from "$lib/types/games/chess"
import { tablesCollection } from "../db/db"

export class TableFactory {
    private gameType : string
    private formData : FormData

    constructor(gameType : string, formData : FormData){
        this.gameType = gameType
        this.formData = formData
    }

    private getDoc(){
        switch(this.gameType){
            case "tarot" : return this.getDocTarot()
            case "yams" : return this.getDocYams()
            case "belote" : return this.getDocBelote()
            case "chess" : return this.getDocChess()
        }
    }

    private getDocTarot() : Omit<TarotTableDB, "_id" >  {
        return {
            gameType : "tarot",
            createdAt : new Date(),
            updatedAt : new Date(),
            maxPlayers : Number(this.formData.get('nbPlayers')),
            ready : false,
            completed : false,
            playersId : [],
            gameState : {
                state : "created", 
                bidMap : Object.fromEntries(new Map()),
                round : 1,
                auctionRound : 0,
                maxRound :  Number(this.formData.get('nbRound')),
                // maxRound : 1,
                actualBid : 0, 
                trick : Object.fromEntries(new Map()), 
                tricks : [],
                lastTrick : [],
                trickColor : null, 
                playedAtouts : [], 
                currentPlayer : "", 
                dog : [],
                handfuls : Object.fromEntries(new Map()),
                finalScores : Object.fromEntries(new Map()),
                roundDataScore : {oudlers : 0, contrat : null, score : 0, hasWin : false, coef : 1, marque : 0, 
                        bonusHandfulDef : 0, bonusHandfulTaker : 0, bonusPetitAuBout : 0, bonusSlam : 0, 
                        takerScore : 0, defScore : 0, partnerScore : null
                },
                taker : null,
                calledPlayer : null,
                calledSuit : null
            }
        }
    }

    private getDocYams(){
        return {
            gameType : "yams",
            createdAt : new Date(), 
            updatedAt : new Date(),
            maxPlayers : Number(this.formData.get('nbPlayers')),
            ready : false,
            completed : false,
            playersId : [],
            gameState : {
                state : "created",
                currentPlayer : "",
                round : 1, 
                dices : []
            },
        }
    }

    private getDocBelote() : Omit<BeloteTableDB, "_id" >{
        return  {
            gameType : "belote",
            createdAt : new Date(),
            updatedAt : new Date(),
            maxPlayers : 4,
            ready : false,
            completed : false,
            playersId : [],
            gameState : {
                state : "created",
                scoreMode : this.formData.get('scoreMode') as ScoreMode,
                teams : null, 
                bidMap : Object.fromEntries(new Map()),
                round : 1,
                trick : Object.fromEntries(new Map()), 
                tricks : [],
                lastTrick : [],
                trickSuit : null, 
                playedTrumps : [], 
                currentPlayer : "", 
                deck : [],
                potentialTrump : null,
                trumpSuit : null,
                scores : {}, 
                auctionRound : 1, 
                lastTrickWinner : null, 
                litige : false, 
                roundDataScore : {status : "", takersFinalScore : 0, takersScore : 0, takersBelote : false, defFinalScore : 0, defBelote : false}
            }
        }
    }

    private getDocChess()  : Omit<ChessTableDB, "_id" > {
        return {
            gameType : "chess",
            createdAt : new Date(),
            updatedAt : new Date(),
            maxPlayers : 2,
            ready : false,
            completed : false,
            playersId : [],
            gameState : {
                state : "created",
                currentPlayer : "white",
                timer : Number(this.formData.get("timer")) as ChessTimer,
                // timer : 0.5,
                board : [], 
                allMoves : [],
                positionHistory : {}, 
                onMoveData : {
                    isValidMove : null, 
                    promotion : false,
                    captureOccurred : false
                },
                endGameReason : undefined
            }
        }

    }

    async create() : Promise<{success : boolean, url ?: string}> {
        const doc = this.getDoc()
        if (!doc) return {success : false}
        const table = await tablesCollection.insertOne(doc as unknown as TableDB) 
        if (!table.insertedId) return {success : false}
        else return {success : true , url : `/games/${this.gameType}/${table.insertedId.toString()}`}
        }
}