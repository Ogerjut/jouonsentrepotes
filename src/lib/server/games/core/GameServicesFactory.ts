import type { GameServices } from "$lib/types/services/gameServices"
import type { Table } from "$lib/types/table"
import type { BeloteService } from "../belote/BeloteService"
import type { ChessService } from "../chess/chessService"
import type { TarotService } from "../tarot/TarotService"
import type { YamsService } from "../yams/YamsService"

export class GameServiceFactory {
  constructor(
    private yamsService: YamsService,
    private tarotService: TarotService,
    private beloteService : BeloteService,
    private chessService : ChessService
    
  ) {}

  get(gameType: Table["gameType"]): GameServices {
    switch (gameType) {
      case "yams": return this.yamsService
      case "tarot": return this.tarotService
      case "belote": return this.beloteService
      case "chess" : return this.chessService
      default: throw new Error("Unknown game type")
    }
  }
}