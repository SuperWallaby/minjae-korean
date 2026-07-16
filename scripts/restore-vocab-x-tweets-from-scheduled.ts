#!/usr/bin/env node
/**
 * Push tweetText from vocab-x-scheduled.json back into Mongo
 * (grammar_x_post_queue + vocab_x_review) for vocab-infographic items.
 *
 *   npx tsx scripts/restore-vocab-x-tweets-from-scheduled.ts
 *   npx tsx scripts/restore-vocab-x-tweets-from-scheduled.ts --dry-run
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCHEDULED_PATH = path.join(
  ROOT,
  ".tmp/vocab-infographic-gen/vocab-x-scheduled.json",
);

async function main() {
  console.log("restore: start");
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(ROOT);
  console.log("restore: env loaded");
  const { getMongoDb } = await import("../src/lib/mongo.ts");
  console.log("restore: connecting mongo…");

  const dryRun = process.argv.includes("--dry-run");
  const scheduled = JSON.parse(fs.readFileSync(SCHEDULED_PATH, "utf8")) as Record<
    string,
    {
      tweetText?: string;
      replyText?: string;
      caption?: { line1?: string; line2?: string };
    }
  >;
  console.log(`restore: scheduled entries=${Object.keys(scheduled).length}`);

  const db = await getMongoDb();
  console.log("restore: mongo ok");
  const queued = await db
    .collection("grammar_x_post_queue")
    .find({
      status: { $in: ["queued", "posting"] },
      note: { $regex: /^vocab-infographic:/ },
    })
    .toArray();

  let qFixed = 0;
  let qSkipped = 0;
  for (const row of queued) {
    const bundleId = String(row.note ?? "")
      .replace(/^vocab-infographic:/, "")
      .trim();
    const entry = scheduled[bundleId];
    const tweetText = entry?.tweetText?.trim();
    if (!tweetText || /what.?s the word/i.test(tweetText)) {
      qSkipped += 1;
      continue;
    }
    if (String(row.tweetText || "") === tweetText) continue;

    if (dryRun) {
      console.log(`[dry-run] queue ${bundleId}`);
      qFixed += 1;
      continue;
    }

    const $set: Record<string, unknown> = {
      tweetText,
      updatedAt: new Date().toISOString(),
    };
    const $unset: Record<string, ""> = {};
    if (entry.replyText) $set.replyText = entry.replyText;
    else $unset.replyText = "";

    await db.collection("grammar_x_post_queue").updateOne(
      { id: row.id },
      { $set, ...(Object.keys($unset).length ? { $unset } : {}) },
    );

    const reviewSet: Record<string, unknown> = {
      tweetText,
      captionLine1: entry.caption?.line1 ?? "",
      captionLine2: entry.caption?.line2 ?? "",
      updatedAt: new Date().toISOString(),
    };
    if (entry.replyText) reviewSet.replyText = entry.replyText;

    await db.collection("vocab_x_review").updateOne(
      { bundleId },
      {
        $set: reviewSet,
        ...(entry.replyText ? {} : { $unset: { replyText: "" } }),
      },
    );
    qFixed += 1;
    console.log(`✓ queue ${bundleId}`);
  }

  const reviews = await db
    .collection("vocab_x_review")
    .find({ tweetText: { $regex: /what.?s the word/i } })
    .project({ bundleId: 1 })
    .toArray();

  let rFixed = 0;
  for (const row of reviews) {
    const bundleId = String(row.bundleId || "");
    const entry = scheduled[bundleId];
    if (!entry?.tweetText || /what.?s the word/i.test(entry.tweetText)) continue;
    if (dryRun) {
      console.log(`[dry-run] review ${bundleId}`);
      rFixed += 1;
      continue;
    }
    const reviewSet: Record<string, unknown> = {
      tweetText: entry.tweetText,
      captionLine1: entry.caption?.line1 ?? "",
      captionLine2: entry.caption?.line2 ?? "",
      updatedAt: new Date().toISOString(),
    };
    if (entry.replyText) reviewSet.replyText = entry.replyText;
    await db.collection("vocab_x_review").updateOne(
      { bundleId },
      {
        $set: reviewSet,
        ...(entry.replyText ? {} : { $unset: { replyText: "" } }),
      },
    );
    rFixed += 1;
    console.log(`✓ review ${bundleId}`);
  }

  const stillQ = await db.collection("grammar_x_post_queue").countDocuments({
    status: { $in: ["queued", "posting"] },
    tweetText: { $regex: /what.?s the word/i },
  });
  const stillR = await db.collection("vocab_x_review").countDocuments({
    tweetText: { $regex: /what.?s the word/i },
  });

  console.log(
    JSON.stringify(
      {
        dryRun,
        queuedChecked: queued.length,
        qFixed,
        qSkipped,
        reviewBadBefore: reviews.length,
        rFixed,
        stillQ,
        stillR,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
