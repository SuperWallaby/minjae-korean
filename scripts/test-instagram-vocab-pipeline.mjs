#!/usr/bin/env node
/**
 * POC: scrape IG + Pinterest → vision classify word-list → gpt-image restyle → QA fix.
 * Usage: node scripts/test-instagram-vocab-pipeline.mjs [--source all|ig|pinterest] [--restyle-only] [--qa-only]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { collectPinterestVocabCandidates } from "./lib/pinterest-vocab-collect.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
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
loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const PROFILES = [
  "your_korean_teacher_",
  "koreantutor_lee",
  "korean_ms.lee",
  "strong.koreann",
];
const MIN_LIKES = 500;
const OUT = path.join(ROOT, ".tmp", "ig-vocab-pipeline-test");
const IG_HEADERS = {
  "User-Agent": "Mozilla/5.0",
  "X-IG-App-ID": "936619743392459",
};

const AZ_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/+$/, "");
const AZ_KEY = process.env.AZURE_OPENAI_API_KEY;
const CHAT_DEPLOY =
  process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.split(",")[0]?.trim() ||
  process.env.AZURE_OPENAI_DEPLOYMENT_CHAT ||
  process.env.AZURE_OPENAI_DEPLOYMENT ||
  "trx-gpt-4-1-mini";
const IMAGE_DEPLOY =
  process.env.AZURE_OPENAI_DEPLOYMENT_IMAGE?.trim() || "gpt-image-2";
const CHAT_VER = process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
const IMAGE_VER =
  process.env.AZURE_OPENAI_IMAGE_API_VERSION || "2025-04-01-preview";

const doRestyle = process.argv.includes("--restyle");
const restyleOnly = process.argv.includes("--restyle-only");
const qaOnly = process.argv.includes("--qa-only");
const skipQa = process.argv.includes("--no-qa");
const forceQa = process.argv.includes("--force-qa");
const forceRestyle = process.argv.includes("--force-restyle");
const codeFilter = (() => {
  const flag = process.argv.find((a) => a.startsWith("--code="));
  if (flag) return flag.slice("--code=".length).trim();
  const idx = process.argv.indexOf("--code");
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1].trim();
  return null;
})();
const sourceMode = (() => {
  if (process.argv.includes("--pinterest-only")) return "pinterest";
  if (process.argv.includes("--ig-only")) return "ig";
  const flag = process.argv.find((a) => a.startsWith("--source="));
  if (flag) return flag.slice("--source=".length).trim().toLowerCase();
  const idx = process.argv.indexOf("--source");
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1].trim().toLowerCase();
  return "all";
})();
const pinterestLimit = (() => {
  const flag = process.argv.find((a) => a.startsWith("--pinterest-limit="));
  if (flag) return Math.max(1, parseInt(flag.slice("--pinterest-limit=".length), 10) || 30);
  const idx = process.argv.indexOf("--pinterest-limit");
  if (idx >= 0 && process.argv[idx + 1]) {
    return Math.max(1, parseInt(process.argv[idx + 1], 10) || 30);
  }
  return 30;
})();
const pinterestQueries = (() => {
  const flag = process.argv.find((a) => a.startsWith("--pinterest-query="));
  const raw = flag
    ? flag.slice("--pinterest-query=".length)
    : (() => {
        const idx = process.argv.indexOf("--pinterest-query");
        return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : "";
      })();
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
})();
const useIg = sourceMode === "all" || sourceMode === "ig";
const usePinterest = sourceMode === "all" || sourceMode === "pinterest";
const rebuildReport = process.argv.includes("--rebuild-report");
const restyleAll = process.argv.includes("--all");
const restyleLimit = (() => {
  if (restyleAll) return Number.POSITIVE_INFINITY;
  const flag = process.argv.find((a) => a.startsWith("--limit="));
  if (flag) return Math.max(1, parseInt(flag.slice("--limit=".length), 10) || 5);
  const idx = process.argv.indexOf("--limit");
  if (idx >= 0 && process.argv[idx + 1]) {
    return Math.max(1, parseInt(process.argv[idx + 1], 10) || 5);
  }
  if (restyleOnly) return Number.POSITIVE_INFINITY;
  return doRestyle ? 5 : 1;
})();

/** Per-image order shuffle direction — reorder rows, not grid/layout template. */
const ORDER_VARIANTS = [
  "Reverse the vocabulary row order: last item becomes first, first becomes last. Every row must move.",
  "Reorder rows by Korean alphabetical order (가나다).",
  "Put the most beginner-friendly everyday words at the top; less common phrases toward the bottom.",
  "Swap odd and even rows (1↔2, 3↔4, …) so the sequence clearly differs from the source.",
  "Shuffle row order noticeably — the sequence must NOT match the source top-to-bottom order.",
];

const RESTYLE_OUTPUT_SIZE = process.env.IG_VOCAB_RESTYLE_SIZE?.trim() || "1024x1536";

const RESTYLE_PROMPT_BASE = `Restyle this Korean vocabulary list infographic for Kaja Korean (kajakorean.com).

IMAGE ROLES:
- Image 1: source vocabulary infographic (extract all vocabulary rows from here).
- Image 2: Kaja logo — place "kajakorean.com" + this logo bottom-right, fully visible.
- Image 3: Kaja character STYLE reference ONLY — use when replacing people (do not copy Image 3's exact scene).

CONTENT (keep every item — change ORDER, not wording):
- Keep every Korean word, English translation, and romanization — same meanings, same count.
- Do NOT add or remove vocabulary items.
- REORDER the vocabulary rows — do NOT keep the same top-to-bottom sequence as Image 1.

CHARACTERS (critical when Image 1 has people):
- If Image 1 contains ANY human, teacher mascot, branded avatar, stick-figure person, or cartoon character with a face: REPLACE them with NEW original Kaja characters drawn in the style of Image 3.
- Match Image 3's technique only (soft 2D Korean educational webtoon, thin clean outlines, gentle pastel watercolor, friendly expressive faces) — do NOT copy Image 3's exact pose, outfit, or composition.
- Do NOT keep the source creator's mascot, likeness, branded character, or recognizable person.
- Keep only the teaching role/emotion/gesture when helpful (pointing, thinking, reacting).
- If Image 1 has NO people or mascots, do NOT add characters.

PRESENTATION:
- Clean readable Kaja template: warm cream background, friendly educational illustration, legible typography.
- Keep a simple list structure (rows or numbered items) — focus on changing ORDER, not inventing a new layout system.
- Use a TALL PORTRAIT layout matching the source — fit EVERY vocabulary row fully inside the frame (nothing cropped at top or bottom).
- Scale rows smaller if needed so the full list is visible; never cut off the last items.
- Title: clear and readable (may rephrase slightly for Kaja, but keep the same topic).

VISUAL STYLE:
- Replace any competitor watermark, @handle, URL, or logo with "kajakorean.com" and the logo from Image 2.
- No extra captions or hashtags on the image.`;

function restylePromptForIndex(i, hasHumanFigure = false) {
  const orderRule = ORDER_VARIANTS[i % ORDER_VARIANTS.length];
  const characterExtra = hasHumanFigure
    ? "\n\nThis source image HAS human/mascot characters — you MUST replace every one with new Kaja-style characters per Image 3. Do not leave any original person or competitor mascot."
    : "";
  return `${RESTYLE_PROMPT_BASE}\n\nOrder direction for this image: ${orderRule}${characterExtra}`;
}

function resolveCharacterRefPath() {
  const envPath = process.env.IG_VOCAB_CHARACTER_REF?.trim();
  const candidates = [
    envPath,
    path.join(ROOT, "public", "brand", "character-style-ref.png"),
    path.join(ROOT, "..", "projects", "neo-project", "auto-video-korean", "refrefref.png"),
    path.join(ROOT, "..", "neo-project", "auto-video-korean", "assets", "refrefref.png"),
  ].filter(Boolean);
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function mergeResultsByCode(existing, incoming) {
  const byCode = new Map();
  for (const row of existing) byCode.set(row.code, row);
  for (const row of incoming) byCode.set(row.code, row);
  return [...byCode.values()];
}

function loadReportFile(reportPath) {
  if (!fs.existsSync(reportPath)) return { results: [], wordLists: [] };
  try {
    return JSON.parse(fs.readFileSync(reportPath, "utf8"));
  } catch {
    return { results: [], wordLists: [] };
  }
}

function scanIgRowsFromDisk() {
  const rows = [];
  for (const profile of PROFILES) {
    const prefix = `${profile}_`;
    for (const file of fs.readdirSync(OUT)) {
      if (!file.startsWith(prefix) || !file.endsWith(".jpg")) continue;
      const code = file.slice(prefix.length, -4);
      rows.push({
        source: "instagram",
        profile,
        code,
        likes: 0,
        isVideo: false,
        url: "",
        caption: "",
        permalink: `https://www.instagram.com/p/${code}/`,
        localImage: path.join(OUT, file),
      });
    }
  }
  return rows;
}

function scanPinterestRowsFromDisk() {
  const rows = [];
  for (const file of fs.readdirSync(OUT)) {
    if (!file.startsWith("pin_") || !file.endsWith(".jpg")) continue;
    const pinId = file.slice("pin_".length, -4);
    const code = `pin_${pinId}`;
    rows.push({
      source: "pinterest",
      profile: "pinterest",
      code,
      pinId,
      likes: 0,
      isVideo: false,
      url: "",
      caption: "",
      permalink: `https://www.pinterest.com/pin/${pinId}/`,
      localImage: path.join(OUT, file),
    });
  }
  return rows;
}

async function classifyLocalRow(row) {
  if (!row.localImage || !fs.existsSync(row.localImage)) return row;
  if (row.classification) return row;
  const buf = fs.readFileSync(row.localImage);
  const cls = await azureChatVision(
    buf.toString("base64"),
    row.caption,
    row.profile || row.source,
  );
  return { ...row, classification: cls };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchIgProfileGrid(username) {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;
  const raw = execFileSync(
    "curl",
    [
      "-sL",
      "-A",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "-H",
      "X-IG-App-ID: 936619743392459",
      "-H",
      `Referer: https://www.instagram.com/${username}/`,
      url,
    ],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  );
  const data = JSON.parse(raw);
  const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];
  return edges.map((e) => {
    const n = e.node;
    const caps = n.edge_media_to_caption?.edges ?? [];
    return {
      profile: username,
      code: n.shortcode,
      likes: n.edge_liked_by?.count ?? 0,
      isVideo: Boolean(n.is_video),
      url: n.display_url,
      caption: caps[0]?.node?.text?.slice(0, 200) ?? "",
      permalink: `https://www.instagram.com/p/${n.shortcode}/`,
    };
  });
}

async function downloadImage(url, dest) {
  const buf = execFileSync(
    "curl",
    ["-sL", "-A", "Mozilla/5.0", url],
    { maxBuffer: 20 * 1024 * 1024 },
  );
  fs.writeFileSync(dest, buf);
  return buf;
}

async function azureChatVision(imageB64, caption, profile) {
  const url = `${AZ_ENDPOINT}/openai/deployments/${encodeURIComponent(CHAT_DEPLOY)}/chat/completions?api-version=${encodeURIComponent(CHAT_VER)}`;
  const system = `You classify Korean-learning Instagram carousel/single images.
Return ONLY valid JSON:
{"isWordList":boolean,"confidence":0-1,"reason":"short English","topic":"short English","hasBrandMark":boolean,"hasHumanFigure":boolean,"sampleWords":["up to 6 Korean or English word pairs"]}

isWordList=true when the MAIN content is a vocabulary/phrase list (multiple words or expressions with translations, numbered/bulleted lists, emoji+word grids, "expressions for X", body-part words, color words, etc.).
hasHumanFigure=true when the image shows any human, humanoid mascot, teacher avatar, stick-figure person, or cartoon character with a face (not just emoji icons).
false for: pure memes, single quote, grammar essay, video thumbnail text only, fashion photo without word list, proverbs without word list layout.`;
  const body = {
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Profile @${profile}. Caption: ${caption || "(none)"}\nIs this a word-list style Korean lesson image?`,
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageB64}` },
          },
        ],
      },
    ],
    max_completion_tokens: 800,
    temperature: 0.1,
    response_format: { type: "json_object" },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": AZ_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `vision HTTP ${res.status}: ${data?.error?.message ?? JSON.stringify(data).slice(0, 200)}`,
    );
  }
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  return JSON.parse(text);
}

function multipartBody(fields, files) {
  const boundary = `----IgVocab${Date.now()}`;
  const chunks = [];
  const push = (s) => chunks.push(Buffer.from(s));
  for (const [k, v] of Object.entries(fields)) {
    push(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`);
  }
  for (const [name, filename, buf, ctype] of files) {
    push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: ${ctype}\r\n\r\n`,
    );
    chunks.push(buf);
    push("\r\n");
  }
  push(`--${boundary}--\r\n`);
  return { body: Buffer.concat(chunks), boundary };
}

async function azureImageEdit(sourceBuf, logoBuf, characterRefBuf, prompt, sourceMime = "image/jpeg") {
  const url = `${AZ_ENDPOINT}/openai/deployments/${encodeURIComponent(IMAGE_DEPLOY)}/images/edits?api-version=${encodeURIComponent(IMAGE_VER)}`;
  const sourceName = sourceMime.includes("png") ? "source.png" : "source.jpg";
  const files = [
    ["image[]", sourceName, sourceBuf, sourceMime],
    ["image[]", "logo.png", logoBuf, "image/png"],
  ];
  if (characterRefBuf) {
    files.push(["image[]", "character-ref.png", characterRefBuf, "image/png"]);
  }
  const { body, boundary } = multipartBody(
    {
      prompt: prompt.slice(0, 3900),
      model: IMAGE_DEPLOY,
      n: "1",
      size: RESTYLE_OUTPUT_SIZE,
      quality: "high",
      input_fidelity: "high",
    },
    files,
  );
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": AZ_KEY,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `edit HTTP ${res.status}: ${data?.error?.message ?? JSON.stringify(data).slice(0, 300)}`,
    );
  }
  const row = data.data?.[0];
  if (row?.b64_json) return Buffer.from(row.b64_json, "base64");
  if (row?.url) {
    const img = await fetch(row.url);
    return Buffer.from(await img.arrayBuffer());
  }
  throw new Error("edit response missing image");
}

const QA_DEPLOY =
  process.env.IG_VOCAB_QA_DEPLOYMENT?.trim() ||
  process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.split(",")[0]?.trim() ||
  CHAT_DEPLOY;

const FIX_PROMPT_HEAD = `Image 1 is a Kaja Korean vocabulary infographic draft that needs targeted fixes only.
Image 2: Kaja logo — keep "kajakorean.com" + this logo bottom-right, fully visible.
Image 3 (if attached): Kaja character style reference — use only when replacing people/mascots.

Rules for this fix pass:
- Change ONLY what is listed below — do not redesign the whole page.
- Keep all CORRECT vocabulary rows (Korean, English, romanization) exactly as they are.
- Keep warm cream Kaja educational style and readable typography.
- No competitor @handles, watermarks, or hashtags.`;

async function azureRestyleQa({ originalB64, restyledB64, topic, caption }) {
  const url = `${AZ_ENDPOINT}/openai/deployments/${encodeURIComponent(QA_DEPLOY)}/chat/completions?api-version=${encodeURIComponent(CHAT_VER)}`;
  const system = `You QA a Kaja Korean vocabulary infographic after AI restyle.

Compare Image 1 (IG original) vs Image 2 (Kaja restyle). Think step-by-step, then return JSON only:
{
  "reasoning": "2-5 sentences: what matches, what is wrong",
  "needsFix": boolean,
  "severity": "none"|"low"|"medium"|"high",
  "issues": ["specific problem 1", "problem 2"],
  "fixPrompt": "short English instructions for an image editor to fix ONLY the problems"
}

Flag needsFix=true when ANY of these appear in the RESTYLE (Image 2):
- Missing, added, or wrong vocabulary rows vs original (count or meanings)
- Garbled / misspelled Korean, English, or romanization
- Duplicate vocabulary rows that should appear once
- Competitor @handle, watermark, or logo still visible
- Original teacher mascot / human likeness not replaced with Kaja-style characters
- kajakorean.com or Kaja logo missing or illegible
- Severely clipped, overlapping, or unreadable text
- Nonsense extra text, hashtags, or UI junk added

Do NOT flag as an issue:
- Different row ORDER from the original (reordering is intentional)
- Minor cosmetic style differences that do not affect readability

severity=none when the restyle is publish-ready; low for tiny cosmetic nits; medium/high when learners would be confused.

fixPrompt: imperative bullets the image model can follow (max ~400 chars). Empty string if needsFix=false.`;

  const body = {
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Topic: ${topic || "Korean vocabulary"}\nCaption: ${caption || "(none)"}\nImage 1 = original IG post. Image 2 = Kaja restyle draft to review.`,
          },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${originalB64}` } },
          { type: "image_url", image_url: { url: `data:image/png;base64,${restyledB64}` } },
        ],
      },
    ],
    max_completion_tokens: 2000,
    temperature: 0.2,
    response_format: { type: "json_object" },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": AZ_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `qa HTTP ${res.status}: ${data?.error?.message ?? JSON.stringify(data).slice(0, 200)}`,
    );
  }
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  const parsed = JSON.parse(text);
  return {
    reasoning: String(parsed.reasoning ?? "").trim(),
    needsFix: Boolean(parsed.needsFix),
    severity: String(parsed.severity ?? "none").toLowerCase(),
    issues: Array.isArray(parsed.issues)
      ? parsed.issues.map((x) => String(x).trim()).filter(Boolean)
      : [],
    fixPrompt: String(parsed.fixPrompt ?? "").trim(),
    reviewedAt: new Date().toISOString(),
  };
}

function qaReportPath(code) {
  return path.join(OUT, "qa", `${code}.json`);
}

function readQaReport(code) {
  const p = qaReportPath(code);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function writeQaReport(code, report) {
  fs.mkdirSync(path.join(OUT, "qa"), { recursive: true });
  fs.writeFileSync(qaReportPath(code), JSON.stringify(report, null, 2));
}

function buildFixImagePrompt(qa) {
  const bullets =
    qa.issues.length > 0
      ? qa.issues.map((issue, i) => `${i + 1}. ${issue}`).join("\n")
      : qa.fixPrompt;
  const tail = qa.fixPrompt && qa.issues.length > 0 ? `\n\nEditor notes: ${qa.fixPrompt}` : "";
  return `${FIX_PROMPT_HEAD}\n\nFix these problems:\n${bullets}${tail}`.slice(0, 3900);
}

async function runQaAndFix({
  pick,
  outPath,
  logoBuf,
  characterRefBuf,
  qaReports,
}) {
  const cached = !forceQa ? readQaReport(pick.code) : null;
  if (cached && !forceQa && (cached.fixed || !cached.needsFix)) {
    console.log(`     qa skip ${pick.code} (cached ${cached.severity})`);
    qaReports.push({ code: pick.code, ...cached });
    return cached;
  }

  const originalB64 = fs.readFileSync(pick.localImage).toString("base64");
  const restyledB64 = fs.readFileSync(outPath).toString("base64");
  console.log(`     qa review ${pick.code}…`);
  const qa = await azureRestyleQa({
    originalB64,
    restyledB64,
    topic: pick.classification?.topic,
    caption: pick.caption,
  });
  console.log(`       severity=${qa.severity} needsFix=${qa.needsFix}`);
  console.log(`       ${qa.reasoning.slice(0, 160)}${qa.reasoning.length > 160 ? "…" : ""}`);

  let fixed = false;
  const shouldFix =
    qa.needsFix &&
    qa.severity !== "none" &&
    qa.severity !== "low" &&
    (qa.fixPrompt || qa.issues.length > 0);

  if (shouldFix) {
    try {
      console.log(`     fix ${pick.code} (${qa.issues.length} issue(s))…`);
      const draftBuf = fs.readFileSync(outPath);
      const fixBuf = await azureImageEdit(
        draftBuf,
        logoBuf,
        characterRefBuf,
        buildFixImagePrompt(qa),
        "image/png",
      );
      fs.writeFileSync(outPath, fixBuf);
      fixed = true;
      console.log(`       fixed → ${path.basename(outPath)}`);
      await sleep(800);
    } catch (e) {
      console.warn(`       fix fail ${pick.code}: ${e.message}`);
      qa.fixError = e.message;
    }
  }

  const report = { ...qa, fixed, outPath };
  writeQaReport(pick.code, report);
  qaReports.push({ code: pick.code, ...report });
  return report;
}

function readScheduledCodes() {
  const p = path.join(OUT, "scheduled.json");
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return {};
  }
}

function buildTweetText(topic) {
  const t = (topic || "Korean vocabulary").trim().slice(0, 80);
  return `🇰🇷 ${t}\n\nSave this & practice out loud 👇\n\n#koreanvocab #learnkorean #kajakorean #한국어`.slice(
    0,
    280,
  );
}

function buildHtml({ results, wordLists, restyled, qaByCode = {} }) {
  const scheduled = readScheduledCodes();
  const restyleMap = Object.fromEntries(restyled.map((r) => [r.code, r]));
  return `<!doctype html>
<meta charset=utf-8>
<title>Vocab pipeline (IG + Pinterest)</title>
<style>
body{font-family:system-ui;background:#0f0f12;color:#eee;padding:20px;max-width:1400px;margin:0 auto}
h1,h2{margin:0 0 12px}
.sub{color:#9ca3af;margin-bottom:20px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
.card{background:#1a1a22;border-radius:14px;padding:12px;border:2px solid #333}
.card.ok{border-color:#4ade80}.card.no{border-color:#555}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pair img{width:100%;border-radius:8px;background:#000;object-fit:contain;max-height:520px}
.lbl{font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em}
.meta{font-size:13px;color:#d1d5db;margin:8px 0}
.btn{margin-top:8px;padding:8px 12px;border:0;border-radius:8px;background:#f59e0b;color:#111;font-weight:700;cursor:pointer}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn.scheduled{background:#374151;color:#9ca3af}
.toast{position:fixed;bottom:20px;right:20px;background:#111827;border:1px solid #374151;padding:12px 16px;border-radius:10px;display:none}
</style>
<h1>Vocab pipeline</h1>
<p class="sub">${wordLists.length} word-list / ${results.length} analyzed · restyled ${restyled.length} · IG + Pinterest · preview server 예약</p>
<div class="g">
${results
  .map((r) => {
    const c = r.classification;
    const cls = c?.isWordList ? "ok" : "no";
    const orig = path.basename(r.localImage);
    const rs = restyleMap[r.code];
    const restyleBlock = rs
      ? `<div><div class="lbl">Kaja restyle</div><img src="${path.basename(rs.outPath)}"></div>`
      : `<div><div class="lbl">Kaja restyle</div><div class="meta">—</div></div>`;
    const sched = scheduled[r.code];
    const qa = qaByCode[r.code];
    const qaLine = qa
      ? `<p class="meta" style="color:${qa.fixed ? "#86efac" : qa.needsFix ? "#fca5a5" : "#9ca3af"}">QA: ${qa.severity}${qa.fixed ? " · fixed" : qa.needsFix ? " · needs fix" : " · ok"}</p>`
      : "";
    const btn = rs
      ? sched
        ? `<button class="btn scheduled" disabled>예약됨 · ${sched.queueId?.slice(0, 8) ?? "ok"}</button>`
        : `<button class="btn" data-code="${r.code}" data-topic="${(c?.topic ?? "").replace(/"/g, "&quot;")}">예약 포스팅</button>`
      : "";
    const sourceLabel =
      r.source === "pinterest"
        ? "📌 Pinterest"
        : "📷 IG";
    return `<div class="card ${cls}">
  <div class="pair">
    <div><div class="lbl">Original</div><img src="${orig}"></div>
    ${restyleBlock}
  </div>
  <p class="meta"><b>${sourceLabel}</b> · @${r.profile} · ${r.likes > 0 ? `${r.likes}♥ · ` : ""}${c?.isWordList ? "✓ word-list" : "✗"} (${c?.confidence})${c?.hasHumanFigure ? " · 👤 character" : ""}</p>
  <p class="meta">${c?.reason ?? ""}</p>
  ${qaLine}
  ${btn}
  <a href="${r.permalink}" style="color:#7dd3fc;font-size:13px">${r.source === "pinterest" ? "Pinterest 원본" : "IG 원본"}</a>
</div>`;
  })
  .join("\n")}
</div>
<div id="toast" class="toast"></div>
<script>
document.querySelectorAll('.btn[data-code]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const code = btn.dataset.code;
    const topic = btn.dataset.topic || '';
    btn.disabled = true;
  btn.textContent = '예약 중…';
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, topic })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || 'failed');
      btn.textContent = '예약됨';
      btn.classList.add('scheduled');
      const t = document.getElementById('toast');
      t.style.display = 'block';
      t.textContent = 'X 큐에 등록됨 · ' + (data.queueId || '').slice(0,8);
      setTimeout(() => { t.style.display = 'none'; }, 4000);
    } catch (e) {
      btn.disabled = false;
      btn.textContent = '예약 포스팅';
      alert(e.message || '예약 실패');
    }
  });
});
</script>`;
}

async function main() {
  if (!AZ_ENDPOINT || !AZ_KEY) {
    console.error("Missing AZURE_OPENAI_ENDPOINT / AZURE_OPENAI_API_KEY");
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  let posts = [];
  let results = [];
  const reportPath = path.join(OUT, "report.json");

  if (rebuildReport) {
    console.log("↺ rebuild-report: scan local images + re-classify…");
    const diskRows = [...scanIgRowsFromDisk(), ...scanPinterestRowsFromDisk()];
    console.log(`   found ${diskRows.length} local images (IG + Pinterest)`);
    for (const row of diskRows) {
      try {
        const classified = await classifyLocalRow(row);
        results.push(classified);
        const cls = classified.classification;
        console.log(
          `  ${classified.code} → wordList=${cls?.isWordList} (${cls?.confidence ?? "?"})`,
        );
        await sleep(300);
      } catch (e) {
        console.warn(`  skip ${row.code}: ${e.message}`);
      }
    }
  } else if ((restyleOnly || qaOnly) && fs.existsSync(reportPath)) {
    const saved = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    results = saved.results ?? [];
    posts = saved.scanned ? Array(saved.scanned) : [];
    console.log(`↺ ${qaOnly ? "qa-only" : "restyle-only"}: ${results.length} cached results`);
  } else {
    let igCount = 0;
    let pinterestCount = 0;

    if (useIg) {
      console.log("1) Fetch IG grids (12 recent posts / profile)…");
      for (const p of PROFILES) {
        await sleep(900);
        try {
          const grid = await fetchIgProfileGrid(p);
          posts.push(...grid.map((row) => ({ ...row, source: "instagram" })));
          console.log(`  @${p}: ${grid.length} posts`);
        } catch (e) {
          console.warn(`  @${p}: ${e.message}`);
        }
      }

      const hot = posts.filter((p) => !p.isVideo && p.likes >= MIN_LIKES && p.url);
      console.log(`\n2) IG: ${hot.length} images with ${MIN_LIKES}+ likes\n`);

      for (const post of hot) {
        const imgPath = path.join(OUT, `${post.profile}_${post.code}.jpg`);
        try {
          const buf = await downloadImage(post.url, imgPath);
          console.log(`  dl ${post.code} (${post.likes}♥)…`);
          const cls = await azureChatVision(buf.toString("base64"), post.caption, post.profile);
          const row = { ...post, source: "instagram", classification: cls, localImage: imgPath };
          results.push(row);
          igCount += 1;
          console.log(
            `    → wordList=${cls.isWordList} conf=${cls.confidence} brand=${cls.hasBrandMark} human=${cls.hasHumanFigure} | ${cls.reason}`,
          );
          await sleep(400);
        } catch (e) {
          console.warn(`  skip ${post.code}: ${e.message}`);
        }
      }
    }

    if (usePinterest) {
      console.log(`\n${useIg ? "3" : "1"}) Pinterest search (korean)…`);
      const pinPosts = await collectPinterestVocabCandidates({
        queries: pinterestQueries.length ? pinterestQueries : undefined,
        limit: pinterestLimit,
      });
      console.log(`   collected ${pinPosts.length} pin image candidates\n`);

      for (const post of pinPosts) {
        const imgPath = path.join(OUT, `${post.code}.jpg`);
        try {
          const buf = await downloadImage(post.url, imgPath);
          console.log(`  dl ${post.code}…`);
          const cls = await azureChatVision(
            buf.toString("base64"),
            post.caption,
            post.profile || "pinterest",
          );
          const row = { ...post, classification: cls, localImage: imgPath };
          results.push(row);
          pinterestCount += 1;
          console.log(
            `    → wordList=${cls.isWordList} conf=${cls.confidence} human=${cls.hasHumanFigure} | ${cls.reason}`,
          );
          await sleep(400);
        } catch (e) {
          console.warn(`  skip ${post.code}: ${e.message}`);
        }
      }
    }

    console.log(`\nCollected: IG=${igCount} Pinterest=${pinterestCount} (source=${sourceMode})`);
  }

  const wordLists = results
    .filter((r) => r.classification?.isWordList)
    .filter((r) => !codeFilter || r.code === codeFilter);
  if (rebuildReport || (!restyleOnly && !qaOnly)) {
    const prior = loadReportFile(reportPath);
    let merged = results;
    if (!rebuildReport && sourceMode === "pinterest") {
      const keep = (prior.results ?? []).filter((r) => r.source !== "pinterest");
      merged = mergeResultsByCode(keep, results);
      console.log(`\n↺ merged report: kept ${keep.length} non-Pinterest + ${results.length} new`);
    } else if (!rebuildReport && sourceMode === "ig") {
      const keep = (prior.results ?? []).filter((r) => r.source !== "instagram");
      merged = mergeResultsByCode(keep, results);
      console.log(`\n↺ merged report: kept ${keep.length} non-IG + ${results.length} new`);
    }
    results = merged;
    const savedWordLists = results.filter((r) => r.classification?.isWordList);
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          scanned: posts.length,
          hot: results.length,
          sourceMode: rebuildReport ? "rebuild" : sourceMode,
          results,
          wordLists: savedWordLists,
        },
        null,
        2,
      ),
    );
  }

  console.log(`\n3) Summary: ${wordLists.length}/${results.length} classified as word-list`);

  const logoPath = path.join(ROOT, "public", "brand", "logo-for-footer.png");
  const fallbackLogo = path.join(ROOT, "logo-app.png");
  const logoFile = fs.existsSync(logoPath) ? logoPath : fallbackLogo;
  const logoBuf = fs.readFileSync(logoFile);

  const characterRefFile = resolveCharacterRefPath();
  const characterRefBuf = characterRefFile ? fs.readFileSync(characterRefFile) : null;
  if (characterRefBuf) {
    console.log(`   character ref: ${characterRefFile}`);
  } else {
    console.warn("   ⚠ no character style ref (set IG_VOCAB_CHARACTER_REF or add public/brand/character-style-ref.png)");
  }

  const restyled = [];
  const qaReports = [];
  const runRestyle = (doRestyle || restyleOnly) && !qaOnly;
  const runQa = !skipQa && (runRestyle || qaOnly);
  if (runRestyle && wordLists.length > 0) {
    const cap = Number.isFinite(restyleLimit) ? restyleLimit : wordLists.length;
    const picks = [...wordLists].sort((a, b) => b.likes - a.likes).slice(0, cap);
    console.log(`\n4) Restyle ×${picks.length} (reorder variants)…`);
    for (let i = 0; i < picks.length; i++) {
      const pick = picks[i];
      const outPath = path.join(OUT, `${pick.code}_kaja_restyle.png`);
      if (fs.existsSync(outPath) && !forceRestyle) {
        console.log(`   skip ${pick.code} (exists)`);
        restyled.push({ code: pick.code, outPath, skipped: true });
        continue;
      }
      try {
        console.log(`   → ${pick.code} (${pick.likes}♥) order#${i % ORDER_VARIANTS.length} human=${pick.classification?.hasHumanFigure ?? "?"}`);
        const sourceBuf = fs.readFileSync(pick.localImage);
        const outBuf = await azureImageEdit(
          sourceBuf,
          logoBuf,
          characterRefBuf,
          restylePromptForIndex(i, pick.classification?.hasHumanFigure),
        );
        fs.writeFileSync(outPath, outBuf);
        restyled.push({ code: pick.code, outPath });
        console.log(`     saved ${path.basename(outPath)}`);
        await sleep(800);
      } catch (e) {
        console.warn(`     fail ${pick.code}: ${e.message}`);
      }
    }
  } else if (runRestyle) {
    console.log("\n4) No word-list candidates to restyle.");
  } else {
    // pick up existing restyles for preview / qa-only
    for (const r of wordLists) {
      const outPath = path.join(OUT, `${r.code}_kaja_restyle.png`);
      if (fs.existsSync(outPath)) restyled.push({ code: r.code, outPath });
    }
    if (!qaOnly) {
      console.log("\nRun with --restyle-only [--all] [--force-restyle] to generate Kaja versions.");
    }
  }

  if (runQa) {
    const qaPicks = wordLists
      .filter((r) => fs.existsSync(path.join(OUT, `${r.code}_kaja_restyle.png`)))
      .sort((a, b) => b.likes - a.likes);
    const cap = Number.isFinite(restyleLimit) && !qaOnly ? restyleLimit : qaPicks.length;
    const limited = qaOnly ? qaPicks : qaPicks.slice(0, cap);
    console.log(`\n5) QA review${runRestyle ? " + fix" : ""} ×${limited.length}…`);
    for (const pick of limited) {
      const outPath = path.join(OUT, `${pick.code}_kaja_restyle.png`);
      try {
        await runQaAndFix({ pick, outPath, logoBuf, characterRefBuf, qaReports });
        await sleep(500);
      } catch (e) {
        console.warn(`     qa fail ${pick.code}: ${e.message}`);
      }
    }
    fs.writeFileSync(
      path.join(OUT, "qa-report.json"),
      JSON.stringify(
        {
          reviewed: qaReports.length,
          fixed: qaReports.filter((r) => r.fixed).length,
          needsFix: qaReports.filter((r) => r.needsFix && !r.fixed).length,
          reports: qaReports,
        },
        null,
        2,
      ),
    );
  }

  const qaByCode = Object.fromEntries(qaReports.map((r) => [r.code, r]));
  for (const r of restyled) {
    const cached = readQaReport(r.code);
    if (cached && !qaByCode[r.code]) qaByCode[r.code] = cached;
  }

  fs.writeFileSync(path.join(OUT, "index.html"), buildHtml({ results, wordLists, restyled, qaByCode }));
  console.log(`\nPreview: node scripts/ig-vocab-preview-server.mjs`);
  console.log(`         → http://127.0.0.1:5197/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
