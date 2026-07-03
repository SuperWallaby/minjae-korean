import {
  captionTracksFromPlayer,
  extractYtInitialPlayerResponse,
  fetchCaptionPlainText,
  fetchTranscriptViaGetTranscript,
  fetchWatchPageHtml,
  orderedCaptionTracks,
} from "./youtube_caption_from_watch.mjs";

const SUPADATA_BASE = "https://api.supadata.ai/v1";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function parseVideoId(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  const fromUrl = raw.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
  if (fromUrl) return fromUrl[1];
  if (/^[\w-]{11}$/.test(raw)) return raw;
  return null;
}

export async function fetchOEmbedMeta(videoId) {
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`,
  )}&format=json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const json = await res.json();
    return {
      title: String(json?.title || "").trim(),
      channelTitle: String(json?.author_name || "").trim(),
    };
  } catch {
    return null;
  }
}

async function fetchTranscriptSupadata(videoId) {
  if (process.env.YOUTUBE_DIGEST_SKIP_SUPADATA === "1") {
    return { transcript: null, note: "supadata skipped" };
  }
  const apiKey = process.env.SUPADATA_API_KEY?.trim();
  if (!apiKey) {
    return { transcript: null, note: "supadata: missing SUPADATA_API_KEY" };
  }

  const langPref =
    (process.env.YOUTUBE_TRANSCRIPT_LANGS || "ko,en").split(",")[0]?.trim() || "ko";
  const mode = (process.env.SUPADATA_TRANSCRIPT_MODE || "auto").trim() || "auto";
  const headers = { "x-api-key": apiKey, Accept: "application/json" };

  const requestUrl = () => {
    const u = new URL(`${SUPADATA_BASE}/transcript`);
    u.searchParams.set("url", `https://www.youtube.com/watch?v=${videoId}`);
    u.searchParams.set("text", "true");
    u.searchParams.set("lang", langPref);
    u.searchParams.set("mode", mode);
    return u.toString();
  };

  const parseContentToText = (json) => {
    const c = json?.content;
    if (typeof c === "string") return c.replace(/\s+/g, " ").trim();
    if (Array.isArray(c)) {
      return c
        .map((seg) => (seg && typeof seg.text === "string" ? seg.text : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return "";
  };

  try {
    let res = await fetch(requestUrl(), {
      headers,
      signal: AbortSignal.timeout(120_000),
    });
    let json = await res.json().catch(() => null);

    if ((res.status === 202 || res.status === 200) && json && typeof json.jobId === "string") {
      const pollDeadline = Date.now() + 180_000;
      while (Date.now() < pollDeadline) {
        await sleep(1000);
        res = await fetch(`${SUPADATA_BASE}/transcript/${json.jobId}`, {
          headers,
          signal: AbortSignal.timeout(60_000),
        });
        json = await res.json().catch(() => null);
        if (json?.status === "completed") break;
        if (json?.status === "failed") {
          return { transcript: null, note: "supadata: job failed" };
        }
      }
    } else if (!res.ok) {
      return { transcript: null, note: `supadata: HTTP ${res.status}` };
    }

    const text = parseContentToText(json);
    if (!text) return { transcript: null, note: "supadata: empty content" };
    return { transcript: { format: "supadata", text }, note: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { transcript: null, note: `supadata: ${msg.slice(0, 200)}` };
  }
}

async function fetchTranscriptFromWatchPage(videoId) {
  const html = await fetchWatchPageHtml(videoId);
  const player = extractYtInitialPlayerResponse(html);
  if (player) {
    const tracks = orderedCaptionTracks(captionTracksFromPlayer(player));
    for (const track of tracks) {
      const baseUrl = track?.baseUrl;
      if (!baseUrl) continue;
      const cap = await fetchCaptionPlainText(baseUrl, videoId);
      if (cap?.text && cap.text.length >= 80) {
        return { format: cap.format || "timedtext", text: cap.text };
      }
    }
  }
  const gt = await fetchTranscriptViaGetTranscript(videoId, html);
  if (gt?.text && gt.text.length >= 80) {
    return { format: "get_transcript", text: gt.text };
  }
  return null;
}

/**
 * Fetch transcript for one video. Supadata first, then watch-page captions.
 * @returns {{ videoId, url, title, channelTitle, transcriptSource, textForPersonalSummary, transcriptError }}
 */
export async function fetchOneYoutubeDigest(videoId) {
  const meta = (await fetchOEmbedMeta(videoId)) || { title: "", channelTitle: "" };
  let transcript = null;
  let source = null;
  let error = null;

  const sd = await fetchTranscriptSupadata(videoId);
  if (sd.transcript?.text) {
    transcript = sd.transcript.text;
    source = sd.transcript.format;
  } else {
    error = sd.note;
    const fallback = await fetchTranscriptFromWatchPage(videoId);
    if (fallback?.text) {
      transcript = fallback.text;
      source = fallback.format;
      error = null;
    }
  }

  if (!transcript || transcript.trim().length < 80) {
    throw new Error(
      error || "Could not fetch a usable transcript (need SUPADATA_API_KEY or working captions).",
    );
  }

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: meta.title,
    channelTitle: meta.channelTitle,
    transcriptSource: source || "unknown",
    transcriptError: null,
    textForPersonalSummary: transcript.slice(0, 12000),
  };
}
