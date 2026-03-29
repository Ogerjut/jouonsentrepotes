import { MongoClient } from "mongodb";
import  dotenv  from "dotenv";
import type { ChatMessageDB } from "$lib/types/db/chatDB";
import type { UserStatsDB } from "$lib/types/db/userStatsDB";
import type { User } from "$lib/types/user";
import type { TableDB } from "$lib/types/db/tableDB";
import type { UserYamsStateDB } from "$lib/types/db/yamsDB";
import type { UserTarotStateDB } from "$lib/types/db/tarotDB";
import type { UserBeloteStateDB } from "$lib/types/db/beloteDB";
import type { UserChessStateDB } from "$lib/types/db/chessDB";

dotenv.config()

const client = new MongoClient(process.env.DATABASE_URL);

try {
    await client.connect();
    console.log("✅ Connecté à MongoDB !");
} catch (error) {
    console.error("❌ Erreur de connexion à MongoDB :", error);
}

export const db = client.db("jouonsentrepotes");
export const usersCollection = db.collection<User>("user")
export const userBeloteStateCollection = db.collection<UserBeloteStateDB>("userBeloteState")
export const userYamsStateCollection = db.collection<UserYamsStateDB>("userYamsState")
export const userTarotStateCollection = db.collection<UserTarotStateDB>("userTarotState")
export const userChessStateCollection = db.collection<UserChessStateDB>("userChessState")
export const userStatsCollection = db.collection<UserStatsDB>("userStats")
export const msgCollection = db.collection<ChatMessageDB>("messages")
export const tablesCollection = db.collection<TableDB>("tables")

await userYamsStateCollection.createIndex({ id: 1 }, { unique: true })
await userTarotStateCollection.createIndex({ id: 1 }, { unique: true })
await userBeloteStateCollection.createIndex({ id: 1 }, { unique: true })
await userChessStateCollection.createIndex({ id: 1 }, { unique: true })