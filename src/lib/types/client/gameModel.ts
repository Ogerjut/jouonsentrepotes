import type { Socket } from "socket.io-client";
import type { Table } from "../table";
import type { User } from "../user";

export interface GameModel {
    user : User,
    table : Table,
    socket : Socket
}