
import { usersCollection, 
        tablesCollection,
        userStatsCollection,
        userYamsStateCollection, 
        userTarotStateCollection, 
        userBeloteStateCollection,
        userChessStateCollection
    } from '$lib/server/db/db';
import { UserService } from './services/UserService';
import { TableService } from './services/TableService';
import { UserRepository } from './repositories/UserRepository';
import { TableRepository } from './repositories/TableRepository';
import { PresenceService } from './services/PresenceService';
import { YamsRepo } from '../yams/YamsRepo';
import { YamsService } from '../yams/YamsService';
import { TarotRepo } from '../tarot/TarotRepo';
import { TarotService } from '../tarot/TarotService';
import { GameServiceFactory } from './GameServicesFactory';
import type { TypedServer } from '$lib/types/socket';
import { GameHandlerFactory } from './GameHandlerFactory';
import { TableTimerManager } from './utils/TableTimerManager';
import { InvitationService } from './services/InvitationService';
import { BeloteRepo } from '../belote/BeloteRepo';
import { BeloteService } from '../belote/BeloteService';
import { ChessRepo } from '../chess/chessRepository';
import { ChessService } from '../chess/chessService';
import { ClockManager } from '../chess/core/clockManager';

const userRepo = new UserRepository(usersCollection, userStatsCollection);
const tableRepo = new TableRepository(tablesCollection);
const yamsRepo = new YamsRepo(userYamsStateCollection)
const tarotRepo = new TarotRepo(userTarotStateCollection)
const beloteRepo = new BeloteRepo(userBeloteStateCollection)
const chessRepo = new ChessRepo(userChessStateCollection)

const timerManager = new TableTimerManager()
const chessClockManager = new ClockManager()

export const userService = new UserService(userRepo);
export const tableService = new TableService(tableRepo);
export const presenceService = new PresenceService()
export const invitationService = new InvitationService()

export const yamsService = new YamsService(yamsRepo, userRepo, tableRepo)
export const tarotService = new TarotService(tarotRepo, tableRepo, userRepo)
export const beloteService = new BeloteService(beloteRepo, tableRepo, userRepo)
export const chessService = new ChessService(chessRepo, tableRepo, userRepo)

export const gameServiceFactory = new GameServiceFactory(yamsService, tarotService, beloteService, chessService)
export const gameHandlerFactory = (io : TypedServer) => new GameHandlerFactory(
    io, 
    yamsService, 
    tarotService, 
    userService, 
    tableService, 
    timerManager, 
    beloteService,
    chessService, 
    chessClockManager
)
