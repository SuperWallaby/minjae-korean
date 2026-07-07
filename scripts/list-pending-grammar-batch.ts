import { loadEnvLocal } from "./lib/env_local.mjs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

function slugKey(words: string[]) {
  return words.map((w) => w.trim()).join("-vs-");
}

async function main() {
  loadEnvLocal(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
  const { getMongoDb } = await import("../src/lib/mongo.ts");

  const batchPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../scripts/data/grammar-batch-1000-clean.txt",
  );
  const groups = fs
    .readFileSync(batchPath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => l.split(/[,，、]/).map((w) => w.trim()).filter(Boolean));

  const db = await getMongoDb();
  const slugs = new Set(
    (
      await db.collection("comparisons").find({}, { projection: { slug: 1 } }).toArray()
    ).map((d) => String(d.slug)),
  );

  const pending = groups.filter((words) => {
    const key = slugKey(words);
    const legacy = words.join("-");
    return !slugs.has(key) && !slugs.has(legacy);
  });

  const outPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../scripts/data/grammar-batch-pending.txt",
  );
  const lines = [
    `# Pending clean topics — ${pending.length} not yet in DB`,
    ...pending.map((w) => w.join(",")),
  ];
  fs.writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ total: groups.length, pending: pending.length, out: outPath }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
