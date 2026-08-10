#!/usr/bin/env node
/**
 * Edit website destinations on Account B (multilingual :9224) global pins.
 *
 * Default target: https://global.kajakorean.com/pin/{id}
 * (25% direct Preply/italki only when --affiliate-rate > 0)
 *
 *   node scripts/edit-global-pin-destinations.mjs
 *   node scripts/edit-global-pin-destinations.mjs --affiliate-rate 0
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

const OUT = path.join(ROOT, ".tmp/global-lang-en-samples");
const PINNED_PATH = path.join(OUT, "pinterest-pinned.json");
const WAVE_LOG = path.join(OUT, "pin-wave-20260809-082403.log");
const LOG_DIR = path.join(OUT, "logs");

const GLOBAL_SITE = (
  process.env.GLOBAL_SITE_URL || "https://global.kajakorean.com"
).replace(/\/+$/, "");
const PREPLY =
  process.env.PINTEREST_AFFILIATE_PREPLY ||
  "https://preply.sjv.io/c/7574725/1987575/24422";
const ITALKI =
  process.env.PINTEREST_AFFILIATE_ITALKI ||
  "https://www.italki.com/en/affshare?ref=af33117569";

const FALLBACK_PINS = [
  ["01_eye-colors__es", "1151443829797692606"],
  ["02_months__ja", "1151443829797692630"],
  ["03_foods__fr", "1151443829797692666"],
  ["04_emotions__de", "1151443829797692701"],
  ["05_family__it", "1151443829797692732"],
  ["06_numbers__ar", "1151443829797692764"],
];

const { values: args } = parseArgs({
  options: {
    "browser-url": {
      type: "string",
      default:
        process.env.CHROME_PINTEREST_ML_DEBUG_URL ||
        process.env.CHROME_GLOBAL_DEBUG_URL ||
        "http://127.0.0.1:9224",
    },
    "affiliate-rate": {
      type: "string",
      default: process.env.PINTEREST_AFFILIATE_RATE || "0",
    },
    delay: { type: "string", default: "5" },
    "dry-run": { type: "boolean", default: false },
  },
});

const browserURL = String(args["browser-url"] || "").trim();
const affiliateRate = Math.min(
  1,
  Math.max(0, Number(args["affiliate-rate"] ?? 0) || 0),
);
const delaySec = Math.max(2, Number(args.delay) || 5);
const dryRun = Boolean(args["dry-run"]);

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
  writeFileSync(file, JSON.stringify(data, null, 2));
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

function siteLink(id) {
  try {
    const u = new URL(`/pin/${encodeURIComponent(id)}`, GLOBAL_SITE);
    return withUtm(u.toString(), "global-lang-pin");
  } catch {
    return withUtm(`${GLOBAL_SITE}/pin/${encodeURIComponent(id)}`, "global-lang-pin");
  }
}

function pickDestination(id) {
  if (affiliateRate > 0 && Math.random() < affiliateRate) {
    const usePreply = Math.random() < 0.5;
    const raw = usePreply ? PREPLY : ITALKI;
    return {
      url: withUtm(raw, usePreply ? "global-aff-preply" : "global-aff-italki"),
      partner: usePreply ? "preply" : "italki",
    };
  }
  return { url: siteLink(id), partner: "site" };
}

function pinIdsFromWaveLog() {
  if (!existsSync(WAVE_LOG)) return {};
  const text = readFileSync(WAVE_LOG, "utf8");
  const out = {};
  for (const line of text.split("\n")) {
    if (!line.includes("pin_id")) continue;
    try {
      const j = JSON.parse(line.trim());
      const content = String(j.link || "").match(/utm_content=([^&]+)/);
      const id = content?.[1];
      if (id && j.pin_id) out[id] = String(j.pin_id);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function resolvePins(ledger) {
  const fromLog = pinIdsFromWaveLog();
  const rows = [];
  const keys = new Set([
    ...Object.keys(ledger || {}),
    ...FALLBACK_PINS.map(([id]) => id),
  ]);
  for (const id of [...keys].sort()) {
    const meta = ledger[id] || {};
    const pinId = String(
      meta.pin_id || meta.pinId || fromLog[id] || "",
    ).trim();
    if (!pinId) continue;
    rows.push({ id, pinId, meta });
  }
  // Fallback exact list if ledger empty of ids
  if (!rows.length) {
    for (const [id, pinId] of FALLBACK_PINS) rows.push({ id, pinId, meta: {} });
  }
  return rows;
}

async function openEditUi(page, pinId) {
  await page.goto(`https://www.pinterest.com/pin/${pinId}/`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await sleep(2800);
  await page.keyboard.press("Escape");
  await sleep(500);

  // Try /edit deep-link once if menu fails later
  for (let attempt = 0; attempt < 5; attempt++) {
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
      const direct = all.find((el) => {
        const t = labeled(el);
        return (
          t === "edit pin" ||
          t === "edit this pin" ||
          t === "edit" ||
          t === "핀 수정" ||
          t.includes("edit pin")
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
          const a = (el.getAttribute("aria-label") || "").toLowerCase();
          return (
            a === "more actions" ||
            a === "more options" ||
            a.includes("more options") ||
            a.includes("more actions")
          );
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
      await sleep(1200);
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
            t === "수정" ||
            t.includes("edit pin")
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
    // fallback navigate to edit URL once mid-loop
    if (attempt === 2) {
      await page.goto(`https://www.pinterest.com/pin/${pinId}/edit/`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await sleep(2500);
      const hasField = await page.evaluate(
        () =>
          Boolean(
            document.querySelector("#WebsiteField") ||
              document.querySelector('textarea[id^="pin-draft-link-"]') ||
              document.querySelector('input[placeholder*="Website" i]'),
          ),
      );
      if (hasField) return;
    }
    await sleep(1200 + attempt * 600);
  }
  throw new Error("More actions not found");
}

async function fillWebsiteAndSave(page, link) {
  await page
    .waitForFunction(
      () =>
        Boolean(
          document.querySelector("#WebsiteField") ||
            [...document.querySelectorAll("textarea,input")].some((el) =>
              /^(pin-draft-link-|WebsiteField)/i.test(el.id || ""),
            ) ||
            document.querySelector('textarea[placeholder*="link" i]') ||
            document.querySelector('input[placeholder*="Website" i]'),
        ),
      { timeout: 25000 },
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
    return { ok: true };
  }, link);

  const website =
    (await page.$("#WebsiteField")) ||
    (await page.$('textarea[id^="pin-draft-link-"]')) ||
    (await page.$('input[placeholder*="Website" i]'));
  if (website) {
    await website.click({ clickCount: 3 });
    await page.keyboard.down("Meta");
    await page.keyboard.press("a");
    await page.keyboard.up("Meta");
    await page.keyboard.press("Backspace");
    await sleep(80);
    await page.keyboard.type(link, { delay: 3 });
  } else if (!filled.ok) {
    throw new Error(filled.reason || "website field missing");
  }

  await sleep(400);
  const saved = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll("button,[role=button]")];
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

async function main() {
  mkdirSync(LOG_DIR, { recursive: true });
  const ledger = loadJson(PINNED_PATH, {});
  const rows = resolvePins(ledger);
  console.log(
    `==> edit global pin destinations n=${rows.length} site=${GLOBAL_SITE} affRate=${affiliateRate} dryRun=${dryRun}`,
  );
  console.log(`    browser=${browserURL}`);

  if (!rows.length) {
    console.log("nothing to edit");
    return;
  }

  if (dryRun) {
    for (const row of rows) {
      const d = pickDestination(row.id);
      console.log(`→ ${row.id} pin=${row.pinId} → ${d.partner}`);
      console.log(`   ${d.url}`);
    }
    return;
  }

  const browser = await puppeteer.connect({
    browserURL,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  let ok = 0;
  let fail = 0;

  try {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const dest = pickDestination(row.id);
      console.log(
        `→ [${i + 1}/${rows.length}] ${row.id} pin=${row.pinId} → ${dest.partner}`,
      );
      console.log(`   link: ${dest.url}`);
      try {
        await openEditUi(page, row.pinId);
        await fillWebsiteAndSave(page, dest.url);
        ledger[row.id] = {
          ...(ledger[row.id] || row.meta || {}),
          pin_id: row.pinId,
          link: dest.url,
          partner: dest.partner,
          editedAt: new Date().toISOString(),
        };
        saveJson(PINNED_PATH, ledger);
        console.log("  ok");
        ok += 1;
      } catch (e) {
        fail += 1;
        console.error(`  FAIL: ${e instanceof Error ? e.message : e}`);
      }
      if (i + 1 < rows.length) await sleep(delaySec * 1000);
    }
  } finally {
    await page.close().catch(() => {});
    browser.disconnect();
  }
  console.log(`done ok=${ok} fail=${fail}`);
  if (fail && !ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
