import type { Server, Socket } from "socket.io";
import type { Table } from "./table";
import type { User } from "./user";
import type { ClientToServerCoreEvents, ServerToClientCoreEvents } from "./socket/core";
import type { ClientToServerYamsEvents, ServerToClientYamsEvents } from "./socket/yams";
import type { ClientToServerTarotEvents, ServerToClientTarotEvents } from "./socket/tarot";
import type { ClientToServerBeloteEvents, ServerToClientBeloteEvents } from "./socket/belote";
import type { ClientToServerChessEvents, ServerToClientChessEvents } from "./socket/chess";

export interface ServerToClientEvents extends
    ServerToClientYamsEvents, 
    ServerToClientCoreEvents, 
    ServerToClientTarotEvents,
    ServerToClientBeloteEvents,
    ServerToClientChessEvents
    {}


export interface ClientToServerEvents extends
    ClientToServerCoreEvents,
    ClientToServerYamsEvents, 
    ClientToServerTarotEvents,
    ClientToServerBeloteEvents, 
    ClientToServerChessEvents
    {}


export interface SocketData {
    userId : User["id"]
    username :  User['name'] 
    tableId : Table["id"] | null
}

// Types Socket.io typés
export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;