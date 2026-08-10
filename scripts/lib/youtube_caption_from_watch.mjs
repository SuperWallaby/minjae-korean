/**
 * Watch-page HTML → ytInitialPlayerResponse → timedtext captions.
 * Shared by youtube_personal_digest.mjs and youtube_caption_smoke_test.mjs.
 */

/** Match browser fetch so timedtext URLs are less likely to return empty/403. */
export const WATCH_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export const captionFetchHeaders = (videoId = null) => ({
  "User-Agent": WATCH_UA,
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9,ko-KR,ko;q=0.8",
  Referer: videoId
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
    : "https://www.youtube.com/",
});

/** Headers for timedtext GET (Referer + Origin; debug showed extra header variants did not change empty-body responses). */
export function timedtextFetchHeaders(videoId = null) {
  return {
    ...captionFetchHeaders(videoId),
    Origin: "https://www.youtube.com",
  };
}

/** Balanced-brace JSON object extractor starting at first `{` */
export function parseJsonObjectFrom(html, startIdx) {
  let i = html.indexOf("{", startIdx);
  if (i === -1) return null;
  let depth = 0;
  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(i, j + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

export function extractYtInitialPlayerResponse(html) {
  const markers = ["var ytInitialPlayerResponse = ", "ytInitialPlayerResponse = "];
  for (const mk of markers) {
    const pos = html.indexOf(mk);
    if (pos === -1) continue;
    const parsed = parseJsonObjectFrom(html, pos + mk.length);
    if (parsed) return parsed;
  }
  const key = '"ytInitialPlayerResponse"';
  const k = html.indexOf(key);
  if (k !== -1) {
    const brace = html.indexOf("{", k + key.length);
    if (brace !== -1) {
      const parsed = parseJsonObjectFrom(html, brace);
      if (parsed) return parsed;
    }
  }
  return null;
}

export function captionTracksFromPlayer(data) {
  const list =
    data?.captions?.playerCaptionsTracklistRenderer?.captionTracks ||
    data?.captions?.playerCaptionsRenderer?.captionTracks ||
    [];
  return Array.isArray(list) ? list : [];
}

/** Unique tracks in fetch order: Korean manual → Korean ASR → other manual → rest. */
export function orderedCaptionTracks(tracks) {
  if (!Array.isArray(tracks) || !tracks.length) return [];
  const isAsr = (t) => String(t.kind || "").includes("asr");
  const isKo = (t) =>
    t.languageCode === "ko" || String(t.languageCode || "").startsWith("ko");
  const seen = new Set();
  const out = [];
  const addGroup = (pred) => {
    for (const t of tracks) {
      if (!t?.baseUrl || seen.has(t.baseUrl)) continue;
      if (!pred(t)) continue;
      seen.add(t.baseUrl);
      out.push(t);
    }
  };
  addGroup((t) => isKo(t) && !isAsr(t));
  addGroup((t) => isKo(t) && isAsr(t));
  addGroup((t) => !isKo(t) && !isAsr(t));
  addGroup(() => true);
  return out;
}

export function parseVttToPlain(vtt) {
  const lines = vtt.split(/\r?\n/);
  const out = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line === "WEBVTT") continue;
    if (line.startsWith("NOTE")) continue;
    if (line.startsWith("Kind:") || line.startsWith("Language:")) continue;
    if (/^\d{2}:/.test(line) && line.includes("-->")) continue;
    if (/^\d+$/.test(line)) continue;
    out.push(line);
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

function appendFmt(baseUrl, fmt) {
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}fmt=${fmt}`;
}

/** Parse one timedtext response body (after HTTP fetch). */
export function parseCaptionBodyFromResponse(fmt, text) {
  if (fmt === "json3") {
    try {
      const j = JSON.parse(text);
      const parts = [];
      for (const ev of j.events || []) {
        if (!ev.segs) continue;
        for (const s of ev.segs) {
          if (s.utf8) parts.push(s.utf8);
        }
      }
      const joined = parts.join(" ").replace(/\s+/g, " ").trim();
      return joined.length ? joined : null;
    } catch {
      return null;
    }
  }
  if (fmt === "srv3") {
    const stripped = text
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return stripped.length > 40 ? stripped : null;
  }
  if (fmt === "vtt") {
    const plain = parseVttToPlain(text);
    return plain.length > 40 ? plain : null;
  }
  return null;
}

/** One GET for smoke tests: status, sizes, short previews. */
export async function probeCaptionFormat(baseUrl, fmt, videoId = null) {
  const headers = timedtextFetchHeaders(videoId);
  const url = appendFmt(baseUrl, fmt);
  const res = await fetch(url, { headers });
  const text = await res.text();
  const parsed = parseCaptionBodyFromResponse(fmt, text);
  return {
    fmt,
    status: res.status,
    bodyLen: text.length,
    parsedLen: parsed?.length ?? 0,
    bodyPreview: text.replace(/\s+/g, " ").slice(0, 140),
    textPreview: parsed?.slice(0, 120) ?? null,
  };
}

/**
 * Pull plain text from timedtext: json3 → srv3 → vtt with browser-like headers.
 */
export async function fetchCaptionPlainText(baseUrl, videoId = null) {
  const fmts = ["json3", "srv3", "vtt"];
  const headers = timedtextFetchHeaders(videoId);
  for (const fmt of fmts) {
    const url = appendFmt(baseUrl, fmt);
    let res;
    let text = "";
    try {
      res = await fetch(url, { headers });
      const ab = await res.arrayBuffer();
      text = new TextDecoder("utf-8").decode(ab);
    } catch {
      continue;
    }
    if (!res.ok) continue;
    const parsed = parseCaptionBodyFromResponse(fmt, text);
    if (parsed) return { format: fmt, text: parsed };
  }
  return null;
}

/**
 * Innertube player: alternate caption baseUrls (TVHTML5 / ANDROID / WEB) when web embed URLs fail.
 */
export async function fetchInnertubePlayerCaptionTracks(videoId, pageHtml, client) {
  const { clientName, clientVersion, androidSdkVersion } = client;
  const key =
    pageHtml.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1] ||
    pageHtml.match(/INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  if (!key) return null;

  const clientCtx = { clientName, clientVersion, hl: "en", gl: "US" };
  if (androidSdkVersion != null) clientCtx.androidSdkVersion = androidSdkVersion;
  const visitorData =
    pageHtml.match(/"visitorData":"([^"]+)"/)?.[1] ||
    pageHtml.match(/visitorData":"([^"]+)"/)?.[1];
  const body = {
    context: {
      client: clientCtx,
      ...(visitorData ? { request: { visitorData } } : {}),
      thirdParty: {
        embedUrl: `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`,
      },
    },
    videoId,
    contentCheckOk: true,
    racyCheckOk: true,
  };

  function innertubePlayerPayloadOk(parsed) {
    return Boolean(parsed && !parsed.error && (parsed.videoDetails || parsed.playabilityStatus));
  }

  let res;
  let j;
  try {
    const purl = `https://www.youtube.com/youtubei/v1/player?key=${encodeURIComponent(key)}`;
    res = await fetch(purl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": WATCH_UA,
        Referer: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    j = null;
    try {
      j = JSON.parse(raw);
    } catch {
      j = null;
    }
    if (!res.ok || !innertubePlayerPayloadOk(j)) return null;
  } catch {
    return null;
  }

  const tracks = captionTracksFromPlayer(j);
  return tracks.length ? tracks : null;
}

/** Serialized param from watch HTML (engagement panel transcript). */
export function extractGetTranscriptParams(pageHtml) {
  const m = pageHtml.match(/getTranscriptEndpoint":\{"params":"([^"]+)"/);
  return m?.[1] ?? null;
}

function collectTranscriptSegmentTexts(node, parts) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const x of node) collectTranscriptSegmentTexts(x, parts);
    return;
  }
  const tr = node.transcriptSegmentRenderer;
  if (tr) {
    const runs = tr.snippet?.runs;
    const t = Array.isArray(runs)
      ? runs.map((r) => r.text || "").join("")
      : tr.snippet?.simpleText || "";
    if (t) parts.push(t);
  }
  for (const k of Object.keys(node)) collectTranscriptSegmentTexts(node[k], parts);
}

/**
 * youtubei/v1/get_transcript — uses params + client version from the same watch HTML
 * (works when timedtext GET returns empty on some networks).
 */
export async function fetchTranscriptViaGetTranscript(videoId, pageHtml) {
  const params = extractGetTranscriptParams(pageHtml);
  if (!params) return null;
  const key =
    pageHtml.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1] ||
    pageHtml.match(/INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  if (!key) return null;
  const visitorData =
    pageHtml.match(/"visitorData":"([^"]+)"/)?.[1] ||
    pageHtml.match(/visitorData":"([^"]+)"/)?.[1] ||
    undefined;
  const clientVersion =
    pageHtml.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1] || "2.20241202.01.00";
  const hl = pageHtml.match(/"INNERTUBE_CONTEXT_HL":"([^"]+)"/)?.[1] || "en";
  const gl = pageHtml.match(/"INNERTUBE_CONTEXT_GL":"([^"]+)"/)?.[1] || "US";
  const body = {
    context: {
      client: { clientName: "WEB", clientVersion, hl, gl },
      ...(visitorData ? { request: { visitorData } } : {}),
      thirdParty: {
        embedUrl: `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`,
      },
    },
    params,
    contentCheckOk: true,
    racyCheckOk: true,
  };
  const url = `https://www.youtube.com/youtubei/v1/get_transcript?key=${encodeURIComponent(key)}`;
  let res;
  let raw;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": WATCH_UA,
        Referer: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
      },
      body: JSON.stringify(body),
    });
    raw = await res.text();
  } catch {
    return null;
  }
  let j;
  try {
    j = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!res.ok || j?.error) return null;
  const parts = [];
  collectTranscriptSegmentTexts(j, parts);
  const text = parts.join(" ").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return { format: "get_transcript", text };
}

export const INNERTUBE_PLAYER_CLIENTS = [
  { clientName: "TVHTML5_SIMPLY", clientVersion: "2.0" },
  { clientName: "ANDROID", clientVersion: "19.08.35", androidSdkVersion: 30 },
  { clientName: "WEB", clientVersion: "2.20241202.01.00" },
];

export async function fetchWatchPageHtml(videoId) {
  const url = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": WATCH_UA,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ko-KR,ko;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`watch page ${res.status}`);
  return res.text();
}
