import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = "myAppChatDB"; // Назвіть вашу БД

let db;
let client;

export async function connectToDatabase() {
  if (db) return db;
  client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log("MongoDB connected successfully.");
    db = client.db(DB_NAME);

    // Створення індексів (якщо ще не існують)
    await db.collection("chatrooms").createIndex({ members: 1 });
    await db.collection("chatrooms").createIndex({ lastActivity: -1 });
    await db.collection("messages").createIndex({ chatId: 1 });
    await db.collection("messages").createIndex({ timestamp: 1 });

    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return db;
}

export function getClient() {
  return client;
}
