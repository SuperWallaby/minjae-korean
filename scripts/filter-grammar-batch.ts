/**
 * Filter an existing batch file to learner-quality topics only.
 * npx tsx scripts/filter-grammar-batch.ts [--in path] [--out path] [--from 1]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isLearnerQualityComparison } from "./lib/grammar-batch-quality.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function readLines(filePath: string): string[][] {
  return fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) =>
      line
        .split(/[,，、]/)
        .map((w) => w.trim())
        .filter(Boolean),
    )
    .filter((words) => words.length >= 2);
}

function arg(flag: string, fallback: string | null): string | null {
  const eq = process.argv.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1]!;
  return fallback;
}

const inPath = path.join(ROOT, arg("--in", "scripts/data/grammar-batch-1000-random.txt")!);
const outPath = path.join(ROOT, arg("--out", "scripts/data/grammar-batch-1000-clean.txt")!);
const fromLine = Math.max(1, parseInt(arg("--from", "1")!, 10) || 1);

const all = readLines(inPath);
const slice = all.slice(fromLine - 1);
const kept = slice.filter(isLearnerQualityComparison);
const dropped = slice.length - kept.length;

const header = `# Filtered grammar batch — ${kept.length} topics (from line ${fromLine}, dropped ${dropped} low-quality)`;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  `${header}\n${kept.map((w) => w.join(",")).join("\n")}\n`,
  "utf8",
);

console.log(
  JSON.stringify(
    { in: inPath, out: outPath, fromLine, input: slice.length, kept: kept.length, dropped },
    null,
    2,
  ),
);
