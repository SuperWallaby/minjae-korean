#!/usr/bin/env node
/**
 * Bulk-edit Website destination on already-uploaded vocab pins (Plantweb Chrome).
 *
 * Policy (2026-08): ~25% Preply/italki direct on pin; rest → kajakorean.com /vocab.
 *   --affiliate-rate 0.1 (default)
 *   --site-only  → force 100% site (affiliate-rate ignored)
 *
 * Match strategy:
 *   1) ledger pin_id
 *   2) board / _created crawl → match unique alt (preferred) or unique title
 *
 *   node scripts/edit-pinned-vocab-destinations.mjs --dry-run --limit 5
 *   node scripts/edit-pinned-vocab-destinations.mjs --limit 50
 *   node scripts/edit-pinned-vocab-destinations.mjs --site-only
 *   node scripts/edit-pinned-vocab-destinations.mjs --force
 */
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const AVK_PIN_DIR = path.resolve(
  ROOT,
  "../projects/neo-project/auto-video-korean/scripts/pinterest-browser",
);
const require = createRequire(path.join(AVK_PIN_DIR, "package.json"));
const puppeteer = require("puppeteer-core");

const OUT = path.join(ROOT, ".tmp/vocab-infographic-gen");
const PINNED_PATH = path.join(OUT, "pinterest-pinned.json");
const PUBLISHED_PATH = path.join(
  ROOT,
  "src/data/vocabInfographic/published.json",
);
const STATE_PATH = path.join(OUT, "pin-link-edit-state.json");
const LOG_DIR = path.join(OUT, "logs");

const PREPLY =
  process.env.PINTEREST_AFFILIATE_PREPLY ||
  "https://preply.sjv.io/c/7574725/1987575/24422";
const ITALKI =
  process.env.PINTEREST_AFFILIATE_ITALKI ||
  "https://www.italki.com/en/affshare?ref=af33117569";
const SITE =
  process.env.PINTEREST_SITE_LINK || "https://kajakorean.com";

const { values: args } = parseArgs({
  options: {
    "browser-url": {
      type: "string",
      default: process.env.CHROME_WORK_DEBUG_URL || "http://127.0.0.1:9222",
    },
    limit: { type: "string", default: "0" },
    /** Fraction of edits that stay Preply/italki on the pin (default 0.1). */
    "affiliate-rate": {
      type: "string",
      default: process.env.PINTEREST_AFFILIATE_RATE || "0.1",
    },
    "site-only": { type: "boolean", default: false },
    delay: { type: "string", default: "6" },
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    "index-only": { type: "boolean", default: false },
    "board-url": {
      type: "string",
      default: "https://www.pinterest.com/kajakorean/korean-words/",
    },
    "created-url": {
      type: "string",
      default: "https://www.pinterest.com/kajakorean/_created/",
    },
    "scroll-rounds": { type: "string", default: "80" },
    timeout: { type: "string", default: "120000" },
    "skip-index": { type: "boolean", default: false },
    "only-with-id": { type: "boolean", default: false },
    /** Only rewrite pins whose current link is homepage (not /vocab, not affiliate). */
    "homepage-only": { type: "boolean", default: false },
  },
});

const browserURL = String(args["browser-url"] || "").trim();
const limit = Math.max(0, Number(args.limit) || 0);
const siteOnly = Boolean(args["site-only"]);
const affiliateRate = siteOnly
  ? 0
  : Math.min(
      1,
      Math.max(0, Number(args["affiliate-rate"] ?? 0.1) || 0),
    );
const delaySec = Math.max(2, Number(args.delay) || 6);
const dryRun = Boolean(args["dry-run"]);
const force = Boolean(args.force);
const indexOnly = Boolean(args["index-only"]);
const boardUrl = String(args["board-url"] || "").trim();
const createdUrl = String(args["created-url"] || "").trim();
const scrollRounds = Math.max(10, Number(args["scroll-rounds"]) || 80);
const timeoutMs = Math.max(30_000, Number(args.timeout) || 120_000);
const skipIndex = Boolean(args["skip-index"]);
const onlyWithId = Boolean(args["only-with-id"]);
const homepageOnly = Boolean(args["homepage-only"]);
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadJson(file, fallback) {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJson(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip shared marketing wrappers so board alt ≈ ledger title. */
function coreKey(s) {
  let t = norm(s);
  t = t
    .replace(/\bkorean vocabulary infographic\b:?/g, " ")
    .replace(/\bkorean vocab(?:ulary)? chart\b/g, " ")
    .replace(/\blearn (?:the )?(?:these )?/g, " ")
    .replace(/\bhow to say\b/g, " ")
    .replace(/\bin korean\b/g, " ")
    .replace(/\bkorean\b/g, " ")
    .replace(/\bvocab(?:ulary)?\b/g, " ")
    .replace(/\binfographic\b/g, " ")
    .replace(/\bchart\b/g, " ")
    .replace(/\bpinterest\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t;
}

const STOP = new Set([
  "a",
  "an",
  "the",
  "to",
  "of",
  "and",
  "or",
  "for",
  "in",
  "on",
  "with",
  "your",
  "you",
  "this",
  "that",
  "these",
  "those",
  "how",
  "what",
  "which",
  "when",
  "vs",
  "is",
  "are",
  "be",
  "do",
  "does",
  "can",
  "need",
  "want",
  "lets",
  "let",
  "learn",
  "practice",
  "start",
  "check",
  "out",
  "about",
  "more",
  "from",
  "into",
  "use",
  "using",
  "say",
  "word",
  "words",
  "means",
  "mean",
  "common",
  "basic",
  "handy",
  "useful",
  "everyday",
  "daily",
]);

function tokens(s) {
  return coreKey(s)
    .split(" ")
    .filter((w) => w.length >= 2 && !STOP.has(w));
}

function jaccard(a, b) {
  if (!a.length || !b.length) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  return inter / (A.size + B.size - inter);
}

function tokenOverlapScore(queryParts, pinText) {
  const pt = tokens(pinText);
  if (!pt.length) return 0;
  let best = 0;
  for (const q of queryParts) {
    const qt = tokens(q);
    if (!qt.length) continue;
    const jac = jaccard(qt, pt);
    // inclusion: most query tokens appear in pin
    const setP = new Set(pt);
    const hit = qt.filter((t) => setP.has(t)).length;
    const cover = hit / qt.length;
    const c = coreKey(q);
    const blob = coreKey(pinText);
    let sub = 0;
    if (c.length >= 8 && blob.includes(c)) sub = 0.95;
    else if (c.length >= 8 && c.includes(blob) && blob.length >= 8) sub = 0.9;
    best = Math.max(best, jac, cover * 0.85 + jac * 0.15, sub);
  }
  return best;
}

function withUtm(url, campaign) {
  try {
    const u = new URL(url);
    if (!u.searchParams.get("utm_source"))
      u.searchParams.set("utm_source", "pinterest");
    if (!u.searchParams.get("utm_medium"))
      u.searchParams.set("utm_medium", "pin");
    if (!u.searchParams.get("utm_campaign"))
      u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

function pickAffiliate() {
  const usePreply = Math.random() < 0.5;
  const raw = usePreply ? PREPLY : ITALKI;
  return {
    url: withUtm(raw, usePreply ? "aff-preply-edit" : "aff-italki-edit"),
    destination: usePreply ? "affiliate_preply" : "affiliate_italki",
  };
}

function seoUrl(bundleId, slug) {
  const base = SITE.replace(/\/+$/, "");
  return withUtm(
    `${base}/vocab/${encodeURIComponent(bundleId)}/${encodeURIComponent(slug)}`,
    "vocab-pin-edit",
  );
}

function resolveDestination(bundleId, page) {
  if (!siteOnly && affiliateRate > 0 && Math.random() < affiliateRate) {
    return pickAffiliate();
  }
  return {
    url: seoUrl(bundleId, page.slug),
    destination: "site_seo",
  };
}

function isAffiliateLink(link) {
  const s = String(link || "");
  return (
    /italki\.com\/en\/affshare/i.test(s) ||
    /preply\.sjv\.io/i.test(s) ||
    /preply\.com\//i.test(s)
  );
}

function isSiteSeoLink(link) {
  const s = String(link || "");
  return /kajakorean\.com\/vocab\//i.test(s) || /\/vocab\//i.test(s);
}

function isHomepageLink(link) {
  const s = String(link || "").trim();
  if (!s) return false;
  if (isSiteSeoLink(s) || isAffiliateLink(s)) return false;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "kajakorean.com") return false;
    return u.pathname === "/" || u.pathname === "";
  } catch {
    return /^https?:\/\/(www\.)?kajakorean\.com\/?(\?|$)/i.test(s);
  }
}

/** Site-only: link must be SEO. Mixed: site is final; affiliates still need a 25/75 roll unless already ok. */
function alreadyLooksDesired(link) {
  if (siteOnly || affiliateRate <= 0) {
    return isSiteSeoLink(link) && !isAffiliateLink(link);
  }
  // Mixed rate: pure site pages are done; affiliates re-entered unless state ok.
  return isSiteSeoLink(link) && !isAffiliateLink(link);
}

function buildQueue(pinned, publishedById, state) {
  const rows = [];
  for (const [bundleId, meta] of Object.entries(pinned)) {
    const page = publishedById.get(bundleId);
    if (!page?.slug) continue;
    const st = state[bundleId];
    const link = String(meta?.link || st?.link || "");

    if (siteOnly || affiliateRate <= 0) {
      // Force every pin toward site SEO.
      if (!force && alreadyLooksDesired(link) && st?.status === "ok") continue;
      if (!force && alreadyLooksDesired(link) && !isAffiliateLink(link) && !st) {
        continue;
      }
      if (!force && alreadyLooksDesired(link) && !isAffiliateLink(link)) continue;
    } else {
      // Leave SEO pins alone; re-roll unfinished affiliate pins (keep ~rate as aff).
      if (!force && alreadyLooksDesired(link)) continue;
      if (!force && st?.status === "ok") continue;
    }

    if (homepageOnly && !isHomepageLink(link)) continue;

    rows.push({
      bundleId,
      meta,
      page,
      pinId: String(meta?.pin_id || st?.pin_id || "").trim(),
      title: String(meta?.title || page.titleEn || "").trim(),
      alt: String(meta?.alt || "").trim(),
      link,
    });
  }
  rows.sort((a, b) => {
    const aHome = isHomepageLink(a.link) ? 0 : 1;
    const bHome = isHomepageLink(b.link) ? 0 : 1;
    if (aHome !== bHome) return aHome - bHome;
    if (a.pinId && !b.pinId) return -1;
    if (!a.pinId && b.pinId) return 1;
    return a.bundleId.localeCompare(b.bundleId);
  });
  return rows;
}

/** After board crawl: overwrite stale ledger links from live pin.link so homepage pins re-enter the queue. */
function syncLedgerLinksFromIndex(pinned, indexPins) {
  const byId = new Map(indexPins.map((p) => [String(p.pinId), p]));
  let synced = 0;
  for (const meta of Object.values(pinned)) {
    const pinId = String(meta?.pin_id || "").trim();
    if (!pinId) continue;
    const live = byId.get(pinId);
    if (!live?.link) continue;
    const prev = String(meta.link || "");
    if (prev === live.link) continue;
    meta.link = live.link;
    synced += 1;
  }
  return synced;
}

function mergePinRecord(prev, next) {
  if (!prev) return { ...next };
  return {
    pinId: next.pinId || prev.pinId,
    title: (next.title && next.title.length > (prev.title || "").length
      ? next.title
      : prev.title) || "",
    alt: (next.alt && next.alt.length > (prev.alt || "").length
      ? next.alt
      : prev.alt) || "",
    description: next.description || prev.description || "",
    link: next.link || prev.link || "",
    href: next.href || prev.href || "",
    gridTitle: next.gridTitle || prev.gridTitle || "",
  };
}

function walkJsonForPins(node, out) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const x of node) walkJsonForPins(x, out);
    return;
  }
  const id =
    node.id ||
    node.pin_id ||
    node.pinId ||
    (typeof node.entityId === "string" && node.entityId.match(/^\d{10,}$/)
      ? node.entityId
      : null);
  const type = String(node.type || node.__typename || "").toLowerCase();
  const looksPin =
    type === "pin" ||
    (id &&
      /^\d{10,}$/.test(String(id)) &&
      (node.grid_title ||
        node.title ||
        node.description ||
        node.auto_alt_text ||
        node.alt_text ||
        node.link));
  if (looksPin && id && /^\d{10,}$/.test(String(id))) {
    out.push({
      pinId: String(id),
      title: String(
        node.grid_title || node.title || node.closeup_unified_title || "",
      ).trim(),
      alt: String(
        node.auto_alt_text || node.alt_text || node.grid_title || "",
      ).trim(),
      description: String(node.description || "").trim().slice(0, 400),
      link: String(node.link || node.dominant_link || "").trim(),
      href: "",
      gridTitle: String(node.grid_title || "").trim(),
    });
  }
  for (const v of Object.values(node)) walkJsonForPins(v, out);
}

async function collectPinIndex(page, startUrl, maxRounds) {
  const seen = new Map(); // pinId -> record

  const onResponse = async (res) => {
    try {
      const url = res.url();
      if (!/pinterest\.com\/resource\//i.test(url) && !/\/v3\//i.test(url))
        return;
      const ct = (res.headers()["content-type"] || "").toLowerCase();
      if (!ct.includes("json") && !ct.includes("javascript")) return;
      const text = await res.text();
      if (!text || text.length < 20 || text.length > 8_000_000) return;
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return;
      }
      const found = [];
      walkJsonForPins(data, found);
      for (const p of found) {
        seen.set(p.pinId, mergePinRecord(seen.get(p.pinId), p));
      }
    } catch {
      /* ignore body parse errors */
    }
  };
  page.on("response", onResponse);

  await page.goto(startUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3200);
  for (let round = 0; round < maxRounds; round++) {
    const batch = await page.evaluate(() => {
      const out = [];
      for (const a of document.querySelectorAll('a[href*="/pin/"]')) {
        const href = a.getAttribute("href") || a.href || "";
        const m = href.match(/\/pin\/(\d{10,})/);
        if (!m) continue;
        const pinId = m[1];
        const img = a.querySelector("img");
        const alt = (img?.alt || "").trim();
        let title = "";
        const card =
          a.closest('[data-test-id="pin"]') ||
          a.closest('[data-test-id="pinWrapper"]') ||
          a.parentElement?.parentElement;
        if (card) {
          const h = card.querySelector(
            'div[title], span[title], [data-test-id="pinrep-title"], h2, h3',
          );
          title = (
            h?.getAttribute("title") ||
            h?.textContent ||
            ""
          )
            .trim()
            .split("\n")[0]
            .trim();
        }
        if (!title) {
          title = (
            a.getAttribute("aria-label") ||
            a.getAttribute("title") ||
            alt ||
            a.innerText ||
            ""
          )
            .trim()
            .split("\n")[0]
            .trim();
        }
        title = title.replace(/\s+[-–—]\s*pin\b.*/i, "").trim();
        out.push({ pinId, title, alt, href: a.href || href });
      }
      return out;
    });
    let added = 0;
    for (const p of batch) {
      const before = seen.has(p.pinId);
      seen.set(p.pinId, mergePinRecord(seen.get(p.pinId), p));
      if (!before) added += 1;
    }
    await page.evaluate(() =>
      window.scrollBy(0, Math.floor(window.innerHeight * 1.6)),
    );
    await sleep(1000 + Math.floor(Math.random() * 500));
    if (round % 15 === 0) {
      console.error(
        `  index ${startUrl.includes("_created") ? "created" : "board"} round=${round} pins=${seen.size}`,
      );
    }
    // Early stop if board well covered and last chunks empty
    if (round > 40 && added === 0 && seen.size >= 500) {
      let empty = true;
      for (let k = 0; k < 3; k++) {
        await page.evaluate(() =>
          window.scrollBy(0, Math.floor(window.innerHeight * 1.8)),
        );
        await sleep(1200);
        const n = await page.evaluate(
          () => document.querySelectorAll('a[href*="/pin/"]').length,
        );
        if (n > 0) empty = false;
      }
      if (empty) break;
    }
  }
  page.off("response", onResponse);
  return [...seen.values()];
}

function attachPinIds(queue, indexPins) {
  const usedPinIds = new Set(
    queue.filter((r) => r.pinId).map((r) => r.pinId),
  );

  // Exact core keys
  const byCore = new Map();
  for (const p of indexPins) {
    for (const field of [p.alt, p.title, p.gridTitle, p.description]) {
      const c = coreKey(field || "");
      if (c.length < 6) continue;
      if (!byCore.has(c)) byCore.set(c, []);
      byCore.get(c).push(p);
    }
    // Destination already SEO?
    if (/kajakorean\.com\/vocab\//i.test(p.link || "")) {
      const m = String(p.link).match(/\/vocab\/([^/?#]+)/i);
      if (m) {
        const bid = decodeURIComponent(m[1]);
        p._bundleFromLink = bid;
      }
    }
  }

  let matched = 0;
  let fromLink = 0;
  let fromScore = 0;

  for (const row of queue) {
    if (row.pinId) {
      matched += 1;
      usedPinIds.add(row.pinId);
      continue;
    }

    let hit = null;
    let via = "";

    // 1) Board pin already points at this SEO page
    const linkHits = indexPins.filter(
      (p) =>
        p._bundleFromLink === row.bundleId ||
        (p.link &&
          p.link.includes(`/vocab/${row.bundleId}/`)),
    );
    if (linkHits.length === 1) {
      hit = linkHits[0];
      via = "seo_link";
      fromLink += 1;
    }

    // 2) Exact core title/alt
    if (!hit) {
      for (const field of [row.alt, row.title, row.page?.titleEn, row.page?.slug]) {
        const c = coreKey(
          field && String(field).includes("-") && !String(field).includes(" ")
            ? String(field).replace(/-/g, " ")
            : field,
        );
        if (c.length < 6) continue;
        const arr = (byCore.get(c) || []).filter((p) => !usedPinIds.has(p.pinId));
        const uniq = [...new Map(arr.map((p) => [p.pinId, p])).values()];
        if (uniq.length === 1) {
          hit = uniq[0];
          via = "core_exact";
          break;
        }
      }
    }

    // 3) Fuzzy score against unused pins
    if (!hit) {
      const queryParts = [
        row.title,
        row.alt,
        row.page?.titleEn,
        row.page?.slug?.replace(/-/g, " "),
        row.bundleId
          .replace(/^(grid|list|ant|quiz|sim|phrase|topik|cws)-/i, "")
          .replace(/-/g, " "),
      ].filter(Boolean);

      const scored = [];
      for (const p of indexPins) {
        if (usedPinIds.has(p.pinId)) continue;
        const pinText = [p.alt, p.title, p.gridTitle, p.description]
          .filter(Boolean)
          .join(" · ");
        if (!pinText.trim()) continue;
        const score = tokenOverlapScore(queryParts, pinText);
        if (score >= 0.55) scored.push({ p, score });
      }
      scored.sort((a, b) => b.score - a.score);
      if (
        scored.length &&
        scored[0].score >= 0.62 &&
        (!scored[1] || scored[0].score - scored[1].score >= 0.08)
      ) {
        hit = scored[0].p;
        via = `fuzzy:${scored[0].score.toFixed(2)}`;
        fromScore += 1;
      }
    }

    if (hit && !usedPinIds.has(hit.pinId)) {
      row.pinId = hit.pinId;
      row.matchVia = via;
      usedPinIds.add(hit.pinId);
      matched += 1;
    }
  }
  console.error(
    `  attach breakdown total=${matched} link=${fromLink} fuzzy≈${fromScore} (rest exact/pre-id)`,
  );
  return matched;
}

async function openEditUi(page, pinId) {
  await page.goto(`https://www.pinterest.com/pin/${pinId}/`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await sleep(2800);
  await page.keyboard.press("Escape");
  await sleep(500);

  // Prefer owner edit entry if present
  for (let attempt = 0; attempt < 3; attempt++) {
    const opened = await page.evaluate(() => {
      const all = [...document.querySelectorAll("button,[role=button],a")];
      const labeled = (el) =>
        (
          el.getAttribute("aria-label") ||
          el.getAttribute("title") ||
          el.innerText ||
          ""
        )
          .trim()
          .toLowerCase();
      // direct edit control (rare)
      const direct = all.find((el) => {
        const t = labeled(el);
        return (
          t === "edit pin" ||
          t === "edit this pin" ||
          t === "edit" ||
          t === "핀 수정"
        );
      });
      if (direct) {
        direct.click();
        return "direct";
      }
      const pinMore = all.find(
        (el) =>
          (el.getAttribute("aria-label") || "") === "More options" ||
          ((el.getAttribute("aria-label") || "") === "More actions" &&
            !el.closest('[data-test-id="scroll-pin-to-top-to-feed-on-tap"]')),
      );
      const btn =
        pinMore ||
        all.find((el) => {
          const a = el.getAttribute("aria-label") || "";
          return a === "More actions" || a === "More options";
        });
      if (!btn) return "";
      btn.click();
      return "menu";
    });
    if (opened === "direct") {
      await sleep(2200);
      return;
    }
    if (opened === "menu") {
      await sleep(1000);
      const clickedEdit = await page.evaluate(() => {
        const items = [
          ...document.querySelectorAll('[role="menuitem"]'),
          ...document.querySelectorAll("button,[role=button],a,div"),
        ];
        const edit = items.find((el) => {
          const t = (el.innerText || el.getAttribute("aria-label") || "")
            .trim()
            .toLowerCase();
          return (
            t === "edit pin" ||
            t === "edit this pin" ||
            t === "edit" ||
            t === "핀 수정" ||
            t === "수정"
          );
        });
        if (!edit) return false;
        edit.click();
        return true;
      });
      if (clickedEdit) {
        await sleep(2500);
        return;
      }
    }
    await sleep(1200 + attempt * 800);
  }
  throw new Error("More actions not found");
}

async function fillWebsiteAndSave(page, link) {
  // Wait for any link field
  await page
    .waitForFunction(
      () => {
        return Boolean(
          document.querySelector("#WebsiteField") ||
            [...document.querySelectorAll("textarea,input")].some((el) =>
              /^(pin-draft-link-|WebsiteField)/i.test(el.id || ""),
            ) ||
            document.querySelector('textarea[placeholder*="link" i]') ||
            document.querySelector('input[placeholder*="Website" i]') ||
            document.querySelector('textarea[aria-label*="Website" i]') ||
            document.querySelector('input[aria-label*="Website" i]'),
        );
      },
      { timeout: 20000 },
    )
    .catch(() => {});

  const filled = await page.evaluate((desired) => {
    const candidates = [
      document.querySelector("#WebsiteField"),
      ...document.querySelectorAll("textarea,input"),
    ].filter(Boolean);
    const el = candidates.find((node) => {
      const id = (node.id || "").toLowerCase();
      const ph = (node.getAttribute("placeholder") || "").toLowerCase();
      const aria = (node.getAttribute("aria-label") || "").toLowerCase();
      const name = (node.getAttribute("name") || "").toLowerCase();
      return (
        id.includes("website") ||
        id.includes("link") ||
        id.startsWith("pin-draft-link-") ||
        ph.includes("website") ||
        ph.includes("link") ||
        aria.includes("website") ||
        aria.includes("link") ||
        name.includes("link") ||
        name.includes("website")
      );
    });
    if (!el) return { ok: false, reason: "no website field" };
    el.focus();
    el.select?.();
    el.value = desired;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return { ok: true, value: el.value };
  }, link);

  // React controlled: also type via keyboard
  const website =
    (await page.$("#WebsiteField")) ||
    (await page.$('textarea[id^="pin-draft-link-"]'));
  if (website) {
    await website.click({ clickCount: 3 });
    await page.keyboard.down("Meta");
    await page.keyboard.press("a");
    await page.keyboard.up("Meta");
    await page.keyboard.press("Backspace");
    await sleep(80);
    await page.keyboard.type(link, { delay: 4 });
  } else if (!filled.ok) {
    throw new Error(filled.reason || "website field missing");
  }

  await sleep(400);
  const saved = await page.evaluate(() => {
    const nodes = [
      ...document.querySelectorAll("button,[role=button]"),
    ];
    const save = nodes.find((el) => {
      const t = (el.innerText || "").trim().toLowerCase();
      return (
        t === "save" ||
        t === "done" ||
        t === "publish" ||
        t === "저장" ||
        t === "완료" ||
        t === "업데이트"
      );
    });
    if (!save) return false;
    save.click();
    return true;
  });
  if (!saved) throw new Error("Save button not found");
  await sleep(2500);
  await page.keyboard.press("Escape").catch(() => {});
  await sleep(400);
}

async function editPinLink(page, pinId, link) {
  await openEditUi(page, pinId);
  await fillWebsiteAndSave(page, link);
}

async function main() {
  mkdirSync(LOG_DIR, { recursive: true });
  const pinned = loadJson(PINNED_PATH, {});
  const published = loadJson(PUBLISHED_PATH, { pages: [] });
  const publishedById = new Map(
    (published.pages || []).map((p) => [p.bundleId, p]),
  );
  const state = loadJson(STATE_PATH, {});

  let queue = buildQueue(pinned, publishedById, state);
  if (onlyWithId) queue = queue.filter((q) => q.pinId);
  if (limit > 0) queue = queue.slice(0, limit);

  console.log(
    `==> edit pinned destinations queue=${queue.length} affiliateRate=${affiliateRate} dryRun=${dryRun} force=${force}`,
  );
  console.log(
    `    with pin_id already=${queue.filter((q) => q.pinId).length}`,
  );

  if (!queue.length) {
    console.log("nothing to edit");
    return;
  }

  if (dryRun) {
    // Destination plan only — no browser needed.
    let site = 0;
    let aff = 0;
    for (let i = 0; i < queue.length; i++) {
      const row = queue[i];
      const dest = resolveDestination(row.bundleId, row.page);
      if (dest.destination === "site_seo") site += 1;
      else aff += 1;
      console.log(
        `→ [${i + 1}/${queue.length}] ${row.bundleId} pin=${row.pinId || "?"} → ${dest.destination}`,
      );
      console.log(`   link: ${dest.url}`);
    }
    console.log(
      `dry-run plan site=${site} affiliate=${aff} (with pin_id ${queue.filter((q) => q.pinId).length})`,
    );
    return;
  }

  const browser = await puppeteer.connect({
    browserURL,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(timeoutMs);

  try {
    // Index pins when many lack pin_id
    const needIndex = !skipIndex && queue.some((q) => !q.pinId);
    if (needIndex || indexOnly) {
      console.log("→ indexing board…");
      const boardPins = await collectPinIndex(page, boardUrl, scrollRounds);
      console.log(`  board pins indexed: ${boardPins.length}`);
      console.log("→ indexing created…");
      const createdPins = await collectPinIndex(
        page,
        createdUrl,
        Math.max(40, Math.floor(scrollRounds * 0.7)),
      );
      console.log(`  created pins indexed: ${createdPins.length}`);
      const merged = new Map();
      for (const p of [...boardPins, ...createdPins]) merged.set(p.pinId, p);
      const indexPins = [...merged.values()];
      // Persist index for offline matching / resume
      saveJson(path.join(OUT, "pin-board-index.json"), {
        at: new Date().toISOString(),
        count: indexPins.length,
        pins: indexPins,
      });
      const matched = attachPinIds(queue, indexPins);
      console.log(
        `  matched pin_ids: ${matched}/${queue.length} (index size ${indexPins.length})`,
      );
      // Persist any newly discovered pin ids
      for (const row of queue) {
        if (!row.pinId) continue;
        if (!pinned[row.bundleId]) continue;
        if (!pinned[row.bundleId].pin_id) {
          pinned[row.bundleId].pin_id = row.pinId;
        }
      }
      const synced = syncLedgerLinksFromIndex(pinned, indexPins);
      console.log(`  synced ledger links from index: ${synced}`);
      saveJson(PINNED_PATH, pinned);

      // Rebuild queue after sync so homepage-only / stale SEO ledger rows are correct
      queue = buildQueue(pinned, publishedById, state);
      if (onlyWithId) queue = queue.filter((q) => q.pinId);
      if (limit > 0) queue = queue.slice(0, limit);
      console.log(
        `  queue after sync=${queue.length} (homepage=${queue.filter((q) => isHomepageLink(q.link)).length})`,
      );

      if (indexOnly) {
        console.log("index-only: pin_ids + links saved to pinterest-pinned.json");
        return;
      }
    }

    let ok = 0;
    let skip = 0;
    let fail = 0;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logPath = path.join(LOG_DIR, `pin-link-edit-${stamp}.log`);
    const log = (line) => {
      console.log(line);
      writeFileSync(logPath, `${line}\n`, { flag: "a" });
    };

    for (let i = 0; i < queue.length; i++) {
      const row = queue[i];
      if (!row.pinId) {
        log(`→ [${i + 1}/${queue.length}] ${row.bundleId} SKIP no pin_id`);
        state[row.bundleId] = {
          status: "skipped_no_pin_id",
          at: new Date().toISOString(),
        };
        saveJson(STATE_PATH, state);
        skip += 1;
        continue;
      }

      const dest = resolveDestination(row.bundleId, row.page);
      log(
        `→ [${i + 1}/${queue.length}] ${row.bundleId} pin=${row.pinId} → ${dest.destination}`,
      );
      log(`   link: ${dest.url}`);

      if (dryRun) {
        ok += 1;
        continue;
      }

      try {
        await editPinLink(page, row.pinId, dest.url);
        // update ledgers
        if (pinned[row.bundleId]) {
          pinned[row.bundleId].link = dest.url;
          pinned[row.bundleId].pin_id =
            pinned[row.bundleId].pin_id || row.pinId;
          pinned[row.bundleId].linkEditedAt = new Date().toISOString();
          pinned[row.bundleId].linkDestination = dest.destination;
        }
        state[row.bundleId] = {
          status: "ok",
          at: new Date().toISOString(),
          pin_id: row.pinId,
          link: dest.url,
          destination: dest.destination,
        };
        saveJson(PINNED_PATH, pinned);
        saveJson(STATE_PATH, state);
        log("  ok");
        ok += 1;
      } catch (err) {
        fail += 1;
        log(`  FAIL: ${err instanceof Error ? err.message : err}`);
        state[row.bundleId] = {
          status: "error",
          at: new Date().toISOString(),
          pin_id: row.pinId,
          error: err instanceof Error ? err.message : String(err),
        };
        saveJson(STATE_PATH, state);
      }

      if (i + 1 < queue.length) {
        await sleep(delaySec * 1000);
      }
    }

    log(`done ok=${ok} skip=${skip} fail=${fail} log=${logPath}`);
  } finally {
    // Shared Plantweb Chrome — never browser.close(); avoid hanging page.close()
    try {
      await Promise.race([
        page.close(),
        sleep(2500).then(() => {
          throw new Error("page.close timeout");
        }),
      ]);
    } catch {
      /* ignore */
    }
    try {
      browser.disconnect();
    } catch {
      /* ignore */
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Survive long edits: surface crashes in logs (launchd / nohup).
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  process.exit(1);
});
process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err);
  process.exit(1);
});
// Flush logs quickly when stdout is piped
if (process.stdout.isTTY === false) {
  try {
    // @ts-expect-error Node stream
    process.stdout._handle?.setBlocking?.(true);
  } catch {
    /* ignore */
  }
}
