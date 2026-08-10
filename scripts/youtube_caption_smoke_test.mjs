#!/usr/bin/env node
/**
 * Debug one video: watch page → ytInitialPlayerResponse → caption tracks → timedtext.
 * Uses the same pipeline as youtube_personal_digest (shared lib).
 *
 *   yarn youtube:caption-smoke
 *   yarn youtube:caption-smoke dQw4w9WgXcQ
 *   yarn youtube:caption-smoke "https://www.youtube.com/watch?v=arj7oStGLkU"
 */

import {
  extractYtInitialPlayerResponse,
  captionTracksFromPlayer,
  orderedCaptionTracks,
  fetchCaptionPlainText,
  fetchWatchPageHtml,
  probeCaptionFormat,
  fetchInnertubePlayerCaptionTracks,
  INNERTUBE_PLAYER_CLIENTS,
  fetchTranscriptViaGetTranscript,
} from "./lib/youtube_caption_from_watch.mjs";

/** Rick Astley — reliably has timed captions for smoke tests. */
const DEFAULT_VIDEO_ID = "dQw4w9WgXcQ";

function parseVideoId(argv) {
  const raw = argv[2];
  if (!raw || raw.startsWith("--")) return DEFAULT_VIDEO_ID;
  const fromUrl = raw.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
  if (fromUrl) return fromUrl[1];
  if (/^[\w-]{11}$/.test(raw)) return raw;
  console.error(`Bad URL or id (need 11-char id): ${raw}`);
  process.exit(1);
}

async function main() {
  const id = parseVideoId(process.argv);
  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  console.error(`[smoke] videoId=${id}`);
  console.error(`[smoke] ${watchUrl}`);

  const html = await fetchWatchPageHtml(id);
  console.error(`[smoke] watch HTML bytes=${html.length}`);
  console.error(
    `[smoke] markers: ytInitialPlayerResponse=${html.includes("ytInitialPlayerResponse")} timedtext=${html.includes("timedtext")}`,
  );

  const player = extractYtInitialPlayerResponse(html);
  if (!player) {
    console.error("[smoke] FAIL: could not parse ytInitialPlayerResponse from HTML");
    process.exit(2);
  }

  const ps = player.playabilityStatus?.status;
  const reason = player.playabilityStatus?.reason;
  console.error(`[smoke] playabilityStatus.status=${ps}${reason ? ` reason=${reason.slice(0, 120)}` : ""}`);

  const tracks = captionTracksFromPlayer(player);
  console.error(`[smoke] captionTracks count=${tracks.length}`);
  tracks.forEach((t, i) => {
    const name = t.name?.simpleText || t.name?.runs?.map((r) => r.text).join("") || "";
    const url = (t.baseUrl || "").slice(0, 96);
    console.error(
      `  [track ${i}] lang=${t.languageCode} kind=${t.kind || ""} name=${JSON.stringify(name).slice(0, 80)}`,
    );
    console.error(`           baseUrl…=${url}…`);
  });

  if (!tracks.length) {
    console.error("[smoke] FAIL: no caption tracks in player response (video may be age/region locked or no captions)");
    process.exit(3);
  }

  const first = tracks[0];
  console.error(`\n[smoke] probing formats on first track only (lang=${first.languageCode}):`);
  let anyBody = false;
  for (const fmt of ["json3", "srv3", "vtt"]) {
    const row = await probeCaptionFormat(first.baseUrl, fmt, id);
    if (row.bodyLen > 0) anyBody = true;
    console.error(
      `  ${row.fmt} status=${row.status} bodyLen=${row.bodyLen} parsedLen=${row.parsedLen}`,
    );
    if (row.parsedLen === 0 && row.bodyLen < 400) console.error(`    preview: ${row.bodyPreview}`);
  }
  if (!anyBody) {
    console.error(
      "\n[smoke] NOTE: timedtext returned 200 with 0-byte body for every format. Some cloud/datacenter egress IPs see this; run the same command on your laptop/home network to confirm the pipeline.",
    );
  }

  console.error("\n[smoke] fetchCaptionPlainText (json3→srv3→vtt cascade) on first track:");
  const one = await fetchCaptionPlainText(first.baseUrl, id);
  console.error(
    one
      ? `  OK format=${one.format} chars=${one.text.length} head=${JSON.stringify(one.text.slice(0, 120))}`
      : "  FAIL (null)",
  );

  console.error("\n[smoke] orderedCaptionTracks → fetch each until text (digest order):");
  const ordered = orderedCaptionTracks(tracks);
  for (let i = 0; i < ordered.length; i++) {
    const t = ordered[i];
    const got = await fetchCaptionPlainText(t.baseUrl, id);
    console.error(
      `  [ordered ${i}] lang=${t.languageCode} → ${got ? `${got.format} ${got.text.length} chars` : "null"}`,
    );
    if (got && got.text.length >= 80) {
      console.error(`\n[smoke] PASS: usable caption on ordered[${i}] (${got.text.length} chars)`);
      process.exit(0);
    }
  }

  console.error("\n[smoke] Innertube player (TVHTML5 → ANDROID → WEB) → timedtext:");
  for (const client of INNERTUBE_PLAYER_CLIENTS) {
    const alt = await fetchInnertubePlayerCaptionTracks(id, html, client);
    console.error(
      `  client=${client.clientName} tracks=${alt?.length ?? 0}`,
    );
    if (!alt?.length) continue;
    const ord = orderedCaptionTracks(alt);
    for (let i = 0; i < ord.length; i++) {
      const got = await fetchCaptionPlainText(ord[i].baseUrl, id);
      console.error(
        `    [${client.clientName} ordered ${i}] lang=${ord[i].languageCode} → ${got ? `${got.format} ${got.text.length} chars` : "null"}`,
      );
      if (got && got.text.length >= 80) {
        console.error(`\n[smoke] PASS: innertube ${client.clientName} ordered[${i}] (${got.text.length} chars)`);
        process.exit(0);
      }
    }
  }

  console.error("\n[smoke] youtubei v1/get_transcript (params from HTML):");
  const gt = await fetchTranscriptViaGetTranscript(id, html);
  if (gt?.text && gt.text.length >= 80) {
    console.error(`  PASS get_transcript (${gt.text.length} chars)`);
    process.exit(0);
  }
  console.error(gt ? `  got ${gt.text.length} chars (<80 or empty segments)` : "  null");

  console.error("\n[smoke] FAIL: no track produced ≥80 chars after cascade");
  process.exit(4);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
