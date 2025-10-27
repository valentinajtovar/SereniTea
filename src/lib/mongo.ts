import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB!;
let client: MongoClient | null = null;
let dbCached: Db | null = null;

export async function getDb(): Promise<Db> {
  if (dbCached) return dbCached;
  if (!client) client = new MongoClient(uri, { maxPoolSize: 5 });
  if (!client.topology?.isConnected?.()) await client.connect();
  dbCached = client.db(dbName);
  return dbCached;
}

export async function pingMongo(): Promise<boolean> {
  const db = await getDb();
  const res = await db.command({ ping: 1 });
  return res?.ok === 1;
}