#!/usr/bin/env node
/**
 * Post grammar comparison pages to X (1 per run — cron fires 3× daily).
 *
 *   npx tsx scripts/post-grammar-x.ts
 *   npx tsx scripts/post-grammar-x.ts --dry-run
 *   npx tsx scripts/post-grammar-x.ts --count 3
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildGrammarXTweetText } from "../src/lib/grammarXTweet";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(join(__dirname, ".."));
  const workerEnv = join(__dirname, "..", "x-poster", "worker-runtime.env");
  const { existsSync, readFileSync } = await import("node:fs");
  if (existsSync(workerEnv)) {
    for (const line of readFileSync(workerEnv, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
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
  }
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  let count = 1;
  let comparisonId: number | null = null;
  let repost = argv.includes("--repost");

  const countFlag = argv.find((a) => a.startsWith("--count="));
  if (countFlag) {
    count = Math.max(1, parseInt(countFlag.slice("--count=".length), 10) || 1);
  } else {
    const idx = argv.indexOf("--count");
    if (idx >= 0 && argv[idx + 1]) {
      count = Math.max(1, parseInt(argv[idx + 1]!, 10) || 1);
    }
  }

  const idFlag = argv.find((a) => a.startsWith("--comparison-id="));
  if (idFlag) {
    comparisonId = parseInt(idFlag.slice("--comparison-id=".length), 10) || null;
  } else {
    const idx = argv.indexOf("--comparison-id");
    if (idx >= 0 && argv[idx + 1]) {
      comparisonId = parseInt(argv[idx + 1]!, 10) || null;
    }
  }

  return { dryRun, count, comparisonId, repost };
}

function comparisonPageUrl(id: number, slug: string): string {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://kajakorean.com";
  return `${site}/grammar/${id}/${encodeURIComponent(slug)}`;
}

function shouldIncludePageLink(): boolean {
  const raw = process.env.X_POST_LINK_RATE?.trim();
  const rate = raw ? parseFloat(raw) : 0.05;
  if (!Number.isFinite(rate) || rate <= 0) return false;
  if (rate >= 1) return true;
  return Math.random() < rate;
}

async function fetchImageBuffer(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed (${res.status}): ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/webp";
  if (mimeType === "image/webp") {
    const sharp = (await import("sharp")).default;
    return {
      buffer: await sharp(buffer).jpeg({ quality: 88 }).toBuffer(),
      mimeType: "image/jpeg",
    };
  }
  return { buffer, mimeType };
}

async function postComparison(
  comparison: Awaited<
    ReturnType<typeof import("../src/lib/grammarXPostsRepo").listComparisonsPendingXPost>
  >[number],
  dryRun: boolean,
) {
  const words = comparison.items.map((i) => i.wordName.trim()).filter(Boolean);
  if (words.length < 2) {
    throw new Error(`Comparison id=${comparison.id} needs at least 2 words`);
  }
  const alt = comparison.imageAlt?.trim();
  if (!alt) throw new Error(`Comparison id=${comparison.id} missing imageAlt`);
  const imageUrl = comparison.imageUrl?.trim();
  if (!imageUrl) throw new Error(`Comparison id=${comparison.id} missing imageUrl`);

  const pageUrl = comparisonPageUrl(comparison.id, comparison.slug);
  const includeLink = shouldIncludePageLink();
  const maxExamples = Math.max(
    0,
    parseInt(process.env.X_POST_EXAMPLE_COUNT?.trim() || "4", 10) || 4,
  );
  const { ensureComparisonExampleTranslations } = await import(
    "../src/lib/grammarExampleTranslations"
  );
  const examples = await ensureComparisonExampleTranslations(
    comparison.id,
    comparison.examples,
  );
  const tweetText = buildGrammarXTweetText({
    words,
    examples,
    pageUrl,
    includeLink,
    maxExamples,
  });

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          id: comparison.id,
          slug: comparison.slug,
          tweetText,
          includeLink,
          imageUrl,
          alt,
          pageUrl,
        },
        null,
        2,
      ),
    );
    return;
  }

  const { buffer, mimeType } = await fetchImageBuffer(imageUrl);
  const { postTweetWithImage } = await import("./lib/x_post.mjs");
  const { tweetId, tweetUrl } = await postTweetWithImage({
    imageBuffer: buffer,
    mimeType,
    altText: alt,
    tweetText,
  });

  const { recordGrammarXPost } = await import("../src/lib/grammarXPostsRepo");
  await recordGrammarXPost({
    comparisonId: comparison.id,
    tweetId,
    tweetUrl,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        id: comparison.id,
        slug: comparison.slug,
        tweetId,
        tweetUrl,
        pageUrl,
        includeLink,
      },
      null,
      2,
    ),
  );

  return { tweetId, tweetUrl };
}

async function postManualQueueItem(
  item: import("../src/lib/grammarXQueueRepo").GrammarXQueueItem,
  dryRun: boolean,
) {
  const tweetText = item.tweetText?.trim();
  const imageUrl = item.imageUrl?.trim();
  const alt = item.imageAlt?.trim();
  if (!tweetText || !imageUrl || !alt) {
    throw new Error(`Manual queue item ${item.id} missing tweetText/imageUrl/imageAlt`);
  }

  if (dryRun) {
    console.log(
      JSON.stringify(
        { dryRun: true, queueId: item.id, kind: "manual", tweetText, imageUrl, alt },
        null,
        2,
      ),
    );
    return;
  }

  const { buffer, mimeType } = await fetchImageBuffer(imageUrl);
  const { postTweetWithImage, postTweetReply } = await import("./lib/x_post.mjs");
  const { tweetId, tweetUrl } = await postTweetWithImage({
    imageBuffer: buffer,
    mimeType,
    altText: alt,
    tweetText,
  });

  const replyText = item.replyText?.trim();
  let replyTweetUrl: string | undefined;
  if (replyText) {
    const reply = await postTweetReply({ tweetText: replyText, inReplyToTweetId: tweetId });
    replyTweetUrl = reply.tweetUrl;
  }

  const { markGrammarXQueuePosted } = await import("../src/lib/grammarXQueueRepo");
  await markGrammarXQueuePosted({ id: item.id, tweetId, tweetUrl });

  console.log(
    JSON.stringify(
      { ok: true, queueId: item.id, kind: "manual", tweetId, tweetUrl, replyTweetUrl },
      null,
      2,
    ),
  );
}

async function postQueueItem(
  item: import("../src/lib/grammarXQueueRepo").GrammarXQueueItem,
  dryRun: boolean,
) {
  if (item.kind === "manual") {
    await postManualQueueItem(item, dryRun);
    return;
  }

  const { getComparisonForXPost } = await import("../src/lib/grammarXPostsRepo");
  const comparisonId = item.comparisonId;
  if (!comparisonId) throw new Error(`Queue item ${item.id} missing comparisonId`);
  const comparison = await getComparisonForXPost(comparisonId);
  if (!comparison) {
    throw new Error(`Comparison id=${comparisonId} not ready for X`);
  }
  const result = await postComparison(comparison, dryRun);
  if (!dryRun && result) {
    const { markGrammarXQueuePosted } = await import("../src/lib/grammarXQueueRepo");
    await markGrammarXQueuePosted({
      id: item.id,
      tweetId: result.tweetId,
      tweetUrl: result.tweetUrl,
    });
  }
}

async function postFromQueue(dryRun: boolean): Promise<boolean> {
  const queueRepo = await import("../src/lib/grammarXQueueRepo");
  const item = dryRun
    ? (await queueRepo.listGrammarXQueueItems(1))[0] ?? null
    : await queueRepo.claimNextGrammarXQueueItem();
  if (!item) return false;

  try {
    await postQueueItem(item, dryRun);
    return true;
  } catch (error) {
    if (!dryRun) {
      await queueRepo.markGrammarXQueueFailed(
        item.id,
        error instanceof Error ? error.message : String(error),
      );
    }
    throw error;
  }
}

async function main() {
  await loadEnv();
  const { dryRun, count, comparisonId, repost } = parseArgs(process.argv.slice(2));

  const {
    listComparisonsPendingXPost,
    countComparisonsPendingXPost,
    getComparisonForXPost,
    clearGrammarXPost,
  } = await import("../src/lib/grammarXPostsRepo");

  if (comparisonId != null && repost) {
    await clearGrammarXPost(comparisonId);
    console.log(`Cleared X post record for comparison id=${comparisonId}`);
  }

  if (comparisonId != null) {
    const one = await getComparisonForXPost(comparisonId);
    if (!one) {
      throw new Error(`Comparison id=${comparisonId} not ready for X (missing image/alt or not found)`);
    }
    await postComparison(one, dryRun);
    process.exit(0);
  }

  if (await postFromQueue(dryRun)) {
    process.exit(0);
  }

  const pending = await countComparisonsPendingXPost();
  console.log(`Pending X posts: ${pending}`);

  const batch = await listComparisonsPendingXPost(count);
  if (batch.length === 0) {
    console.log("Nothing to post.");
    process.exit(0);
  }

  for (const comparison of batch) {
    await postComparison(comparison, dryRun);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
