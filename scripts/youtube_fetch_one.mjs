#!/usr/bin/env node
/**
 * Fetch transcript for one YouTube URL → digest JSON (compatible with blog/news pipelines).
 *
 *   yarn blog:fetch "https://www.youtube.com/watch?v=VIDEO_ID"
 *   yarn blog:fetch dQw4w9WgXcQ --out .tmp/my-digest.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";
import { fetchOneYoutubeDigest, parseVideoId } from "./lib/youtube_transcript.mjs";

const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const positional = argv.filter((a) => !a.startsWith("--"));
  const val = (flag, fallback) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
  };
  return {
    urlOrId: positional[0] || "",
    out: val("--out", join(ROOT, ".tmp", "youtube-one-digest.json")),
  };
}

async function main() {
  loadEnvLocal(ROOT_DIR);
  const args = parseArgs(process.argv.slice(2));
  const videoId = parseVideoId(args.urlOrId);
  if (!videoId) {
    console.error("Usage: yarn blog:fetch <youtube-url-or-id> [--out path.json]");
    process.exit(1);
  }

  console.error(`[blog:fetch] videoId=${videoId}`);
  const result = await fetchOneYoutubeDigest(videoId);
  const payload = { generatedAt: new Date().toISOString(), results: [result] };
  const outAbs = resolve(ROOT_DIR, args.out);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, JSON.stringify(payload, null, 2), "utf8");
  console.error(`[blog:fetch] transcript ${result.transcriptSource}, ${result.textForPersonalSummary.length} chars`);
  console.error(`[blog:fetch] saved ${outAbs}`);
  console.log(JSON.stringify({ ok: true, out: outAbs, videoId, title: result.title }, null, 2));
}

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
