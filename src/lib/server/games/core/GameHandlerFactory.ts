import type { TypedServer } from "$lib/types/socket";
import type { Table } from "$lib/types/table";
import { YamsHandler } from "../yams/YamsHandler";
import { TarotHandler } from "../tarot/TarotHandler";
import type { YamsService } from "../yams/YamsService";
import type { TarotService } from "../tarot/TarotService";
import type { UserService } from "./services/UserService";
import type { TableService } from "./services/TableService";
import type { TableTimerManager } from "./utils/TableTimerManager";
import type { BeloteService } from "../belote/BeloteService";
import { BeloteHandler } from "../belote/BeloteHandler";
import type { ChessService } from "../chess/chessService";
import { ChessHandler } from "../chess/chessHandler";
import type { ClockManager } from "../chess/core/clockManager";

export class GameHandlerFactory {
    private handlers: Map<string, YamsHandler | TarotHandler | BeloteHandler | ChessHandler> = new Map();

    constructor(
        private io: TypedServer,
        private yamsService: YamsService,
        private tarotService: TarotService,
        private userService : UserService,
        private tableService : TableService, 
        private timerManager : TableTimerManager,
        private beloteService : BeloteService,
        private chessService : ChessService,
        private chessClockManager : ClockManager

    ) {}

    get(table: Table) {
        if (this.handlers.has(table.id)) {
            return this.handlers.get(table.id)!;
        }

        switch (table.gameType) {
            case "yams":
                return new YamsHandler(this.io,  this.yamsService, this.tableService, this.userService, this.timerManager);
            case "tarot":
                return new TarotHandler(this.io, this.tarotService,  this.tableService, this.timerManager);
            case "belote" :
                return new BeloteHandler(this.io, this.beloteService, this.tableService, this.timerManager);
            case "chess" : 
                return new ChessHandler(this.io, this.chessService, this.tableService, this.chessClockManager);
            default:
                throw new Error('Unknown game type');
        }
    }

    remove(tableId: string) {
        this.handlers.delete(tableId);
    }
}