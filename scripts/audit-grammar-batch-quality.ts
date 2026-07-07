import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isLearnerQualityComparison } from "./lib/grammar-batch-quality.ts";

const file = process.argv[2] ?? "scripts/data/grammar-batch-1000-random.txt";
const abs = path.isAbsolute(file) ? file : path.join(path.dirname(fileURLToPath(import.meta.url)), "..", file);

const groups = fs
  .readFileSync(abs, "utf8")
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split(/[,，、]/).map((w) => w.trim()).filter(Boolean));

const bad = groups.filter((g) => !isLearnerQualityComparison(g));
const good = groups.filter((g) => isLearnerQualityComparison(g));

console.log(JSON.stringify({ file, total: groups.length, bad: bad.length, good: good.length }, null, 2));
if (bad.length) {
  console.log("\nRejected samples:");
  for (const g of bad.slice(0, 40)) console.log(`  ${g.join(",")}`);
}
