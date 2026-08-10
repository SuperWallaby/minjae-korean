#!/usr/bin/env npx tsx
/**
 * Publish IG list carousels from auto-video-korean → kajakorean.com/list/{setId}/{slug}
 *
 *   yarn list:publish
 *   npx tsx scripts/publish-ig-list-seo-pages.ts
 *   npx tsx scripts/publish-ig-list-seo-pages.ts --id 20260804-074910-korean-phrases-for-coming-down-sick
 *   npx tsx scripts/publish-ig-list-seo-pages.ts --force
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import {
  igListDescription,
  igListIntro,
  igListPath,
  igListTitleEn,
  slugifyIgListTitle,
} from "../src/lib/igList/seo";
import type { IgListSeoPage, IgListSeoPublishedFile } from "../src/lib/igList/seoTypes";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_JSON = path.join(ROOT, "src/data/igListSets.json");
const PUBLIC_ROOT = path.join(ROOT, "public", "ig-list");

const DEFAULT_AVK = path.resolve(
  ROOT,
  "..",
  "projects",
  "neo-project",
  "auto-video-korean",
  "output",
  "instagram-list-carousels",
);

type ManifestSlide = {
  file?: string;
  kind?: string;
  korean?: string;
  romanization?: string;
  meaning?: string;
  blurb?: string;
};

type Manifest = {
  id?: string;
  title?: string;
  subtitle?: string;
  mascot_family?: string;
  created_at?: string;
  slides?: ManifestSlide[];
};

function parseArgs(argv: string[]) {
  let id = "";
  let force = false;
  let avkRoot = process.env.AVK_IG_LIST_ROOT?.trim() || DEFAULT_AVK;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--force") force = true;
    else if (a === "--id" && argv[i + 1]) {
      id = argv[++i];
    } else if (a === "--avk-root" && argv[i + 1]) {
      avkRoot = path.resolve(argv[++i]);
    }
  }
  // Fallback if Desktop layout differs
  if (!existsSync(avkRoot)) {
    const alt = path.resolve(
      ROOT,
      "..",
      "neo-project",
      "auto-video-korean",
      "output",
      "instagram-list-carousels",
    );
    if (existsSync(alt)) avkRoot = alt;
  }
  return { id, force, avkRoot };
}

async function writeWebp(
  srcPng: string,
  destWebp: string,
  opts: { width?: number; quality: number },
) {
  mkdirSync(path.dirname(destWebp), { recursive: true });
  let pipeline = sharp(srcPng);
  if (opts.width) pipeline = pipeline.resize({ width: opts.width, fit: "inside" });
  await pipeline.webp({ quality: opts.quality, effort: 4 }).toFile(destWebp);
}

function loadPrevious(): Map<string, IgListSeoPage> {
  if (!existsSync(OUT_JSON)) return new Map();
  try {
    const prev = JSON.parse(readFileSync(OUT_JSON, "utf8")) as IgListSeoPublishedFile & {
      sets?: IgListSeoPage[];
    };
    const rows = prev.pages || prev.sets || [];
    return new Map(
      rows.map((p) => [String((p as IgListSeoPage).setId || (p as { id?: string }).id), p as IgListSeoPage]),
    );
  } catch {
    return new Map();
  }
}

async function publishOne(
  setDir: string,
  force: boolean,
): Promise<IgListSeoPage | null> {
  const manPath = path.join(setDir, "manifest.json");
  if (!existsSync(manPath)) return null;
  const man = JSON.parse(readFileSync(manPath, "utf8")) as Manifest;
  const setId = String(man.id || path.basename(setDir)).trim();
  const title = String(man.title || "").trim();
  if (!setId || !title) return null;

  const slides = Array.isArray(man.slides) ? man.slides : [];
  const coverPng = path.join(setDir, "01-cover.png");
  if (!existsSync(coverPng)) {
    console.warn(`  skip ${setId}: missing 01-cover.png`);
    return null;
  }

  const outDir = path.join(PUBLIC_ROOT, setId);
  mkdirSync(outDir, { recursive: true });

  const coverWebp = path.join(outDir, "01-cover.webp");
  const thumbWebp = path.join(outDir, "01-cover-thumb.webp");
  if (force || !existsSync(coverWebp)) {
    await writeWebp(coverPng, coverWebp, { quality: 82 });
  }
  if (force || !existsSync(thumbWebp)) {
    await writeWebp(coverPng, thumbWebp, { width: 480, quality: 75 });
  }

  const cards: IgListSeoPage["cards"] = [];
  for (const slide of slides) {
    const file = String(slide.file || "").trim();
    if (!file) continue;
    const kind = String(slide.kind || "body");
    const src = path.join(setDir, file);
    if (!existsSync(src)) {
      console.warn(`  skip slide ${setId}/${file}: missing`);
      continue;
    }
    const stem = file.replace(/\.png$/i, "");
    const dest = path.join(outDir, `${stem}.webp`);
    if (force || !existsSync(dest)) {
      await writeWebp(src, dest, { quality: 82 });
    }
    cards.push({
      file,
      kind,
      hangul: String(slide.korean || "").trim(),
      romanization: String(slide.romanization || "").trim() || undefined,
      english: String(slide.meaning || "").trim(),
      blurb: String(slide.blurb || "").trim() || undefined,
      imageUrl: `/ig-list/${setId}/${stem}.webp`,
    });
  }

  if (!cards.length) {
    console.warn(`  skip ${setId}: no cards`);
    return null;
  }

  const body = cards.filter((c) => c.kind !== "cover" && c.hangul);
  const titleEn = igListTitleEn(title);
  const slug = slugifyIgListTitle(title);
  const page: IgListSeoPage = {
    setId,
    slug,
    title,
    titleEn,
    subtitle: String(man.subtitle || "").trim() || undefined,
    description: igListDescription(
      titleEn,
      body.map((c) => ({ hangul: c.hangul, english: c.english })),
    ),
    intro: igListIntro(
      man.subtitle,
      body.map((c) => ({
        hangul: c.hangul,
        english: c.english,
        blurb: c.blurb,
      })),
    ),
    coverUrl: `/ig-list/${setId}/01-cover.webp`,
    coverThumbUrl: `/ig-list/${setId}/01-cover-thumb.webp`,
    imageAlt: `${titleEn} Instagram phrase list cover`,
    mascotFamily: String(man.mascot_family || "").trim() || undefined,
    cards,
    updatedAt: String(man.created_at || "").trim() || new Date().toISOString(),
  };

  console.log(
    `  ✓ ${setId} → ${igListPath(setId, slug)} (${body.length} phrases)`,
  );
  return page;
}

async function main() {
  const { id, force, avkRoot } = parseArgs(process.argv.slice(2));
  if (!existsSync(avkRoot)) {
    throw new Error(`AVK carousel root not found: ${avkRoot}`);
  }

  console.log(`==> publish IG list SEO from ${avkRoot}`);
  const prev = loadPrevious();
  const dirs = readdirSync(avkRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !id || name === id)
    .sort();

  const byId = new Map(prev);
  for (const name of dirs) {
    const page = await publishOne(path.join(avkRoot, name), force);
    if (page) byId.set(page.setId, page);
  }

  const pages = [...byId.values()].sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")),
  );

  // Keep homepage-compatible `sets` shape + new `pages` for SEO.
  const out = {
    generatedAt: new Date().toISOString(),
    generatedFrom: avkRoot,
    pages,
    sets: pages.map((p) => ({
      id: p.setId,
      setId: p.setId,
      slug: p.slug,
      title: p.title,
      titleEn: p.titleEn,
      subtitle: p.subtitle,
      description: p.description,
      intro: p.intro,
      coverUrl: p.coverUrl,
      coverThumbUrl: p.coverThumbUrl,
      imageAlt: p.imageAlt,
      mascotFamily: p.mascotFamily,
      updatedAt: p.updatedAt,
      cards: p.cards,
    })),
  };

  writeFileSync(OUT_JSON, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`==> wrote ${pages.length} pages → ${OUT_JSON}`);
  for (const p of pages.slice(0, 5)) {
    console.log(`    https://kajakorean.com${igListPath(p.setId, p.slug)}`);
  }
  if (pages.length > 5) console.log(`    … +${pages.length - 5} more`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
