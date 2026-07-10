/**
 * Collect Korean-learning vocab pin candidates from Pinterest (no API key).
 * - DuckDuckGo site search → pin IDs
 * - Public board pages → pin grid from __PWS_INITIAL_PROPS__
 */
import { execFileSync } from "node:child_process";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

/** Boards that reliably expose pin grids without login. */
export const KOREAN_PINTEREST_BOARDS = [
  "koreanclass101/korean-vocabulary",
  "koreanclass101/learn-korean",
  "talktomeinkorean/korean-language-learning",
  "eggbuneducation/korean-language",
  "koreanlanguageguide/korean-vocabulary",
  "hangulove/korean-words",
  "sejonghangeul/korean-lesson",
];

export const DEFAULT_PINTEREST_QUERIES = [
  "korean",
  "korean vocabulary",
  "learn korean",
  "korean words",
  "korean phrases",
  "hangul",
  "korean slang",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function curlText(url) {
  return execFileSync("curl", ["-sL", "-A", UA, url], {
    encoding: "utf8",
    maxBuffer: 24 * 1024 * 1024,
  });
}

function walkPinsFromJson(node, out, depth = 0) {
  if (!node || typeof node !== "object" || depth > 14) return;
  if (
    typeof node.id === "string" &&
    /^\d{10,}$/.test(node.id) &&
    node.images?.orig?.url
  ) {
    out.push({
      pinId: node.id,
      imageUrl: node.images.orig.url,
      title: String(node.grid_title || node.title || node.description || "").trim(),
      link: node.link || `https://www.pinterest.com/pin/${node.id}/`,
      board: node.board?.name || node.pinner?.username || "",
    });
  }
  if (Array.isArray(node)) {
    for (const item of node) walkPinsFromJson(item, out, depth + 1);
    return;
  }
  for (const value of Object.values(node)) walkPinsFromJson(value, out, depth + 1);
}

export function parseBoardPins(boardPath) {
  const path = boardPath.replace(/^\/+/, "").replace(/\/+$/, "");
  const html = curlText(`https://www.pinterest.com/${path}/`);
  const match = html.match(/<script id="__PWS_INITIAL_PROPS__"[^>]*>([^<]+)<\/script>/);
  if (!match) return [];

  const pins = [];
  try {
    walkPinsFromJson(JSON.parse(match[1]), pins);
  } catch {
    return [];
  }

  const pinLinks = [
    ...new Set([...html.matchAll(/"\/pin\/(\d{10,})\//g)].map((m) => m[1])),
  ];
  const byId = new Map(pins.map((p) => [p.pinId, p]));

  for (const pinId of pinLinks) {
    if (!byId.has(pinId)) {
      byId.set(pinId, {
        pinId,
        imageUrl: "",
        title: "",
        link: `https://www.pinterest.com/pin/${pinId}/`,
        board: path.split("/")[0] || "",
      });
    }
  }

  return [...byId.values()];
}

export function parsePinPage(pinId) {
  const html = curlText(`https://www.pinterest.com/pin/${pinId}/`);
  const pins = [];
  const match = html.match(/<script id="__PWS_INITIAL_PROPS__"[^>]*>([^<]+)<\/script>/);
  if (match) {
    try {
      walkPinsFromJson(JSON.parse(match[1]), pins);
    } catch {
      /* fall through */
    }
  }

  const fromWalk = pins.find((p) => p.pinId === pinId) || pins[0];
  let imageUrl = fromWalk?.imageUrl || "";
  if (!imageUrl) {
    const originals = [
      ...html.matchAll(/https:\/\/i\.pinimg\.com\/originals\/[a-z0-9/_.-]+\.(?:jpg|jpeg|png|webp)/gi),
    ].map((m) => m[0]);
    imageUrl = originals[0] || "";
  }
  if (!imageUrl) {
    const large = [
      ...html.matchAll(/https:\/\/i\.pinimg\.com\/736x\/[a-z0-9/_.-]+\.(?:jpg|jpeg|png|webp)/gi),
    ].map((m) => m[0]);
    imageUrl = large[0] || "";
  }

  const titleMatch =
    html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i) ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
  const descMatch =
    html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i) ||
    html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:description"/i);

  return {
    pinId,
    imageUrl,
    title: String(fromWalk?.title || titleMatch?.[1] || "").trim(),
    description: String(descMatch?.[1] || "").trim(),
    link: `https://www.pinterest.com/pin/${pinId}/`,
  };
}

async function discoverPinIdsFromDdg(query, limit = 30) {
  const queries = [
    `site:pinterest.com/pin ${query}`,
    `site:pinterest.com ${query} korean vocabulary`,
  ];
  const ids = new Set();
  for (const ddgQ of queries) {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(ddgQ)}`;
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    const html = await res.text();
    for (const m of html.matchAll(/pinterest\.com\/pin\/(\d{10,})/g)) ids.add(m[1]);
    if (ids.size >= limit) break;
    await sleep(300);
  }
  return [...ids].slice(0, limit);
}

async function discoverBoardsFromDdg(query, limit = 10) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:pinterest.com korean ${query} board`)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const paths = new Set();
  for (const m of html.matchAll(/pinterest\.com\/([a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+)\//g)) {
    const p = m[1];
    if (!p.includes("pin") && !p.startsWith("search/")) paths.add(p);
  }
  return [...paths].slice(0, limit);
}

export function toVocabPost(pin, query = "") {
  const pinId = pin.pinId;
  const code = `pin_${pinId}`;
  return {
    source: "pinterest",
    profile: pin.board || "pinterest",
    code,
    pinId,
    likes: 0,
    isVideo: false,
    url: pin.imageUrl,
    caption: [pin.title, pin.description, query ? `search: ${query}` : ""]
      .filter(Boolean)
      .join(" · ")
      .slice(0, 300),
    permalink: pin.link || `https://www.pinterest.com/pin/${pinId}/`,
    searchQuery: query || undefined,
  };
}

/**
 * @param {{ queries?: string[], boards?: string[], limit?: number, delayMs?: number }} opts
 */
export async function collectPinterestVocabCandidates(opts = {}) {
  const queries = opts.queries?.length ? opts.queries : DEFAULT_PINTEREST_QUERIES;
  const boards = opts.boards?.length ? opts.boards : KOREAN_PINTEREST_BOARDS;
  const limit = Math.max(1, opts.limit ?? 40);
  const delayMs = opts.delayMs ?? 400;

  const byPinId = new Map();

  for (const query of queries) {
    const ids = await discoverPinIdsFromDdg(query, 25);
    console.log(`  [pinterest] ddg "${query}" → ${ids.length} pin ids`);
    for (const pinId of ids) {
      if (!byPinId.has(pinId)) {
        byPinId.set(pinId, { pinId, query, imageUrl: "", title: "" });
      }
    }
    const extraBoards = await discoverBoardsFromDdg(query, 5);
    for (const boardPath of extraBoards) {
      if (!boards.includes(boardPath)) boards.push(boardPath);
    }
    await sleep(delayMs);
  }

  for (const boardPath of boards) {
    try {
      const pins = parseBoardPins(boardPath);
      console.log(`  [pinterest] board ${boardPath} → ${pins.length} pins`);
      for (const pin of pins) {
        const existing = byPinId.get(pin.pinId);
        byPinId.set(pin.pinId, {
          pinId: pin.pinId,
          query: existing?.query || "",
          imageUrl: pin.imageUrl || existing?.imageUrl || "",
          title: pin.title || existing?.title || "",
          board: pin.board || boardPath.split("/")[0],
          link: pin.link,
        });
      }
      await sleep(delayMs);
    } catch (e) {
      console.warn(`  [pinterest] board skip ${boardPath}: ${e.message}`);
    }
  }

  const posts = [];
  for (const pin of byPinId.values()) {
    if (posts.length >= limit) break;
    try {
      let resolved = pin;
      if (!pin.imageUrl) {
        const page = parsePinPage(pin.pinId);
        resolved = { ...pin, ...page, board: pin.board || "" };
      }
      if (!resolved.imageUrl) continue;
      posts.push(toVocabPost(resolved, pin.query));
      await sleep(delayMs);
    } catch (e) {
      console.warn(`  [pinterest] pin skip ${pin.pinId}: ${e.message}`);
    }
  }

  return posts;
}
