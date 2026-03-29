// LOGIQUE METIER TABLE 
import type { Table } from "$lib/types/table";
import type { User } from "better-auth";
import type { TableRepository } from "../repositories/TableRepository";

export class TableService {
    constructor(private tableRepo: TableRepository) {}

    async joinTable(tableId: Table["id"], userId: User["id"]) : Promise<Table> { 
        const table = await this.getTableById(tableId)
        // if (table.playersId.includes(userId)) return
        // if (table.completed ) throw new Error('Table is already completed');
        // if (table.playersId.length >= table.maxPlayers)throw new Error('Table is full');
        
        const newPlayers = [...table.playersId, userId];
        // mettre update automatiquement dans tableRepo
        const updatedAt = new Date();
        
        await this.tableRepo.update(
            tableId, {
                playersId : newPlayers, 
                updatedAt : updatedAt
            } 
        );

        return {...table, playersId : newPlayers}

    }

    async setReady(tableId : Table["id"]){
        await this.tableRepo.update(tableId, {ready : true})
        return this.tableRepo.getTableById(tableId)
    }

    checkTableIsReady(table : Table) : boolean{
        return table.playersId.length === table.maxPlayers
    }

    async getTableById(tableId : Table["id"]){
        return await this.tableRepo.getTableById(tableId);
    }

    async delete(tableId: Table["id"]) {
        console.log("abort table, empty table deleted")
        return this.tableRepo.delete(tableId)
    }

    async leaveTable(table : Table, userId : User["id"]){
        const tableId = table.id
        const playersId = table.playersId
        const newPlayersId = playersId.filter(id => id != userId )
        const isEmpty = newPlayersId.length === 0
        
        if (isEmpty) {
            console.log("leave table, empty table deleted")
            await this.tableRepo.delete(tableId)
        }

        await this.tableRepo.update(tableId, {
            playersId : newPlayersId, 
            updatedAt : new Date()
        })
        
        
    }






}