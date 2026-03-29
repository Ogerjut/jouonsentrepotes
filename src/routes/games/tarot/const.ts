import { Card } from "$lib/server/games/tarot/core/CardManager";
import type { TarotTableDB } from "$lib/types/db/tableDB";

export const tableRound = {
            gameType : "tarot",
            createdAt : new Date(),
            updatedAt : new Date(),
            maxPlayers : 4,
            ready : true,
            completed : false,
            playersId : [],
            gameState : {
                state : "round", 
                bidMap : Object.fromEntries(new Map()),
                round : 1,
                maxRound :  3,
                actualBid : 0, 
                trick : Object.fromEntries(new Map()), 
                tricks : [],
                trickColor : 'heart',
                lastTrick :[new Card(1, "heart"), new Card(2, "heart"), new Card(3, "heart"), new Card(4, "heart")],
                playedAtouts : [], 
                currentPlayer : "", 
                dog : [new Card(1, "heart"), new Card(2, "heart"), new Card(3, "heart"), new Card(4, "heart"), new Card(5, "heart"), new Card(6, "heart"), ],
                handfuls : Object.fromEntries(new Map()),
                finalScores : Object.fromEntries(new Map()),
                roundDataScore : {oudlers : 1, contrat : 51, score : 61, hasWin : true, coef : 2, marque : 70, 
                        bonusHandfulDef : 20, bonusHandfulTaker : 0, bonusPetitAuBout : 0, bonusSlam : 0, 
                        takerScore : 210, defScore : -70
                }
            }
        } as unknown as TarotTableDB

export const tableAfterRound = {
            gameType : "tarot",
            createdAt : new Date(),
            updatedAt : new Date(),
            maxPlayers : 4,
            ready : true,
            completed : false,
            playersId : [],
            gameState : {
                state : "afterRound", 
                bidMap : Object.fromEntries(new Map()),
                round : 1,
                maxRound :  3,
                actualBid : 0, 
                trick : Object.fromEntries(new Map()), 
                tricks : [],
                trickColor : null,
                lastTrick :[new Card(1, "heart"), new Card(2, "heart"), new Card(3, "heart"), new Card(4, "heart")],
                playedAtouts : [], 
                currentPlayer : "", 
                dog : [new Card(1, "heart"), new Card(2, "heart"), new Card(3, "heart"), new Card(4, "heart"), new Card(5, "heart"), new Card(6, "heart"), ],
                handfuls : Object.fromEntries(new Map()),
                finalScores : Object.fromEntries(new Map()),
                roundDataScore : {oudlers : 1, contrat : 51, score : 61, hasWin : true, coef : 2, marque : 70, 
                        bonusHandfulDef : 20, bonusHandfulTaker : 0, bonusPetitAuBout : 0, bonusSlam : 0, 
                        takerScore : 210, defScore : -70
                }
            }
        } as unknown as TarotTableDB