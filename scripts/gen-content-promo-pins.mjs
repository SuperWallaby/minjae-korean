#!/usr/bin/env node
/**
 * Generate tall Pinterest promo pins for blog / news articles.
 * Destination is always the live site article URL (not affiliate).
 *
 * Blog (from git catalog):
 *   node scripts/gen-content-promo-pins.mjs --blog --limit 3
 *   node scripts/gen-content-promo-pins.mjs --blog --slug is-korean-hard-to-learn
 *
 * News (from public API on kajakorean.com):
 *   node scripts/gen-content-promo-pins.mjs --news --limit 3
 *   node scripts/gen-content-promo-pins.mjs --news --slug some-news-slug
 *
 * Options:
 *   --force        regenerate even if already in ledger
 *   --upload-r2    also push pin JPEG to R2
 *   --dry-run      list targets only
 *   --out DIR      output root (default .tmp/content-promo-pins)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";
import {
  articleDestinationUrl,
  generateContentPromoPin,
} from "./lib/blog_promo_pin.mjs";

loadEnvLocal(ROOT);

// Also pull AVK .env for Azure if needed
const AVK_ENV = join(ROOT, "../projects/neo-project/auto-video-korean/.env");
if (existsSync(AVK_ENV)) {
  for (const line of readFileSync(AVK_ENV, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

const { values: args } = parseArgs({
  options: {
    blog: { type: "boolean", default: false },
    news: { type: "boolean", default: false },
    slug: { type: "string" },
    limit: { type: "string", default: "0" },
    force: { type: "boolean", default: false },
    "upload-r2": { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    out: { type: "string" },
  },
  allowPositionals: true,
});

const wantBlog = Boolean(args.blog) || (!args.blog && !args.news);
const wantNews = Boolean(args.news);
const onlySlug = args.slug ? String(args.slug).trim() : "";
const limit = Math.max(0, Number(args.limit) || 0);
const force = Boolean(args.force);
const uploadR2 = Boolean(args["upload-r2"]);
const dryRun = Boolean(args["dry-run"]);
const outRoot = args.out
  ? join(ROOT, args.out)
  : join(ROOT, ".tmp/content-promo-pins");

const LEDGER_PATH = join(outRoot, "promo-pinned.json");

function loadLedger() {
  if (!existsSync(LEDGER_PATH)) return {};
  try {
    return JSON.parse(readFileSync(LEDGER_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveLedger(data) {
  mkdirSync(outRoot, { recursive: true });
  writeFileSync(LEDGER_PATH, `${JSON.stringify(data, null, 2)}\n`);
}

function extractPostMeta(raw, slug) {
  const block =
    raw.match(
      /export const post\s*:\s*BlogPost\s*=\s*\{([\s\S]*?)\n\s*paragraphs\s*:/,
    )?.[1] ||
    raw.match(/export const post[^=]*=\s*\{([\s\S]*?)\n\s*paragraphs\s*:/)?.[1] ||
    raw;

  let title = "";
  const titleStr = block.match(/\btitle:\s*"((?:\\.|[^"\\])*)"/)?.[1];
  const titleTpl = block.match(/\btitle:\s*`((?:\\.|[^`\\])*)`/)?.[1];
  if (titleStr) title = titleStr.replace(/\\"/g, '"');
  else if (titleTpl) {
    title = titleTpl
      .replace(/\$\{VOCAB_QUIZ_APP_NAME\}/g, "Kaja Korean")
      .replace(/\$\{[^}]+\}/g, "")
      .replace(/\\`/g, "`")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (!title) title = slug.replace(/-/g, " ");

  let description = "";
  const descStr = block.match(/\bdescription:\s*"((?:\\.|[^"\\])*)"/)?.[1];
  const descTpl = block.match(/\bdescription:\s*`((?:\\.|[^`\\])*)`/)?.[1];
  if (descStr) description = descStr.replace(/\\"/g, '"');
  else if (descTpl) {
    description = descTpl
      .replace(/\$\{VOCAB_QUIZ_APP_NAME\}/g, "Kaja Korean")
      .replace(/\$\{[^}]+\}/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  return { title, description };
}

/** Parse blog catalog from file system (slug + title + description). */
function listBlogPosts() {
  const indexPath = join(ROOT, "src/data/blogPosts/index.ts");
  const contentDir = join(ROOT, "src/data/blogPosts/content");
  const indexRaw = readFileSync(indexPath, "utf8");
  const listBlock = indexRaw.match(
    /const SLUG_LIST\s*=\s*\[([\s\S]*?)\]\s*as const/,
  );
  if (!listBlock) {
    throw new Error("Could not parse SLUG_LIST from blogPosts/index.ts");
  }
  const slugs = [...listBlock[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

  const posts = [];
  for (const slug of slugs) {
    const file = existsSync(join(contentDir, `${slug}.tsx`))
      ? join(contentDir, `${slug}.tsx`)
      : existsSync(join(contentDir, `${slug}.ts`))
        ? join(contentDir, `${slug}.ts`)
        : null;
    if (!file) {
      console.warn(`[blog] content missing for ${slug}`);
      continue;
    }
    const raw = readFileSync(file, "utf8");
    const { title, description } = extractPostMeta(raw, slug);
    posts.push({
      kind: "blog",
      slug,
      title,
      description,
      destination: articleDestinationUrl("blog", slug),
    });
  }
  return posts;
}

async function listNewsPosts(max = 80) {
  const base =
    process.env.KAJA_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://kajakorean.com";
  const url = `${base}/api/public/articles?limit=${max}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) {
    throw new Error(`news list HTTP ${res.status}: ${url}`);
  }
  const data = await res.json();
  const rows = Array.isArray(data?.articles)
    ? data.articles
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];
  return rows
    .map((a) => ({
      kind: "news",
      slug: String(a.slug || "").trim(),
      title: String(a.title || "").trim(),
      description: String(a.introductionEn || a.description || "").trim(),
      destination: a.slug ? articleDestinationUrl("news", a.slug) : "",
    }))
    .filter((a) => a.slug && a.title);
}

async function main() {
  mkdirSync(outRoot, { recursive: true });
  const ledger = loadLedger();
  /** @type {Array<{kind:string,slug:string,title:string,description:string,destination:string}>} */
  let targets = [];

  if (wantBlog) targets.push(...listBlogPosts());
  if (wantNews) targets.push(...(await listNewsPosts()));

  if (onlySlug) {
    targets = targets.filter((t) => t.slug === onlySlug);
    if (!targets.length) {
      // allow blog by slug even if parsing missed it
      if (wantBlog || !wantNews) {
        targets = [
          {
            kind: "blog",
            slug: onlySlug,
            title: onlySlug.replace(/-/g, " "),
            description: "",
            destination: articleDestinationUrl("blog", onlySlug),
          },
        ];
      }
    }
  }

  if (!force) {
    targets = targets.filter((t) => {
      const key = `${t.kind}:${t.slug}`;
      return ledger[key]?.status !== "ok";
    });
  }
  if (limit > 0) targets = targets.slice(0, limit);

  console.log(
    `==> content promo pins targets=${targets.length} blog=${wantBlog} news=${wantNews} force=${force} dryRun=${dryRun}`,
  );
  for (const t of targets) {
    console.log(`  · [${t.kind}] ${t.slug}`);
    console.log(`      title: ${t.title.slice(0, 70)}`);
    console.log(`      link:  ${t.destination}`);
  }

  if (dryRun || !targets.length) {
    if (!targets.length) console.log("nothing to do");
    return;
  }

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < targets.length; i += 1) {
    const t = targets[i];
    const key = `${t.kind}:${t.slug}`;
    const outDir = join(outRoot, t.kind, t.slug);
    console.log(`\n→ [${i + 1}/${targets.length}] ${key}`);
    try {
      const result = await generateContentPromoPin({
        kind: t.kind,
        slug: t.slug,
        title: t.title,
        description: t.description,
        outDir,
        uploadR2,
      });
      ledger[key] = {
        status: "ok",
        at: new Date().toISOString(),
        title: t.title,
        destination: result.destination,
        pinJpg: result.pinJpgPath,
        pinPng: result.pinPath,
        r2Url: result.r2Url || null,
      };
      saveLedger(ledger);
      console.log(`  ok pin=${result.pinJpgPath}`);
      console.log(`  dest=${result.destination}`);
      ok += 1;
    } catch (err) {
      fail += 1;
      console.error(`  FAIL:`, err instanceof Error ? err.message : err);
      ledger[key] = {
        status: "error",
        at: new Date().toISOString(),
        title: t.title,
        destination: t.destination,
        error: err instanceof Error ? err.message : String(err),
      };
      saveLedger(ledger);
    }
  }

  console.log(`\n[done] ok=${ok} fail=${fail} ledger=${LEDGER_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
