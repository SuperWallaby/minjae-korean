import { MongoClient } from "mongodb";

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const uri = () => requireEnv("MONGODB_URI");
const dbName = () => process.env.MONGODB_DB?.trim() || "";

type GlobalWithMongo = typeof globalThis & {
  __mjMongoClientPromise?: Promise<MongoClient>;
};

export async function getMongoClient(): Promise<MongoClient> {
  const g = globalThis as GlobalWithMongo;
  if (!g.__mjMongoClientPromise) {
    const client = new MongoClient(uri(), {
      // Serverless-friendly defaults.
      maxPoolSize: 10,
    });
    g.__mjMongoClientPromise = client.connect();
  }
  return g.__mjMongoClientPromise;
}

export async function getMongoDb() {
  const client = await getMongoClient();
  const explicit = dbName();
  if (explicit) return client.db(explicit);
  return client.db(); // use db from connection string
}

