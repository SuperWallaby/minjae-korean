#!/usr/bin/env node
/**
 * Monthly TRENDS wave for global teach-lang pins (EN speakers → target lang).
 * Combines Pinterest Trends angles × affiliate-OK formats.
 * Capybara appearance: ~50% (cute_cast always on).
 *
 *   npx tsx scripts/generate-global-lang-trends.ts --limit 100
 *   npx tsx scripts/generate-global-lang-trends.ts --dry-run
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomInt } from "node:crypto";

import { azureChat, stripCodeFence } from "./lib/azure_chat.mjs";
import {
  IMAGE_DEPLOY,
  compositeAffiliateFooter,
  generateWithRetry,
  sizeForFormat,
  PINTEREST_MOBILE_THUMB,
  BABY_CAPYBARA_BLUE_HAT,
  CAPYBARA_ART_STYLE,
  CAPYBARA_MASCOT,
} from "./lib/vocab-infographic-gen.mjs";
import {
  affiliateFooterCopyTeachLang,
  assertGlobalAffiliateFormat,
} from "./lib/global-pinterest-formats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WAVE = "2026-08";
const OUT = join(ROOT, ".tmp", `global-lang-trends-${WAVE}`);
const LOG = join(OUT, "batch.log");
const PROGRESS = join(OUT, "progress.json");
const MANIFEST = join(OUT, "wave-manifest.json");

const CAPY_APPEAR_RATE = 0.5;

function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));

type Lang = { code: string; name: string };
type WordSeed = { english: string; visual: string };
type FormatId =
  | "super_list"
  | "grid_cluster"
  | "phrase_stack"
  | "cute_cast"
  | "antonym_split"
  | "similar_split"
  | "quiz_comment"
  | "concept_rows";

type TrendTopic = {
  rank: number;
  slug: string;
  trendSource: string;
  format: FormatId;
  titleEn: (langName: string) => string;
  englishWords: WordSeed[];
  /** For quiz_comment: index of correct option in englishWords (default 0). */
  quizCorrectIndex?: number;
};

type Job = {
  id: string;
  lang: Lang;
  topic: TrendTopic;
  withCapybara: boolean;
};

const LANGS: Lang[] = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ar", name: "Arabic" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
];

/** US Trends (All) → teachable vocab angles × format rotation. Aug 2026. */
const TREND_TOPICS: TrendTopic[] = [
  {
    rank: 1,
    slug: "nail-colors",
    trendSource: "august nails / late summer nails",
    format: "super_list",
    titleEn: (L) => `Nail colors in ${L}`,
    englishWords: [
      { english: "red", visual: "red nail polish bottle" },
      { english: "pink", visual: "pink nail tip" },
      { english: "nude", visual: "nude beige nail" },
      { english: "white", visual: "white french tip" },
      { english: "black", visual: "black glossy nail" },
      { english: "blue", visual: "blue nail polish" },
      { english: "green", visual: "mint green nail" },
      { english: "purple", visual: "purple nail tip" },
      { english: "gold", visual: "gold glitter nail" },
      { english: "silver", visual: "silver chrome nail" },
    ],
  },
  {
    rank: 2,
    slug: "school-bag",
    trendSource: "back to school / backpacks",
    format: "grid_cluster",
    titleEn: (L) => `School bag words in ${L}`,
    englishWords: [
      { english: "backpack", visual: "school backpack icon" },
      { english: "pencil", visual: "yellow pencil" },
      { english: "notebook", visual: "spiral notebook" },
      { english: "eraser", visual: "pink eraser" },
      { english: "ruler", visual: "ruler stick" },
      { english: "scissors", visual: "safety scissors" },
      { english: "glue", visual: "glue stick" },
      { english: "lunchbox", visual: "lunch box" },
      { english: "water bottle", visual: "sports water bottle" },
    ],
  },
  {
    rank: 3,
    slug: "fall-activities",
    trendSource: "fall activities",
    format: "phrase_stack",
    titleEn: (L) => `Fall activities in ${L}`,
    englishWords: [
      { english: "pick apples", visual: "apple tree + basket" },
      { english: "drink hot cocoa", visual: "mug with steam" },
      { english: "wear a sweater", visual: "cozy sweater" },
      { english: "walk in leaves", visual: "autumn leaves path" },
      { english: "carve a pumpkin", visual: "pumpkin + knife" },
      { english: "watch the sunset", visual: "orange sunset" },
      { english: "bake cookies", visual: "cookie tray" },
      { english: "light a candle", visual: "small candle" },
    ],
  },
  {
    rank: 4,
    slug: "halloween",
    trendSource: "Moments · Halloween approaching",
    format: "cute_cast",
    titleEn: (L) => `Halloween words in ${L}`,
    englishWords: [
      { english: "pumpkin", visual: "jack-o-lantern vibe prop" },
      { english: "candy", visual: "wrapped candy" },
      { english: "costume", visual: "costume hat" },
      { english: "ghost", visual: "cute ghost sheet" },
      { english: "witch", visual: "witch hat" },
      { english: "spider", visual: "friendly spider" },
      { english: "bat", visual: "bat silhouette" },
      { english: "skeleton", visual: "cute bone icon" },
      { english: "trick or treat", visual: "candy bag" },
    ],
  },
  {
    rank: 5,
    slug: "hot-cold-drinks",
    trendSource: "Starbucks drink orders",
    format: "antonym_split",
    titleEn: (L) => `Hot vs cold drinks in ${L}`,
    englishWords: [
      { english: "hot coffee", visual: "steaming coffee cup" },
      { english: "iced coffee", visual: "iced coffee with ice cubes" },
    ],
  },
  {
    rank: 6,
    slug: "thanksgiving-foods",
    trendSource: "Moments · Thanksgiving approaching",
    format: "super_list",
    titleEn: (L) => `Thanksgiving foods in ${L}`,
    englishWords: [
      { english: "turkey", visual: "roast turkey" },
      { english: "gravy", visual: "gravy boat" },
      { english: "mashed potatoes", visual: "potato mash bowl" },
      { english: "stuffing", visual: "stuffing scoop" },
      { english: "cranberry", visual: "cranberry sauce" },
      { english: "pie", visual: "pumpkin pie slice" },
      { english: "corn", visual: "corn cob" },
      { english: "rolls", visual: "dinner rolls" },
      { english: "salad", visual: "green salad bowl" },
      { english: "sweet potato", visual: "sweet potato" },
    ],
  },
  {
    rank: 7,
    slug: "christmas",
    trendSource: "Moments · Christmas approaching",
    format: "grid_cluster",
    titleEn: (L) => `Christmas words in ${L}`,
    englishWords: [
      { english: "tree", visual: "christmas tree" },
      { english: "gift", visual: "wrapped gift" },
      { english: "snow", visual: "snowflake" },
      { english: "santa", visual: "santa hat" },
      { english: "stocking", visual: "christmas stocking" },
      { english: "lights", visual: "string lights" },
      { english: "ornament", visual: "tree ornament" },
      { english: "cookie", visual: "gingerbread cookie" },
      { english: "bell", visual: "jingle bell" },
    ],
  },
  {
    rank: 8,
    slug: "cafe-drinks",
    trendSource: "Starbucks drink orders / cafe",
    format: "phrase_stack",
    titleEn: (L) => `Cafe order phrases in ${L}`,
    englishWords: [
      { english: "latte please", visual: "latte cup" },
      { english: "iced americano", visual: "iced americano" },
      { english: "with oat milk", visual: "oat milk carton" },
      { english: "less sugar", visual: "sugar packet X" },
      { english: "to go", visual: "takeaway cup" },
      { english: "for here", visual: "ceramic mug" },
      { english: "extra shot", visual: "espresso shot" },
      { english: "whipped cream", visual: "whipped cream swirl" },
    ],
  },
  {
    rank: 9,
    slug: "pottery-craft",
    trendSource: "pottery painting ideas",
    format: "cute_cast",
    titleEn: (L) => `Craft words in ${L}`,
    englishWords: [
      { english: "paint", visual: "paint brush" },
      { english: "clay", visual: "clay lump" },
      { english: "pottery", visual: "ceramic bowl" },
      { english: "brush", visual: "art brush" },
      { english: "color", visual: "paint palette" },
      { english: "glue", visual: "craft glue" },
      { english: "scissors", visual: "craft scissors" },
      { english: "paper", visual: "colored paper" },
      { english: "studio", visual: "art studio easel" },
    ],
  },
  {
    rank: 10,
    slug: "sneakers-boots",
    trendSource: "back to school shoes",
    format: "similar_split",
    titleEn: (L) => `Sneakers vs boots in ${L}`,
    englishWords: [
      { english: "sneakers", visual: "sport sneakers" },
      { english: "boots", visual: "ankle boots" },
    ],
  },
  {
    rank: 11,
    slug: "breakfast-bowl",
    trendSource: "savory yogurt bowls / yogurt recipes",
    format: "super_list",
    titleEn: (L) => `Breakfast bowl words in ${L}`,
    englishWords: [
      { english: "yogurt", visual: "yogurt cup" },
      { english: "granola", visual: "granola cluster" },
      { english: "honey", visual: "honey dipper" },
      { english: "banana", visual: "banana" },
      { english: "berry", visual: "mixed berries" },
      { english: "oats", visual: "oat flakes" },
      { english: "milk", visual: "milk carton" },
      { english: "nut", visual: "almonds" },
      { english: "seed", visual: "chia seeds" },
      { english: "bowl", visual: "breakfast bowl" },
    ],
  },
  {
    rank: 12,
    slug: "fall-flowers",
    trendSource: "fall flowers / ikebana party",
    format: "grid_cluster",
    titleEn: (L) => `Fall flower words in ${L}`,
    englishWords: [
      { english: "rose", visual: "rose bloom" },
      { english: "sunflower", visual: "sunflower" },
      { english: "daisy", visual: "daisy" },
      { english: "tulip", visual: "tulip" },
      { english: "leaf", visual: "autumn leaf" },
      { english: "vase", visual: "flower vase" },
      { english: "bouquet", visual: "flower bouquet" },
      { english: "petal", visual: "flower petal" },
      { english: "garden", visual: "garden path" },
    ],
  },
  {
    rank: 13,
    slug: "which-drink",
    trendSource: "Starbucks drink orders (quiz)",
    format: "quiz_comment",
    titleEn: (L) => `Which drink is this? (${L})`,
    quizCorrectIndex: 0,
    englishWords: [
      { english: "latte", visual: "milky latte with foam art" },
      { english: "espresso", visual: "tiny espresso shot" },
      { english: "matcha", visual: "green matcha latte" },
      { english: "lemonade", visual: "yellow lemonade glass" },
    ],
  },
  {
    rank: 14,
    slug: "open-close-school",
    trendSource: "back to school / school routine",
    format: "concept_rows",
    titleEn: (L) => `Open vs close at school (${L})`,
    englishWords: [
      { english: "open the book", visual: "open book pages" },
      { english: "close the book", visual: "closed book" },
      { english: "open the door", visual: "door opening" },
      { english: "close the door", visual: "closed door" },
    ],
  },
  {
    rank: 15,
    slug: "costumes",
    trendSource: "costumes & accessories shopping",
    format: "phrase_stack",
    titleEn: (L) => `Costume party phrases in ${L}`,
    englishWords: [
      { english: "nice costume", visual: "party costume" },
      { english: "who are you", visual: "question mark mask" },
      { english: "let's dance", visual: "music notes" },
      { english: "take a photo", visual: "camera" },
      { english: "happy halloween", visual: "pumpkin smile" },
      { english: "scary makeup", visual: "makeup brush" },
      { english: "candy please", visual: "candy bowl" },
      { english: "so cool", visual: "thumbs up star" },
    ],
  },
  {
    rank: 16,
    slug: "snacks",
    trendSource: "shark week snacks / food carriers",
    format: "cute_cast",
    titleEn: (L) => `Snack words in ${L}`,
    englishWords: [
      { english: "chips", visual: "chip bag" },
      { english: "popcorn", visual: "popcorn bucket" },
      { english: "cookie", visual: "cookie" },
      { english: "candy", visual: "candy wrapper" },
      { english: "pretzel", visual: "pretzel" },
      { english: "nuts", visual: "mixed nuts" },
      { english: "fruit", visual: "apple slice" },
      { english: "juice", visual: "juice box" },
      { english: "sandwich", visual: "small sandwich" },
    ],
  },
  {
    rank: 17,
    slug: "bags",
    trendSource: "backpacks / messenger bags",
    format: "super_list",
    titleEn: (L) => `Bag words in ${L}`,
    englishWords: [
      { english: "backpack", visual: "backpack" },
      { english: "handbag", visual: "handbag" },
      { english: "tote", visual: "tote bag" },
      { english: "wallet", visual: "wallet" },
      { english: "purse", visual: "small purse" },
      { english: "suitcase", visual: "suitcase" },
      { english: "duffel", visual: "duffel bag" },
      { english: "pouch", visual: "zip pouch" },
      { english: "strap", visual: "bag strap" },
      { english: "zipper", visual: "zipper" },
    ],
  },
];

function log(line: string) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  console.log(msg);
  mkdirSync(OUT, { recursive: true });
  appendFileSync(LOG, msg + "\n");
}

function loadProgress(): {
  done: Record<string, unknown>;
  failed: Record<string, { at: string; error: string }>;
} {
  if (!existsSync(PROGRESS)) return { done: {}, failed: {} };
  try {
    return JSON.parse(readFileSync(PROGRESS, "utf8"));
  } catch {
    return { done: {}, failed: {} };
  }
}

function saveProgress(p: ReturnType<typeof loadProgress>) {
  writeFileSync(PROGRESS, JSON.stringify(p, null, 2));
}

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildJobs(limit: number): Job[] {
  const base: Omit<Job, "withCapybara">[] = [];
  for (const topic of TREND_TOPICS) {
    const pad = String(topic.rank).padStart(2, "0");
    for (const lang of LANGS) {
      base.push({
        id: `tr_${WAVE.replace("-", "")}_${pad}_${topic.slug}__${topic.format}__${lang.code}`,
        lang,
        topic,
      });
    }
  }
  const sliced = base.slice(0, limit);

  // ~50% capybara: cute_cast always on; others fill to target rate.
  const jobs: Job[] = sliced.map((j) => ({
    ...j,
    withCapybara: j.topic.format === "cute_cast",
  }));
  const flexible = jobs.filter((j) => j.topic.format !== "cute_cast");
  const targetOn = Math.round(jobs.length * CAPY_APPEAR_RATE);
  const alreadyOn = jobs.filter((j) => j.withCapybara).length;
  const needOn = Math.max(0, targetOn - alreadyOn);
  shuffleInPlace(flexible);
  for (let i = 0; i < flexible.length; i++) {
    flexible[i].withCapybara = i < needOn;
  }
  return jobs;
}

async function localizeWords(job: Job) {
  const words = job.topic.englishWords;
  const payload = {
    titleEn: job.topic.titleEn(job.lang.name),
    lang: job.lang.name,
    words: words.map((w) => w.english),
  };
  const system = `You localize vocabulary for English speakers learning ${job.lang.name}.
Return ONLY JSON:
{
  "title": "English title keeping the pattern (may lightly polish)",
  "words": [{"english":"...","target":"word/phrase in ${job.lang.name}","romanization":"latin pronunciation aid"}]
}
Rules:
- target = natural ${job.lang.name} flashcard form (correct orthography).
- For Arabic: Arabic script as target; romanization in Latin letters.
- For Japanese: Kana/Kanji for beginners; Hepburn romanization.
- Keep same order and count as input.
- NO Korean / Hangul anywhere.`;

  const raw = await azureChat({
    system,
    user: JSON.stringify(payload),
    temperature: 0.2,
  });
  const parsed = JSON.parse(stripCodeFence(raw));
  if (!parsed?.title || !Array.isArray(parsed.words)) {
    throw new Error("localize parse failed");
  }
  return {
    title: String(parsed.title).trim() || job.topic.titleEn(job.lang.name),
    words: words.map((w, i) => {
      const row = parsed.words[i] || {};
      return {
        english: w.english,
        visual: w.visual,
        target: String(row.target || "").trim(),
        romanization: String(row.romanization || "").trim(),
      };
    }),
  };
}

type Localized = Awaited<ReturnType<typeof localizeWords>>;

function mascotBlock(withCapybara: boolean, format: FormatId) {
  if (format === "cute_cast" || withCapybara) {
    return `CAST LOCK (HARD): Brand CAPYBARA doodle mascot is REQUIRED.
${CAPYBARA_ART_STYLE}
${CAPYBARA_MASCOT}
Blue-hat sidekick OK: ${BABY_CAPYBARA_BLUE_HAT}
NEVER otter, NEVER humans, NEVER other animal mascots.
Use style-reference sheet for the capybara look.`;
  }
  return `NO CHARACTERS / NO MASCOTS (CRITICAL):
- Do NOT draw capybara, otter, bear, animal mascot, human, sidekick, or any character.
- Use small theme OBJECT icons / color swatches only.
- Pet/animal topics: simple face icons OK, not branded characters.`;
}

function buildPrompt(job: Job, localized: Localized) {
  const L = job.lang.name;
  const fmt = job.topic.format;
  const style = `Premium language-learning Pinterest save graphic for ENGLISH speakers learning ${L}.
${PINTEREST_MOBILE_THUMB}
Soft pastel cream or blush background, clean modern sans-serif typography.
Cute simple sticker/doodle style — flat soft fills, friendly — not photorealistic.
${mascotBlock(job.withCapybara, fmt)}

PRODUCT LOCK (CRITICAL):
- Teaches ${L} vocabulary to English speakers.
- Largest text on each row/cell = the ${L} word/phrase.
- Supporting text = English meaning + romanization in [brackets].
- Title in ENGLISH: "${localized.title}"
- ZERO Korean / Hangul / 한국어 anywhere.
NO website URLs, NO watermarks, NO @handles, NO logos, NO footer text in the image.
Leave a clean empty footer band (~10% height) blank for branding overlay.`;

  const rows = localized.words
    .map(
      (w, i) =>
        `${i + 1}. TARGET "${w.target}" (largest) / [${w.romanization}] — English "${w.english}" — icon: ${w.visual}`,
    )
    .join("\n");

  if (fmt === "antonym_split" && localized.words.length >= 2) {
    const [a, b] = localized.words;
    return `${style}

FORMAT: Vertical split antonym card. Header: "${localized.title}" bold centered (English).
LEFT (warm pastel): ${a.english} — LARGE ${L} "${a.target}" [${a.romanization}] — ${a.visual}
RIGHT (cool pastel): ${b.english} — LARGE ${L} "${b.target}" [${b.romanization}] — ${b.visual}
One vocabulary pair only. Mirrored layout.`;
  }

  if (fmt === "similar_split" && localized.words.length >= 2) {
    const [a, b] = localized.words;
    return `${style}

FORMAT: Vertical split SIMILAR / confusable pair (NOT opposites). Header: "${localized.title}" (English).
LEFT: ${a.english} — LARGE ${L} "${a.target}" [${a.romanization}] — ${a.visual}
RIGHT: ${b.english} — LARGE ${L} "${b.target}" [${b.romanization}] — ${b.visual}
Soft twin pastel panels; clarify they are related but different.`;
  }

  if (fmt === "quiz_comment") {
    const correct = localized.words[job.topic.quizCorrectIndex ?? 0];
    const opts = localized.words
      .map(
        (w, i) =>
          `${String.fromCharCode(65 + i)}. ${w.target} [${w.romanization}]`,
      )
      .join("\n");
    return `${style}

FORMAT: 4-choice quiz pin titled "${localized.title}" (English).
Big illustration clue for the CORRECT answer concept: ${correct.visual} (${correct.english}) — do NOT print the English answer word on the image.
Question line: "What is this in ${L}?"
Options (print exactly):
${opts}
Footer CTA vibe: "Comment your answer!" (English). Do NOT reveal which letter is correct.`;
  }

  if (fmt === "concept_rows") {
    const panels = localized.words
      .map(
        (w, i) =>
          `PANEL ${i + 1}: LARGE ${L} "${w.target}" + [${w.romanization}] + English "${w.english}". Scene: ${w.visual}`,
      )
      .join("\n");
    return `${style}

FORMAT: Concept panel card titled "${localized.title}" (English). Soft cream + sky-teal.
Layout: ${localized.words.length === 4 ? "2×2 rounded cards" : "stacked cards"}.
ONE clear idea per panel. Large readable ${L} text.
${panels}`;
  }

  if (fmt === "grid_cluster" || fmt === "cute_cast") {
    return `${style}

FORMAT: ${fmt === "cute_cast" ? "Cute 3×3 sticker grid" : "3×3 grid infographic"} titled "${localized.title}" (English) at top.
Each cell: ${job.withCapybara || fmt === "cute_cast" ? "brand capybara doodle (varied pose) OR theme prop +" : "theme object icon +"} LARGE ${L} word + [romanization] + English gloss.
CELLS (exact lock):
${rows}`;
  }

  if (fmt === "phrase_stack") {
    return `${style}

FORMAT: Polished daily-phrase stack titled "${localized.title}" (English). Fewer lines, designed (not a plain dump).
Each row: LARGE ${L} phrase + [romanization] + English. Small theme icon on the left.
ROWS (exact lock):
${rows}`;
  }

  // super_list default
  return `${style}

FORMAT: Tall portrait list titled "${localized.title.toUpperCase()}" at top (English).
Scannable rows. Left: small theme icon/swatch${job.withCapybara ? " or tiny brand capybara" : ""}. Right: LARGE ${L} word + [romanization] + English gloss.
Generous row height. Nothing cropped at bottom.
ROWS (exact lock):
${rows}`;
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const force = argv.includes("--force");
  const limitIdx = argv.indexOf("--limit");
  const limit =
    limitIdx >= 0 && argv[limitIdx + 1]
      ? Math.max(1, Number(argv[limitIdx + 1]) || 100)
      : 100;

  const jobs = buildJobs(limit);
  const capyN = jobs.filter((j) => j.withCapybara).length;
  const formatCounts: Record<string, number> = {};
  for (const j of jobs) {
    formatCounts[j.topic.format] = (formatCounts[j.topic.format] || 0) + 1;
  }

  mkdirSync(OUT, { recursive: true });
  writeFileSync(
    MANIFEST,
    JSON.stringify(
      {
        wave: WAVE,
        limit,
        capyAppearRate: CAPY_APPEAR_RATE,
        capyCount: capyN,
        total: jobs.length,
        formatCounts,
        topics: TREND_TOPICS.map((t) => ({
          slug: t.slug,
          format: t.format,
          trendSource: t.trendSource,
        })),
        jobs: jobs.map((j) => ({
          id: j.id,
          lang: j.lang.code,
          format: j.topic.format,
          topic: j.topic.slug,
          withCapybara: j.withCapybara,
          trendSource: j.topic.trendSource,
        })),
      },
      null,
      2,
    ),
  );

  log(
    `==> trends wave ${WAVE} jobs=${jobs.length} capybara=${capyN}/${jobs.length} (${((100 * capyN) / jobs.length).toFixed(0)}%) model=${IMAGE_DEPLOY}`,
  );
  log(`    formats: ${JSON.stringify(formatCounts)}`);
  log(`    out=${OUT}`);

  if (dryRun) {
    log("dry-run — manifest written, no image gen");
    return;
  }

  const progress = loadProgress();
  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const outPng = join(OUT, `${job.id}.png`);
    const rawPng = join(OUT, `${job.id}_raw.png`);
    const metaPath = join(OUT, `${job.id}.json`);
    log(
      `\n[${i + 1}/${jobs.length}] ${job.id} · ${job.topic.format} · capy=${job.withCapybara ? "yes" : "no"} · ${job.topic.trendSource}`,
    );

    if (!force && existsSync(outPng) && existsSync(metaPath)) {
      log("  skip (exists)");
      skip++;
      progress.done[job.id] = {
        at: new Date().toISOString(),
        skipped: true,
        outPath: outPng,
      };
      saveProgress(progress);
      continue;
    }

    try {
      assertGlobalAffiliateFormat(job.topic.format);
      const localized = await localizeWords(job);
      log(`  title: ${localized.title}`);
      for (const w of localized.words.slice(0, 3)) {
        log(`    ${w.english} → ${w.target} [${w.romanization}]`);
      }

      process.env.VOCAB_IMAGE_USE_REF = job.withCapybara ? "1" : "0";
      const prompt = buildPrompt(job, localized);
      const size = sizeForFormat(job.topic.format);
      const t0 = Date.now();
      const raw = await generateWithRetry(
        {
          prompt,
          size,
          root: ROOT,
          format: job.topic.format,
          cuteCast: job.withCapybara ? "capybara" : undefined,
          includeJjibara: job.withCapybara,
        },
        {
          maxRetries: 6,
          onRetry: ({ attempt, wait, error, label }) => {
            log(
              `  ⏳ ${label} #${attempt} wait ${Math.round(wait / 1000)}s: ${error.message}`,
            );
          },
        },
      );

      const cta = affiliateFooterCopyTeachLang(job.lang.code, job.lang.name, {
        partner: "preply",
      });
      const branded = await compositeAffiliateFooter(raw, {
        line1: cta.line1,
        line2: cta.line2,
        partner: cta.partner,
        root: ROOT,
        chicoCredit: job.withCapybara,
        cuteCast: job.withCapybara ? "capybara" : undefined,
      });
      writeFileSync(rawPng, raw);
      writeFileSync(outPng, branded);
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      const meta = {
        id: job.id,
        product: "teach_target_lang_in_english",
        wave: WAVE,
        kind: "trends",
        lang: job.lang.code,
        langName: job.lang.name,
        topicSlug: job.topic.slug,
        trendSource: job.topic.trendSource,
        format: job.topic.format,
        titleEn: localized.title,
        words: localized.words,
        withCapybara: job.withCapybara,
        footer: cta,
        outPath: outPng,
        sec,
        model: IMAGE_DEPLOY,
        at: new Date().toISOString(),
      };
      writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      progress.done[job.id] = {
        at: meta.at,
        sec,
        outPath: outPng,
        withCapybara: job.withCapybara,
        format: job.topic.format,
      };
      delete progress.failed[job.id];
      saveProgress(progress);
      ok++;
      log(`  ok ${sec}s → ${outPng}`);
    } catch (e) {
      fail++;
      const msg = e instanceof Error ? e.message : String(e);
      progress.failed[job.id] = { at: new Date().toISOString(), error: msg };
      saveProgress(progress);
      log(`  ✗ fail: ${msg}`);
    }
  }

  log(
    `\n==> trends wave done ok=${ok} skip=${skip} fail=${fail} ready≈${ok + skip}`,
  );
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
