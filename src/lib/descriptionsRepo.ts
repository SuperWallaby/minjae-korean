import type { Collection } from "mongodb";
import crypto from "crypto";

import { getMongoDb } from "@/lib/mongo";

export type DescriptionResult = {
  translation: string;
  explanation: string;
  vocabulary: Array<{ word: string; meaning: string }>;
};

type DescriptionDoc = {
  _id: string;
  text: string;
  result: DescriptionResult;
  createdAt: string;
};

type Collections = {
  descriptions: Collection<DescriptionDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const descriptions = db.collection<DescriptionDoc>("descriptions");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await descriptions.createIndex({ createdAt: -1 });
      } catch {}
    })();
  }
  void indexesPromise;

  return { descriptions };
}

function hashText(text: string): string {
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}

export async function getCachedDescription(text: string): Promise<DescriptionResult | null> {
  const { descriptions } = await cols();
  const id = hashText(text);
  const doc = await descriptions.findOne({ _id: id });
  return doc?.result ?? null;
}

export async function saveDescription(text: string, result: DescriptionResult): Promise<void> {
  const { descriptions } = await cols();
  const id = hashText(text);
  await descriptions.updateOne(
    { _id: id },
    {
      $set: {
        text: text.trim(),
        result,
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );
}
