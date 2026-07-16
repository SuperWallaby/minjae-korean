import { MongoClient } from "mongodb";

import { registerMongoShutdownHandlers } from "@/lib/mongoShutdown";

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

let closingPromise: Promise<void> | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  registerMongoShutdownHandlers();

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

/** Close the shared Mongo client (safe to call multiple times). */
export async function closeMongoClient(): Promise<void> {
  const g = globalThis as GlobalWithMongo;
  const promise = g.__mjMongoClientPromise;
  if (!promise) return;

  if (closingPromise) {
    await closingPromise;
    return;
  }

  closingPromise = (async () => {
    g.__mjMongoClientPromise = undefined;
    try {
      const client = await promise;
      await client.close();
    } catch (error) {
      console.warn(
        "[mongo] close failed:",
        error instanceof Error ? error.message : error,
      );
    } finally {
      closingPromise = null;
    }
  })();

  await closingPromise;
}

export { registerMongoShutdownHandlers } from "@/lib/mongoShutdown";
