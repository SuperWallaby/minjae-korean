#!/usr/bin/env node
/**
 * Global Pinterest pins: teach TARGET language in English (not Korean).
 * Text-only · NO mascot · language-swap list · Preply affiliate footer.
 *
 *   # 2-week buffer: 14 topics × 6 langs = 84 pins
 *   npx tsx scripts/generate-global-lang-en-samples.ts --all
 *   npx tsx scripts/generate-global-lang-en-samples.ts --limit 10
 *   npx tsx scripts/generate-global-lang-en-samples.ts --offset 20 --limit 20
 *   npx tsx scripts/generate-global-lang-en-samples.ts --force --id 01_eye-colors__es
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

import { azureChat, stripCodeFence } from "./lib/azure_chat.mjs";
import {
  IMAGE_DEPLOY,
  compositeAffiliateFooter,
  generateWithRetry,
  PINTEREST_MOBILE_THUMB,
} from "./lib/vocab-infographic-gen.mjs";
import { affiliateFooterCopyTeachLang } from "./lib/global-pinterest-formats.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "global-lang-en-samples");
const LOG = join(OUT, "batch.log");
const PROGRESS = join(OUT, "progress.json");

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
type Topic = {
  rank: number;
  slug: string;
  titleEn: (langName: string) => string;
  englishWords: WordSeed[];
};
type Job = {
  id: string;
  lang: Lang;
  titleEn: string;
  format: "super_list";
  englishWords: WordSeed[];
  topicSlug: string;
};

/** Target 6 languages (Preply share + Japanese). */
const LANGS: Lang[] = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ar", name: "Arabic" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
];

/** 14 topics ≈ 2 weeks × 1 pin/day/lang. */
const TOPICS: Topic[] = [
  {
    rank: 1,
    slug: "eye-colors",
    titleEn: (L) => `Eye colors in ${L}`,
    englishWords: [
      { english: "black", visual: "dark brown-black iris swatch" },
      { english: "brown", visual: "warm brown iris" },
      { english: "hazel", visual: "hazel green-brown iris" },
      { english: "green", visual: "green iris" },
      { english: "blue", visual: "blue iris" },
      { english: "gray", visual: "gray iris" },
      { english: "light blue", visual: "pale blue iris" },
      { english: "violet", visual: "violet iris" },
      { english: "amber", visual: "amber/gold iris" },
    ],
  },
  {
    rank: 2,
    slug: "months",
    titleEn: (L) => `Months in ${L}`,
    englishWords: [
      { english: "January", visual: "snowflake / scarf season" },
      { english: "February", visual: "heart / Valentine vibe" },
      { english: "March", visual: "spring sprouts" },
      { english: "April", visual: "cherry blossom" },
      { english: "May", visual: "flower bouquet" },
      { english: "June", visual: "rainy leaf" },
      { english: "July", visual: "sun / iced drink" },
      { english: "August", visual: "beach / sandcastle" },
      { english: "September", visual: "backpack / school" },
      { english: "October", visual: "autumn leaf" },
      { english: "November", visual: "cozy blanket" },
      { english: "December", visual: "gift / winter hat" },
    ],
  },
  {
    rank: 3,
    slug: "foods",
    titleEn: (L) => `Foods in ${L}`,
    englishWords: [
      { english: "bread", visual: "baguette loaf" },
      { english: "cheese", visual: "cheese wedge" },
      { english: "wine", visual: "wine glass" },
      { english: "coffee", visual: "coffee cup" },
      { english: "croissant", visual: "croissant pastry" },
      { english: "soup", visual: "bowl of soup" },
      { english: "salad", visual: "salad bowl" },
      { english: "chicken", visual: "roast chicken" },
      { english: "fish", visual: "whole fish" },
      { english: "dessert", visual: "cake slice" },
    ],
  },
  {
    rank: 4,
    slug: "emotions",
    titleEn: (L) => `Emotions in ${L}`,
    englishWords: [
      { english: "happy", visual: "simple smile emoji icon" },
      { english: "sad", visual: "tear drop face icon" },
      { english: "angry", visual: "steam angry face icon" },
      { english: "tired", visual: "sleepy zzz icon" },
      { english: "surprised", visual: "wide eyes icon" },
      { english: "scared", visual: "nervous sweat icon" },
      { english: "proud", visual: "star / chest out icon" },
      { english: "lonely", visual: "alone figure icon" },
      { english: "excited", visual: "sparkle bounce icon" },
      { english: "calm", visual: "peaceful leaf icon" },
    ],
  },
  {
    rank: 5,
    slug: "family",
    titleEn: (L) => `Family in ${L}`,
    englishWords: [
      { english: "mom", visual: "simple mom figure icon" },
      { english: "dad", visual: "simple dad figure icon" },
      { english: "brother", visual: "young man / sibling icon" },
      { english: "sister", visual: "young woman / sibling icon" },
      { english: "grandma", visual: "grandma figure icon" },
      { english: "grandpa", visual: "grandpa figure icon" },
      { english: "baby", visual: "baby bottle / crib icon" },
      { english: "uncle", visual: "uncle wave icon" },
      { english: "aunt", visual: "aunt wave icon" },
      { english: "cousin", visual: "two friends icon" },
    ],
  },
  {
    rank: 6,
    slug: "numbers",
    titleEn: (L) => `Numbers 1–10 in ${L}`,
    englishWords: [
      { english: "one", visual: "number 1 badge icon" },
      { english: "two", visual: "number 2 badge icon" },
      { english: "three", visual: "number 3 badge icon" },
      { english: "four", visual: "number 4 badge icon" },
      { english: "five", visual: "number 5 badge icon" },
      { english: "six", visual: "number 6 badge icon" },
      { english: "seven", visual: "number 7 badge icon" },
      { english: "eight", visual: "number 8 badge icon" },
      { english: "nine", visual: "number 9 badge icon" },
      { english: "ten", visual: "number 10 badge icon" },
    ],
  },
  {
    rank: 7,
    slug: "weather",
    titleEn: (L) => `Weather words in ${L}`,
    englishWords: [
      { english: "sunny", visual: "sun icon" },
      { english: "cloudy", visual: "cloud icon" },
      { english: "rainy", visual: "rain drops icon" },
      { english: "snowy", visual: "snowflake icon" },
      { english: "windy", visual: "wind swirl icon" },
      { english: "hot", visual: "thermometer hot icon" },
      { english: "cold", visual: "thermometer cold / ice icon" },
      { english: "foggy", visual: "fog mist icon" },
      { english: "stormy", visual: "lightning bolt icon" },
      { english: "humid", visual: "water droplet steam icon" },
    ],
  },
  {
    rank: 8,
    slug: "body-parts",
    titleEn: (L) => `Body parts in ${L}`,
    englishWords: [
      { english: "head", visual: "simple head outline icon" },
      { english: "eye", visual: "eye icon" },
      { english: "ear", visual: "ear icon" },
      { english: "nose", visual: "nose icon" },
      { english: "mouth", visual: "lips / smile icon" },
      { english: "hand", visual: "hand icon" },
      { english: "foot", visual: "foot icon" },
      { english: "arm", visual: "arm icon" },
      { english: "leg", visual: "leg icon" },
      { english: "heart", visual: "heart icon" },
    ],
  },
  {
    rank: 9,
    slug: "school",
    titleEn: (L) => `School supplies in ${L}`,
    englishWords: [
      { english: "book", visual: "book icon" },
      { english: "pen", visual: "pen icon" },
      { english: "pencil", visual: "pencil icon" },
      { english: "notebook", visual: "notebook icon" },
      { english: "bag", visual: "backpack icon" },
      { english: "desk", visual: "desk icon" },
      { english: "eraser", visual: "eraser icon" },
      { english: "ruler", visual: "ruler icon" },
      { english: "scissors", visual: "scissors icon" },
      { english: "glue", visual: "glue bottle icon" },
    ],
  },
  {
    rank: 10,
    slug: "colors",
    titleEn: (L) => `Basic colors in ${L}`,
    englishWords: [
      { english: "red", visual: "red circle swatch" },
      { english: "blue", visual: "blue circle swatch" },
      { english: "yellow", visual: "yellow circle swatch" },
      { english: "green", visual: "green circle swatch" },
      { english: "orange", visual: "orange circle swatch" },
      { english: "purple", visual: "purple circle swatch" },
      { english: "pink", visual: "pink circle swatch" },
      { english: "brown", visual: "brown circle swatch" },
      { english: "black", visual: "black circle swatch" },
      { english: "white", visual: "white outline circle swatch" },
    ],
  },
  {
    rank: 11,
    slug: "weekdays",
    titleEn: (L) => `Days of the week in ${L}`,
    englishWords: [
      { english: "Monday", visual: "calendar M icon" },
      { english: "Tuesday", visual: "calendar T icon" },
      { english: "Wednesday", visual: "calendar W icon" },
      { english: "Thursday", visual: "calendar Th icon" },
      { english: "Friday", visual: "calendar F icon" },
      { english: "Saturday", visual: "weekend party icon" },
      { english: "Sunday", visual: "rest / sun icon" },
    ],
  },
  {
    rank: 12,
    slug: "pets",
    titleEn: (L) => `Pets & animals in ${L}`,
    englishWords: [
      { english: "dog", visual: "cute dog face icon (animal, not mascot character)" },
      { english: "cat", visual: "cute cat face icon" },
      { english: "bird", visual: "bird icon" },
      { english: "fish", visual: "fish icon" },
      { english: "rabbit", visual: "rabbit face icon" },
      { english: "hamster", visual: "hamster face icon" },
      { english: "horse", visual: "horse head icon" },
      { english: "turtle", visual: "turtle icon" },
      { english: "frog", visual: "frog icon" },
      { english: "butterfly", visual: "butterfly icon" },
    ],
  },
  {
    rank: 13,
    slug: "cafe",
    titleEn: (L) => `Café words in ${L}`,
    englishWords: [
      { english: "coffee", visual: "coffee cup icon" },
      { english: "tea", visual: "tea cup icon" },
      { english: "milk", visual: "milk carton icon" },
      { english: "sugar", visual: "sugar cube icon" },
      { english: "water", visual: "water glass icon" },
      { english: "juice", visual: "juice glass icon" },
      { english: "menu", visual: "menu card icon" },
      { english: "bill", visual: "receipt icon" },
      { english: "table", visual: "cafe table icon" },
      { english: "straw", visual: "straw icon" },
    ],
  },
  {
    rank: 14,
    slug: "greetings",
    titleEn: (L) => `Greetings in ${L}`,
    englishWords: [
      { english: "hello", visual: "wave hand icon" },
      { english: "goodbye", visual: "door / wave bye icon" },
      { english: "please", visual: "polite bow icon" },
      { english: "thank you", visual: "heart thank you icon" },
      { english: "sorry", visual: "apologetic face icon" },
      { english: "yes", visual: "green check icon" },
      { english: "no", visual: "red x icon" },
      { english: "excuse me", visual: "hand raise icon" },
      { english: "good morning", visual: "sunrise icon" },
      { english: "good night", visual: "moon / stars icon" },
    ],
  },
];

function buildAllJobs(): Job[] {
  const jobs: Job[] = [];
  for (const topic of TOPICS) {
    const pad = String(topic.rank).padStart(2, "0");
    for (const lang of LANGS) {
      jobs.push({
        id: `${pad}_${topic.slug}__${lang.code}`,
        lang,
        titleEn: topic.titleEn(lang.name),
        format: "super_list",
        englishWords: topic.englishWords,
        topicSlug: topic.slug,
      });
    }
  }
  return jobs;
}

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

async function localizeWords(job: Job) {
  const payload = {
    titleEn: job.titleEn,
    lang: job.lang.name,
    words: job.englishWords.map((w) => w.english),
  };
  const system = `You localize vocabulary for English speakers learning ${job.lang.name}.
Return ONLY JSON:
{
  "title": "English title keeping the pattern '${job.titleEn}' (may lightly polish)",
  "words": [{"english":"...","target":"word in ${job.lang.name}","romanization":"latin pronunciation aid"}]
}
Rules:
- target = natural ${job.lang.name} flashcard form (correct orthography).
- For Arabic: include Arabic script as target; romanization in Latin letters.
- For Japanese: Kana/Kanji as appropriate for beginners; Hepburn romanization.
- romanization = simple learner-friendly Latin pronunciation.
- Keep the same order and count as input english words.
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
    title: String(parsed.title).trim() || job.titleEn,
    words: job.englishWords.map((w, i) => {
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

function buildPrompt(
  job: Job,
  localized: {
    title: string;
    words: {
      english: string;
      visual: string;
      target: string;
      romanization: string;
    }[];
  },
) {
  const rows = localized.words
    .map(
      (w, i) =>
        `${i + 1}. TARGET "${w.target}" (largest) / [${w.romanization}] — English "${w.english}" — icon: ${w.visual}`,
    )
    .join("\n");

  return `Premium language-learning Pinterest save graphic for ENGLISH speakers learning ${job.lang.name}.
${PINTEREST_MOBILE_THUMB}
Soft pastel cream or blush background, clean modern sans-serif typography.
Cute simple sticker/doodle OBJECT icons only (flat soft fills, friendly) — not photorealistic.

NO CHARACTERS / NO MASCOTS (CRITICAL):
- Do NOT draw capybara, otter, bear, animal mascot, human, sidekick, or any character.
- Left column = small theme OBJECT icons / color swatches only.
- Pet topics: simple animal face icons OK, not branded characters.

PRODUCT LOCK (CRITICAL):
- This pin teaches ${job.lang.name} vocabulary to English speakers.
- Largest text on each row = the ${job.lang.name} word.
- Supporting text = English meaning + romanization in [brackets].
- Title in ENGLISH: "${localized.title}"
- ZERO Korean / Hangul / 한국어 anywhere on the image.

FORMAT: Tall portrait list titled "${localized.title.toUpperCase()}" at top (English).
Scannable rows. Left: small theme icon/swatch. Right: LARGE ${job.lang.name} word + [romanization] + English gloss.
Generous row height. Nothing cropped at bottom.
NO website URLs, NO watermarks, NO @handles, NO logos, NO footer text in the image.
Leave a clean empty footer band (~10% height) blank for branding overlay.

ROWS (exact lock):
${rows}`;
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const all = argv.includes("--all") || argv.includes("--weeks=2");
  const limitIdx = argv.indexOf("--limit");
  const offsetIdx = argv.indexOf("--offset");
  const idIdx = argv.indexOf("--id");
  const onlyId =
    idIdx >= 0 && argv[idIdx + 1]
      ? argv[idIdx + 1]
      : argv.find((a) => a.startsWith("--id="))?.slice(5) || "";

  const allJobs = buildAllJobs();
  let jobs = allJobs;
  if (onlyId) {
    jobs = allJobs.filter((j) => j.id === onlyId);
  } else {
    const offset =
      offsetIdx >= 0 && argv[offsetIdx + 1]
        ? Math.max(0, Number(argv[offsetIdx + 1]) || 0)
        : 0;
    const limit =
      limitIdx >= 0 && argv[limitIdx + 1]
        ? Math.max(1, Number(argv[limitIdx + 1]) || 1)
        : all
          ? allJobs.length
          : 2;
    jobs = allJobs.slice(offset, offset + limit);
  }

  process.env.VOCAB_IMAGE_USE_REF = "0";

  mkdirSync(OUT, { recursive: true });
  const progress = loadProgress();

  log(
    `==> global lang-en wave jobs=${jobs.length}/${allJobs.length} topics=${TOPICS.length} langs=${LANGS.map((l) => l.code).join(",")} model=${IMAGE_DEPLOY} force=${force}`,
  );
  log(`    out=${OUT}`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const outPng = join(OUT, `${job.id}.png`);
    const rawPng = join(OUT, `${job.id}_raw.png`);
    const metaPath = join(OUT, `${job.id}.json`);
    log(
      `\n[${i + 1}/${jobs.length}] ${job.id} — teach ${job.lang.name} via English · icons only`,
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
      const localized = await localizeWords(job);
      log(`  title: ${localized.title}`);
      for (const w of localized.words.slice(0, 3)) {
        log(`    ${w.english} → ${w.target} [${w.romanization}]`);
      }

      const prompt = buildPrompt(job, localized);
      const t0 = Date.now();
      const raw = await generateWithRetry(
        {
          prompt,
          size: "1024x1536",
          root: ROOT,
          format: "super_list",
          includeJjibara: false,
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
        chicoCredit: false,
      });
      writeFileSync(rawPng, raw);
      writeFileSync(outPng, branded);
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      const meta = {
        id: job.id,
        product: "teach_target_lang_in_english",
        lang: job.lang.code,
        langName: job.lang.name,
        topicSlug: job.topicSlug,
        titleEn: localized.title,
        words: localized.words,
        footer: cta,
        styleRef: false,
        mascot: false,
        outPath: outPng,
        sec,
        model: IMAGE_DEPLOY,
        at: new Date().toISOString(),
      };
      writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      progress.done[job.id] = { at: meta.at, sec, outPath: outPng };
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
    `\n==> wave done ok=${ok} skip=${skip} fail=${fail} (files with png+json ready for pin)`,
  );
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
