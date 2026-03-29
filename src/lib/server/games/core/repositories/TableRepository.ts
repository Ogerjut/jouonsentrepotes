import type { TableDB, TarotTableDB } from "$lib/types/db/tableDB";
import type { Table } from "$lib/types/table";
import { Collection, ObjectId, type PushOperator } from "mongodb";

export class TableRepository {
  constructor(private tablesCollection: Collection<TableDB>) {}

  private tableDBtoTable(tableDB : TableDB) : Table{
      return {
        ...tableDB, id : tableDB._id.toString()
      }
    }

  async update(tableId : Table["id"], updatedFields : Partial<TableDB>) {
    return this.tablesCollection.updateOne(
      { _id: new ObjectId(tableId) },
      { $set: {...updatedFields, updatedAt : new Date()} }
    );
  }

  async getTableById(tableId: Table["id"]) : Promise<Table> {
    const tableDB = await this.tablesCollection.findOne({ _id: new ObjectId(tableId) });
    if (!tableDB) {
      throw new Error(`invalid tableId : ${tableId}`)
    }
    return this.tableDBtoTable(tableDB) 
  }

  async deleteCompletedTables(){
    return this.tablesCollection.deleteMany({completed : true})
  }

  async delete(tableId : Table["id"]){
    return this.tablesCollection.deleteOne({_id : new ObjectId(tableId)})
  }

  async getTableState(tableId: Table["id"]) {
    const table = await this.getTableById(tableId)
    return table.gameState
  }

  async updatePush(tableId : Table["id"], updatedFields : PushOperator<TarotTableDB>) {
          return this.tablesCollection.updateOne(
              { id: new ObjectId(tableId) },
              { $push: updatedFields},
              { $set: {updatedAt : new Date()} }
          );
      }

  
}