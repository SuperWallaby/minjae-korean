#!/usr/bin/env node
/**
 * Generate quiz-word flashcard pins from Mongo korean_quiz_items.
 *
 *   node scripts/gen-quiz-word-pins.mjs --limit 1
 *   node scripts/gen-quiz-word-pins.mjs --id <quizId>
 *   node scripts/gen-quiz-word-pins.mjs --limit 20 --seo-only
 *
 * Destination: https://kajakorean.com/vocab/detail/how-to-say/{id}/{slug}
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { MongoClient } from "mongodb";

import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";
import {
  generateWordFlashcardFiles,
  wordFieldsFromQuizDoc,
} from "./lib/quiz_word_pin.mjs";

loadEnvLocal(ROOT);
// AVK .env fallback
const avkEnvCandidates = [
  join(ROOT, "../projects/neo-project/auto-video-korean/.env"),
  join(ROOT, "../neo-project/auto-video-korean/.env"),
  "/Users/minjaekim/Desktop/projects/neo-project/auto-video-korean/.env",
];
for (const avkEnv of avkEnvCandidates) {
  if (!existsSync(avkEnv)) continue;
  for (const line of readFileSync(avkEnv, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
  break;
}

const { values: args } = parseArgs({
  options: {
    limit: { type: "string", default: "1" },
    id: { type: "string" },
    "seo-only": { type: "boolean", default: true },
    "open-finder": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    concurrency: { type: "string", default: "6" },
    out: { type: "string" },
  },
});

const limit = Math.max(1, Number(args.limit) || 1);
const onlyId = args.id ? String(args.id).trim() : "";
const seoOnly = args["seo-only"] !== false;
const openFinder = Boolean(args["open-finder"]);
const force = Boolean(args.force);
const concurrency = Math.max(1, Math.min(16, Number(args.concurrency) || 6));
const outRoot = args.out
  ? join(ROOT, args.out)
  : join(ROOT, ".tmp/quiz-word-pins");
const LEDGER = join(outRoot, "word-pin-ledger.json");

function loadLedger() {
  if (!existsSync(LEDGER)) return {};
  try {
    return JSON.parse(readFileSync(LEDGER, "utf8"));
  } catch {
    return {};
  }
}

function saveLedger(data) {
  mkdirSync(outRoot, { recursive: true });
  writeFileSync(LEDGER, `${JSON.stringify(data, null, 2)}\n`);
}

/** Serialize ledger writes under concurrency. */
let ledgerWriteChain = Promise.resolve();
function saveLedgerSync(data) {
  ledgerWriteChain = ledgerWriteChain.then(() => {
    saveLedger(data);
  });
  return ledgerWriteChain;
}

function mongoUri() {
  return (
    process.env.KOREAN_QUIZ_MONGODB_URI ||
    process.env.MONGODB_URI ||
    ""
  ).trim();
}

function dbName() {
  return (
    process.env.KOREAN_QUIZ_MONGODB_DB_NAME ||
    process.env.KOREAN_QUIZ_DB ||
    process.env.MONGODB_DB_NAME ||
    process.env.MONGODB_DB ||
    "korean_quiz"
  ).trim();
}

async function main() {
  const uri = mongoUri();
  if (!uri) throw new Error("Missing MONGODB_URI / KOREAN_QUIZ_MONGODB_URI");

  mkdirSync(outRoot, { recursive: true });
  const ledger = loadLedger();

  const client = new MongoClient(uri);
  await client.connect();
  try {
    const col = client.db(dbName()).collection("korean_quiz_items");
    /** @type {Record<string, unknown>} */
    const filter = {
      status: "approved",
      type: "image_mcq",
      imageUrl: { $exists: true, $nin: [null, ""] },
    };
    if (onlyId) filter.id = onlyId;
    if (seoOnly) {
      filter.wordExplanation = { $exists: true, $nin: [null, ""] };
      filter["wordExplanationExamples.1"] = { $exists: true };
    }

    // Pull plenty of candidates (skip ledger-ok later). Full SEO set is ~2k.
    const fetchCap = Math.max(limit * 2, limit + 500, 4000);
    const cursor = col
      .find(filter, {
        projection: {
          _id: 0,
          id: 1,
          type: 1,
          status: 1,
          choices: 1,
          correctChoiceId: 1,
          imageUrl: 1,
          imageR2Key: 1,
          illustrationEnglish: 1,
          romanization: 1,
          wordExplanation: 1,
          wordExplanationExamples: 1,
        },
      })
      .limit(fetchCap);

    const docs = await cursor.toArray();
    const targets = [];
    for (const doc of docs) {
      const word = wordFieldsFromQuizDoc(doc);
      if (!word.id || !word.hangul || !word.english || !word.imageUrl) continue;
      if (!force && ledger[word.id]?.status === "ok") continue;
      targets.push(word);
      if (targets.length >= limit) break;
    }

    if (!targets.length) {
      console.log("nothing to generate (empty query or all done)");
      return;
    }

    console.log(
      `==> quiz word pins n=${targets.length} concurrency=${concurrency} seoOnly=${seoOnly} out=${outRoot}`,
    );

    let ok = 0;
    let fail = 0;
    let lastJpg = "";
    let nextIndex = 0;

    async function worker() {
      while (true) {
        const i = nextIndex;
        nextIndex += 1;
        if (i >= targets.length) return;
        const word = targets[i];
        console.log(
          `\n→ [${i + 1}/${targets.length}] ${word.english} / ${word.hangul} (${word.id.slice(0, 8)}…)`,
        );
        console.log(`   dest: ${word.destination}`);
        try {
          const dir = join(outRoot, word.id);
          const { jpgPath, pngPath } = await generateWordFlashcardFiles(word, dir);
          ledger[word.id] = {
            status: "ok",
            at: new Date().toISOString(),
            english: word.english,
            hangul: word.hangul,
            romanization: word.romanization,
            destination: word.destination,
            jpg: jpgPath,
            png: pngPath,
          };
          await saveLedgerSync(ledger);
          console.log(`  ok ${jpgPath}`);
          lastJpg = jpgPath;
          ok += 1;
        } catch (err) {
          fail += 1;
          console.error(`  FAIL:`, err instanceof Error ? err.message : err);
          ledger[word.id] = {
            status: "error",
            at: new Date().toISOString(),
            error: err instanceof Error ? err.message : String(err),
          };
          await saveLedgerSync(ledger);
        }
      }
    }

    await Promise.all(
      Array.from({ length: concurrency }, () => worker()),
    );

    console.log(`\n[done] ok=${ok} fail=${fail} ledger=${LEDGER}`);
    if (openFinder && lastJpg) {
      const { execFile } = await import("node:child_process");
      const { promisify } = await import("node:util");
      const execFileAsync = promisify(execFile);
      // Reveal in Finder (macOS)
      await execFileAsync("open", ["-R", lastJpg]);
      console.log(`  opened Finder at ${lastJpg}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
