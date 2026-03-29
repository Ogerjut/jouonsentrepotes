import 'dotenv/config';
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

async function cleanUsers() {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db("jouonsentrepotes");
    const col = db.collection("user");

    const cursor = col.find();

    let count = 0;

    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!doc) continue;

      const update = {
        $set: {
          name: doc.name,
          email: doc.email,
          emailVerified: doc.emailVerified ?? false,
          createdAt: doc.createdAt ?? new Date(),
          updatedAt: new Date(),
          username: doc.username,
          displayUsername: doc.displayUsername,
          role: doc.role || "user"
        },
        $unset: {
          inGame: "",
          isActive: "",
          victories: "",
          games: "",
          score: "",
          belote: "",
          chess: "",
          tarot: "",
          yams: "",
          highestScore: ""
        }
      };

      await col.updateOne(
        { _id: doc._id },
        update
      );

      count++;
    }

    console.log(`✅ ${count} users nettoyés`);
  } catch (err) {
    console.error("❌ Erreur :", err);
  } finally {
    await client.close();
  }
}

cleanUsers();