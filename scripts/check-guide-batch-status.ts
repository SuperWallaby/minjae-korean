import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnvLocal } from "./lib/env_local.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

function readWords(filePath: string): string[] {
  return fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}

async function main() {
  loadEnvLocal(join(__dirname, ".."));
  const { getGrammarGuideByWord } = await import("../src/lib/grammarGuidesRepo");

  const batches = [
    { type: "meaning" as const, file: "grammar-meaning-batch-6.txt" },
    { type: "usage" as const, file: "grammar-usage-batch-6.txt" },
    { type: "meaning" as const, file: "grammar-meaning-batch-7.txt" },
    { type: "usage" as const, file: "grammar-usage-batch-7.txt" },
    { type: "meaning" as const, file: "grammar-meaning-batch-8.txt" },
    { type: "usage" as const, file: "grammar-usage-batch-8.txt" },
  ];

  for (const { type, file } of batches) {
    const words = readWords(join(__dirname, "data", file));
    const missing: string[] = [];
    let firstMissingIndex = -1;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const guide = await getGrammarGuideByWord(type, word);
      if (!guide) {
        missing.push(word);
        if (firstMissingIndex < 0) firstMissingIndex = i;
      }
    }
    console.log(
      JSON.stringify({
        file,
        type,
        total: words.length,
        done: words.length - missing.length,
        missing: missing.length,
        firstMissingIndex,
        resumeStart: firstMissingIndex >= 0 ? firstMissingIndex : null,
        missingWords: missing.slice(0, 10),
      }),
    );
  }

  const compareFiles = ["grammar-batch-run-7.txt", "grammar-batch-run-8.txt"];
  const { getMongoDb } = await import("../src/lib/mongo");
  const db = await getMongoDb();
  const slugs = new Set(
    (
      await db.collection("comparisons").find({}, { projection: { slug: 1 } }).toArray()
    ).map((d) => String(d.slug)),
  );

  for (const file of compareFiles) {
    const lines = readWords(join(__dirname, "data", file));
    const missing: string[] = [];
    let firstMissingIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const words = lines[i].split(/[,，、]/).map((w) => w.trim()).filter(Boolean);
      const key = words.join("-vs-");
      const legacy = words.join("-");
      if (!slugs.has(key) && !slugs.has(legacy)) {
        missing.push(lines[i]);
        if (firstMissingIndex < 0) firstMissingIndex = i;
      }
    }
    console.log(
      JSON.stringify({
        file,
        type: "compare",
        total: lines.length,
        done: lines.length - missing.length,
        missing: missing.length,
        firstMissingIndex,
        resumeStart: firstMissingIndex >= 0 ? firstMissingIndex : null,
        missingTopics: missing.slice(0, 8),
      }),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
