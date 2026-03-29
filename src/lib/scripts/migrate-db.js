// scripts/migrate.js
import 'dotenv/config';
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

const oldDb = "games";
const newDb = "jouonsentrepotes";

const collections = ["user", "account", "session"];

async function migrateCollection(oldCollectionName) {
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const oldDB = client.db(oldDb);
    const newDB = client.db(newDb);

    const oldCol = oldDB.collection(oldCollectionName);
    const newCol = newDB.collection(oldCollectionName);

    console.log(`\n--- Migration de ${oldCollectionName} ---`);

    const cursor = oldCol.find();

    while (await cursor.hasNext()) {
      const doc = await cursor.next();

      try {
        await newCol.insertOne(doc);
      } catch (err) {
        if (err.code === 11000) {
          const { _id, ...docWithoutId } = doc;

          await newCol.updateOne(
            { _id: doc._id },
            { $set: docWithoutId }
          );
        } else {
          throw err;
        }
      }
    }

    console.log(`✅ ${oldCollectionName} migrée`);
  } catch (err) {
    console.error(`❌ Erreur sur ${oldCollectionName}:`, err);
  } finally {
    await client.close();
  }
}

async function run() {
  for (const col of collections) {
    await migrateCollection(col);
  }

  console.log("\n🎉 Migration terminée !");
}

run();