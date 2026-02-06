import { MongoClient } from "mongodb";
import { env } from "../env.js";

const mongoClient = new MongoClient(env.MONGO_URI);
const db = mongoClient.db(env.MONGO_DB_NAME);

export { db };
