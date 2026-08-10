import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export const IMAGE_DEPLOY = "gpt-image-2";
export const LOGO_PATH = "public/brand/logo-for-footer.png";
export const FOOTER_TAGLINE = "Kaja Korean";

/**
 * Brand capybara from capybara-style-ref.png / AVK brand-mascots sheet —
 * lo-fi KakaoTalk sticker doodle (NOT webtoon Jack, NOT polished brown photo-capybara).
 */
export const CAPYBARA_MASCOT =
  "Kaja brand CAPYBARA mascot exactly like the attached doodle sheet: beige/tan pill-shaped potato body, " +
  "larger oval darker-tan snout, tiny black-dot eyes, soft pink cheek blush, short stubby limbs, " +
  "wobbly hand-drawn black outlines, flat soft fills. Friendly sticker-chibi pose (pointing / holding a prop / waving). " +
  "Optional small sidekick: same capybara wearing a vivid electric-blue baseball cap BACKWARDS.";

export const CAPYBARA_ART_STYLE =
  "Art style must match the brand CAPYBARA sticker sheet: lo-fi hand-drawn doodle / KakaoTalk sticker pack, " +
  "slightly shaky uneven black outlines, soft flat pastel fills, minimal shading, cute potato-chibi proportions. " +
  "Cream / soft pastel backgrounds. NOT polished webtoon, NOT watercolor manhwa Jack, NOT photoreal, NOT cel-anime shine.";

/** @deprecated alias — pins now use capybara doodle, not Jack. */
export const KAJA_MASCOT = CAPYBARA_MASCOT;
/** @deprecated alias */
export const KAJA_ART_STYLE = CAPYBARA_ART_STYLE;

export function resolveCharacterRefPath(root) {
  const env = process.env.VOCAB_CHARACTER_REF?.trim() || process.env.IG_VOCAB_CHARACTER_REF?.trim();
  // korean-teacher-mj lives at Desktop/korean-teacher-mj; AVK at Desktop/projects/neo-project/...
  const candidates = [
    env,
    root ? join(root, "public", "brand", "capybara-style-ref.png") : null,
    root
      ? join(
          root,
          "..",
          "projects",
          "neo-project",
          "auto-video-korean",
          "assets",
          "brand-mascots",
          "capybara-sheet.png",
        )
      : null,
    root
      ? join(
          root,
          "..",
          "neo-project",
          "auto-video-korean",
          "assets",
          "brand-mascots",
          "capybara-sheet.png",
        )
      : null,
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export const STYLE_BASE = `Premium Korean-learning Instagram/Pinterest save graphic for English-speaking beginners.
Soft pastel cream or blush background, clean modern sans-serif typography.
Illustrations MUST follow the brand CAPYBARA doodle sticker style (wobbly black outlines, flat soft fills, cute chibi props) — not photorealistic, not polished webtoon.
When a scene needs a person/mascot, cast the beige doodle CAPYBARA (and optional blue-hat sidekick) from the style reference — do NOT invent a different mascot or human teacher.
Every Korean word must show: English label, Hangul, and romanization in [brackets].
High contrast, readable on mobile, Pinterest/IG carousel quality — the kind foreigners bookmark to study later.
Warm, friendly, professional edu-influencer aesthetic.
NO website URLs, NO watermarks, NO @handles, NO logos, NO footer text anywhere in the image.
Leave a clean empty footer band (about 10% height at bottom) completely blank for branding overlay.`;

export function imageApiVersion() {
  return process.env.AZURE_OPENAI_IMAGE_API_VERSION?.trim() || "2025-04-01-preview";
}

/** Square / IG 4:5 / Pinterest 2:3 / story — keep canvas size; use translucent overlay. */
export function isSnsOptimalAspect(w, h) {
  if (!w || !h) return false;
  const r = w / h;
  const targets = [1, 4 / 5, 2 / 3, 9 / 16];
  return targets.some((t) => Math.abs(r - t) <= 0.06);
}

export async function compositeFooter(basePng, logoPath) {
  if (!existsSync(logoPath)) {
    throw new Error(`Logo not found: ${logoPath}`);
  }

  const meta = await sharp(basePng).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;
  const snsOptimal = isSnsOptimalAspect(w, h);

  const footerH = Math.max(56, Math.round(h * 0.1));
  const logoMaxH = Math.round(footerH * 0.7);
  const logoBuf = await sharp(logoPath).resize({ height: logoMaxH, fit: "inside" }).png().toBuffer();
  const logoMeta = await sharp(logoBuf).metadata();
  const logoW = logoMeta.width ?? logoMaxH;

  const label = FOOTER_TAGLINE;
  const fontSize = Math.max(15, Math.round(footerH * 0.34));
  const gap = Math.round(fontSize * 0.5);
  const textW = Math.round(label.length * fontSize * 0.48);
  const groupW = logoW + gap + textW;
  const groupLeft = Math.round((w - groupW) / 2);
  const logoTop = Math.round((footerH - logoMaxH) / 2);
  const textY = Math.round(footerH * 0.68);

  // SNS-optimal: translucent so underlying vocab stays readable.
  // Otherwise: solid bar on an extended canvas below the image.
  const footerFill = snsOptimal
    ? "rgba(255,252,248,0.38)"
    : "#FFFCF8";
  const textFill = snsOptimal ? "#1f2937" : "#374151";
  const textStroke = snsOptimal
    ? `stroke="#ffffff" stroke-width="${Math.max(2, Math.round(fontSize * 0.08))}" paint-order="stroke fill"`
    : "";

  const logoB64 = logoBuf.toString("base64");
  const footerSvg = `
<svg width="${w}" height="${footerH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${footerFill}"/>
  <image href="data:image/png;base64,${logoB64}" x="${groupLeft}" y="${logoTop}" height="${logoMaxH}" width="${logoW}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${groupLeft + logoW + gap}" y="${textY}"
    font-family="system-ui, -apple-system, Helvetica, Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="600"
    fill="${textFill}"
    ${textStroke}>${label}</text>
</svg>`;
  const footerBuf = Buffer.from(footerSvg);

  if (snsOptimal) {
    return sharp(basePng)
      .composite([{ input: footerBuf, top: h - footerH, left: 0 }])
      .png()
      .toBuffer();
  }

  const extended = await sharp(basePng)
    .extend({
      top: 0,
      bottom: footerH,
      left: 0,
      right: 0,
      background: { r: 255, g: 252, b: 248, alpha: 1 },
    })
    .png()
    .toBuffer();

  return sharp(extended)
    .composite([{ input: footerBuf, top: h, left: 0 }])
    .png()
    .toBuffer();
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const IMAGE_TIMEOUT_MS = Number(process.env.VOCAB_IMAGE_TIMEOUT_MS) || 600_000;

export function isRateLimitError(err) {
  const msg = String(err?.message || err || "");
  return /\b413\b|rate.?limit|too many requests|429|throttl/i.test(msg);
}

export function isPromptContentError(err) {
  const msg = String(err?.message || err || "").toLowerCase();
  const code = String(err?.code || err?.type || "").toLowerCase();
  return (
    err?.skipReason === "prompt" ||
    /content.?polic|content.?filter|safety system|moderation|responsible.?ai|flagged|inappropriate|violat|not allowed|cannot generate|rejected|your prompt|was blocked/i.test(
      msg,
    ) ||
    /content_filter|content_policy|safety_system|moderation_blocked|invalid_prompt/i.test(code) ||
    (err?.status === 400 && /content|prompt|policy|safety|filter|blocked/i.test(msg))
  );
}

export function isTransientError(err) {
  const msg = String(err?.message || err || "");
  const status = err?.status;
  return (
    isRateLimitError(err) ||
    status === 408 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    /timeout|aborted|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|fetch failed|network/i.test(
      msg,
    )
  );
}

function multipartBody(fields, files) {
  const seed = files[0]?.[2]?.subarray?.(0, 4096) || Buffer.from(String(Date.now()));
  const boundary = `----FormBoundary${createHash("sha1").update(seed).digest("hex").slice(0, 24)}`;
  const chunks = [];
  const push = (s) => chunks.push(Buffer.isBuffer(s) ? s : Buffer.from(s));
  for (const [name, value] of Object.entries(fields)) {
    push(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`);
  }
  for (const [name, filename, buf, ctype] of files) {
    push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: ${ctype}\r\n\r\n`,
    );
    push(buf);
    push("\r\n");
  }
  push(`--${boundary}--\r\n`);
  return { body: Buffer.concat(chunks), boundary };
}

function parseImageResponse(data, status) {
  if (!data || status >= 400) {
    const msg = data?.error?.message || data?.message || `gpt-image-2 HTTP ${status}`;
    const err = new Error(msg);
    err.status = status;
    err.code = data?.error?.code || data?.error?.type || "";
    if (isPromptContentError(err)) err.skipReason = "prompt";
    throw err;
  }
  const row = data?.data?.[0];
  if (row?.b64_json) return Buffer.from(row.b64_json, "base64");
  if (row?.url) return row.url;
  throw new Error("gpt-image-2 response missing image data");
}

async function downloadIfUrl(result) {
  if (Buffer.isBuffer(result)) return result;
  const img = await fetch(result);
  if (!img.ok) throw new Error(`image URL download failed: ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

/** Prefer images/edits with the capybara style sheet so the model actually sees the brand look. */
async function generateGptImage2WithRef({ prompt, size, root, endpoint, apiKey }) {
  const refPath = resolveCharacterRefPath(root);
  if (!refPath) return null;

  const refBuf = readFileSync(refPath);
  const suffix = refPath.toLowerCase();
  const ctype = suffix.endsWith(".jpg") || suffix.endsWith(".jpeg") ? "image/jpeg" : "image/png";
  const editPrompt =
    `Image 1 is the ONLY brand character + illustration STYLE reference (Kaja beige doodle CAPYBARA sticker sheet).\n` +
    `Match that doodle line weight, flat fills, potato-chibi proportions, and beige snout face whenever drawing mascots/illustrations.\n` +
    `Do NOT copy Korean sticker captions from Image 1. Do NOT switch to webtoon Jack or a different animal.\n\n` +
    prompt.slice(0, 3400);

  const { body, boundary } = multipartBody(
    {
      prompt: editPrompt,
      model: IMAGE_DEPLOY,
      n: "1",
      size: String(size),
      quality: "high",
      input_fidelity: "high",
    },
    [["image[]", "capybara-style-ref.png", refBuf, ctype]],
  );

  const url = `${endpoint}/openai/deployments/${encodeURIComponent(IMAGE_DEPLOY)}/images/edits?api-version=${encodeURIComponent(imageApiVersion())}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
    signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
  });
  const data = await res.json().catch(() => null);
  return downloadIfUrl(parseImageResponse(data, res.status));
}

export async function generateGptImage2({ prompt, size, root }) {
  const endpoint = (
    process.env.AZURE_OPENAI_IMAGE_ENDPOINT ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    ""
  )
    .trim()
    .replace(/\/+$/, "");
  const apiKey = (
    process.env.AZURE_OPENAI_IMAGE_API_KEY ||
    process.env.AZURE_OPENAI_API_KEY ||
    ""
  ).trim();
  if (!endpoint || !apiKey) {
    throw new Error(
      "Missing AZURE_OPENAI_IMAGE_ENDPOINT/API_KEY (or AZURE_OPENAI_ENDPOINT/API_KEY)",
    );
  }

  const useRef =
    process.env.VOCAB_IMAGE_USE_REF !== "0" && Boolean(resolveCharacterRefPath(root));
  if (useRef) {
    try {
      return await generateGptImage2WithRef({ prompt, size, root, endpoint, apiKey });
    } catch (e) {
      // Fall back to text-only generations if edits reject the payload.
      if (isPromptContentError(e)) throw e;
      console.warn(`  ⚠ style-ref edit failed, falling back to generations: ${e.message}`);
    }
  }

  const url = `${endpoint}/openai/deployments/${encodeURIComponent(IMAGE_DEPLOY)}/images/generations?api-version=${encodeURIComponent(imageApiVersion())}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      prompt: prompt.slice(0, 3900),
      model: IMAGE_DEPLOY,
      n: 1,
      size,
      quality: "high",
      output_format: "png",
    }),
    signal: AbortSignal.timeout(IMAGE_TIMEOUT_MS),
  });

  const data = await res.json().catch(() => null);
  return downloadIfUrl(parseImageResponse(data, res.status));
}

export async function generateWithRetry(
  opts,
  { maxRetries = Infinity, baseWaitMs = 30_000, onRetry } = {},
) {
  let attempt = 0;
  while (true) {
    try {
      return await generateGptImage2(opts);
    } catch (e) {
      if (isPromptContentError(e)) throw e;
      attempt += 1;
      const transient = isTransientError(e);
      if (!transient && attempt >= 3) throw e;
      if (Number.isFinite(maxRetries) && attempt > maxRetries) throw e;
      const wait = Math.min(baseWaitMs * Math.min(attempt, 20), 300_000);
      const label = transient ? "transient" : "retry";
      if (onRetry) onRetry({ attempt, wait, error: e, label });
      else {
        console.warn(
          `  ⏳ ${label} (attempt ${attempt}) — wait ${Math.round(wait / 1000)}s: ${e.message}`,
        );
      }
      await sleep(wait);
    }
  }
}

export function sizeForFormat(format) {
  if (format === "grid_cluster" || format === "phrase_square") return "1024x1024";
  return "1024x1536";
}

function formatQuizOptions(quiz) {
  return quiz.options
    .map((opt, i) => `${i + 1}. ${opt.hangul} [${opt.romanization}]`)
    .join("\n");
}

export function buildPrompt(bundle) {
  const title = bundle.title.replace(/ in Korean$/i, "").trim();
  const upperTitle = title.toUpperCase();

  if (bundle.format === "quiz_comment" && bundle.quiz) {
    const q = bundle.quiz;
    const badge = q.badge || "KOREAN WORD QUIZ";
    const direction = q.direction || "English → Korean";
    const options = formatQuizOptions(q);
    return `${STYLE_BASE}

FORMAT: Comment-bait vocabulary QUIZ card (portrait 4:5). Clean blue-and-white edu-influencer layout like a language quiz post.
TOP LEFT: rounded blue badge with book icon + "${badge}" in white caps.
TOP RIGHT: "${direction}" with small blue motion lines.
CENTER: bold black question — ${q.question}
LEFT COLUMN: four stacked white rounded option cards with thin blue border, large blue number circles:
${options}
RIGHT SIDE: ${CAPYBARA_MASCOT}
${CAPYBARA_ART_STYLE}
ABOVE FOOTER BAND: light blue rounded CTA bar with lightbulb icon + "Try to answer before checking the comments! ↓"
CRITICAL: Do NOT highlight, circle, or mark the correct answer. All four options look equally neutral.`;
  }

  if (bundle.format === "grid_cluster") {
    const n = bundle.count === 4 ? 4 : bundle.count === 16 ? 16 : 9;
    const grid = n === 4 ? "2×2" : n === 16 ? "4×4" : "3×3";
    const preview = bundle.preview?.length
      ? `\nInclude these English topics (add accurate Hangul + romanization for each):\n${bundle.preview.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
      : `\nInvent ${n} parallel, same-category Korean vocabulary items (concrete nouns or parallel adjectives).`;
    return `${STYLE_BASE}

FORMAT: ${grid} grid infographic titled "${title} in Korean" at top center.
${n} cells — each with cute illustration + English + Hangul + [romanization]. Even spacing, readable on phone.${preview}`;
  }

  if (bundle.format === "antonym_split") {
    const m = bundle.title.match(/^(.+?)\s+vs\s+(.+)$/i);
    const left = m?.[1]?.trim() || "Left";
    const right = m?.[2]?.trim() || "Right";
    return `${STYLE_BASE}

FORMAT: Vertical split antonym card. Header: "KOREAN" bold centered.
LEFT half (warm pastel): scene for ${left} — English label, accurate Hangul, [romanization].
RIGHT half (cool pastel): scene for ${right} — English label, accurate Hangul, [romanization].
Mirrored layout, one pair only, contrasting moods.`;
  }

  if (bundle.format === "similar_split") {
    const p = bundle.similarPair;
    const m = bundle.title.match(/^(.+?)\s+vs\s+(.+)$/i);
    const leftEn = p?.leftEnglish || m?.[1]?.trim() || "Left";
    const rightEn = p?.rightEnglish || m?.[2]?.trim() || "Right";
    const leftKo = p
      ? `"${p.leftHangul}" [${p.leftRom}] — nuance: ${p.leftNuance}`
      : "accurate Hangul + [romanization] + tiny nuance gloss";
    const rightKo = p
      ? `"${p.rightHangul}" [${p.rightRom}] — nuance: ${p.rightNuance}`
      : "accurate Hangul + [romanization] + tiny nuance gloss";
    return `${STYLE_BASE}

FORMAT: Vertical split SIMILAR-WORDS card (NOT antonyms — near-synonyms / confusable pair learners mix up).
Header: "${title}" bold centered in ENGLISH (the pair title, e.g. "${leftEn} vs ${rightEn}"). Optional small subtitle "Similar words" under it ok.
HARD BAN for header: do NOT use Korean "비슷한 말" / Hangul title text — English speakers scan the English pair name.
Soft pastel both sides — mint vs peach or cream vs blush — NOT day/night opposite drama.
LEFT half: scene for ${leftEn} — English label, Hangul ${leftKo}.
RIGHT half: scene for ${rightEn} — English label, Hangul ${rightKo}.
Mirrored layout, one pair only. Difference shown through situation + tiny nuance badge under each Hangul.
HARD BAN: treating them as opposites; cramming extra words; tiny unreadable nuance text.`;
  }

  if (bundle.format === "concept_rows" && bundle.conceptRows?.length) {
    const panels = bundle.conceptRows
      .map(
        (r, i) =>
          `PANEL ${i + 1}: Hangul "${r.hangul}" largest, then [${r.romanization}], small English "${r.english}".\n` +
          `  Scene (keep SIMPLE): ${r.visual}`,
      )
      .join("\n");
    return `${STYLE_BASE}

FORMAT: Original Kaja CONCEPT PANEL card titled "${bundle.title}" (bold, friendly). Soft cream + sky-teal accents.
Layout: ${bundle.conceptRows.length === 4 ? "2×2 rounded cards" : "stacked rounded cards"} with equal spacing.
ART STYLE — simpler than usual grids:
- Soft flat pastel / light watercolor, minimal shading
- Each panel: ONE clear idea, 1–2 people max, 0–2 props max
- Clean empty or nearly-empty background (no busy rooms, no crowded tables, no tiny background text)
- Large readable Hangul; English is a small gloss
- Think "kids flashcard clarity" not "detailed webtoon page"

HARD BAN:
- crowded multi-person scenes, dense backgrounds, lots of props/signage
- rows of stick-figure / person pictograms with red ovals or X marks
- left text column + right icon diagram split
- Korean flags, finger-heart logos, "save for later" badges

${panels}
Leave empty footer band blank.`;
  }

  if (bundle.format === "topik_upgrade" && bundle.topikRows?.length) {
    const rows = bundle.topikRows
      .map(
        (r, i) =>
          `${i + 1}. ${r.english}\n` +
          `   TOPIK I:  ${r.topikI.hangul}  [${r.topikI.romanization}]\n` +
          `   TOPIK II: ${r.topikII.hangul}  [${r.topikII.romanization}]`,
      )
      .join("\n");
    return `${STYLE_BASE}

FORMAT: TOPIK I ↔ TOPIK II upgrade card titled "${bundle.title}". Portrait soft cream-to-blush (NOT stark white meme screenshot).
HEADER: twin rounded pill badges side by side — soft teal "TOPIK I" (left) and soft coral/rose "TOPIK II" (right). Small friendly subtitle under title ok.
BODY: exactly ${bundle.topikRows.length} horizontally aligned rows in two clean columns.
LEFT column = beginner/casual Hangul (largest) + small [romanization].
RIGHT column = more formal/exam Hangul (largest) + small [romanization].
Tiny English meaning can sit faintly between columns or as a left gutter gloss — Hangul must dominate.
Generous spacing, scannable on phone. Optional tiny ORIGINAL cute footer vibe stickers (simple student doodle left / polished learner doodle right) — soft pastel, not photoreal.
HARD BAN: dog memes, IELTS branding, competitor watermarks/@handles, purple clone of English synonym memes, denser than ${bundle.topikRows.length} rows.
PAIRS (use exactly):
${rows}
Leave empty footer band blank.`;
  }

  if (bundle.format === "phrase_stack" && bundle.phraseLines?.length) {
    const lines = bundle.phraseLines
      .map(
        (p, i) =>
          `${i + 1}. ${p.hangul}  [${p.romanization}]  — ${p.english}`,
      )
      .join("\n");
    const mood = bundle.fit?.includes("café") || /cafe|café/i.test(bundle.title)
      ? "café tray / iced drink motif"
      : /feeling|how are you/i.test(bundle.title)
        ? "soft chat bubbles + phone glow"
        : "friendly meetup / calendar motif";
    return `${STYLE_BASE}

FORMAT: Polished DAILY PHRASE STACK titled "${bundle.title}". Portrait soft cream-to-blush gradient (NOT plain stark white document).
HEADER: bold friendly title + small teal pill badge "Daily Korean" + tiny watercolor header illustration (${mood}).
BODY: exactly ${bundle.phraseLines.length} stacked rounded row cards with generous spacing (NOT a dense 15+ line dump).
Each row: teal circle number badge | Hangul largest and boldest | muted [romanization] | soft English gloss on the right or below.
Light hairline separators or soft card shadows. High mobile readability.
HARD BAN: plain Notepad/Word aesthetic, tiny crammed lists, competitor watermarks, vulgar slang.
PHRASES (use exactly):
${lines}
Leave empty footer band blank.`;
  }

  const rows = bundle.preview?.length
    ? bundle.preview.map((p, i) => `${i + 1}. ${p}`).join("\n")
    : `Invent ${Math.max(bundle.count, 9)} ordered items for "${title}" with clear ordering (numbers, values, or sequence).`;

  return `${STYLE_BASE}

FORMAT: Tall portrait list titled "${upperTitle} IN KOREAN" at top.
${bundle.count}+ rows in a scannable table. Left column: anchor (number, icon, or swatch). Right: Hangul + [romanization].
All rows must fit — scale text smaller if needed, nothing cropped at bottom.
${rows}`;
}

export async function buildQuizPromptWithRef(bundle, root) {
  const base = buildPrompt(bundle);
  const refPath = resolveCharacterRefPath(root);
  if (!refPath || bundle.format !== "quiz_comment") return base;

  try {
    const { azureChat, stripCodeFence } = await import("./azure_chat.mjs");
    const b64 = readFileSync(refPath).toString("base64");
    const system = `You output ONE raw English string: an image-generation prompt for GPT-image class.
No quotes, no markdown, no preamble. The image model cannot see the reference — translate the attached character/style into concrete words.`;

    const user = [
      {
        type: "text",
        text: `Attached image = brand CAPYBARA doodle sticker sheet, the ONLY character + illustration style reference.

The quiz card's RIGHT-SIDE character MUST be the beige doodle CAPYBARA from this sheet (potato body, oval snout, black-dot eyes, wobbly outlines). Optional tiny blue-hat sidekick ok.
Do NOT draw Jack/human webtoon boy, kimono anime, photoreal animals, or a different mascot.

Keep this quiz layout exactly (question, 4 options, CTA bar, footer band empty):
${base}

Write ONE image prompt (max ~3200 chars) merging the layout above with the reference capybara character and doodle art style.`,
      },
      { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
    ];

    const raw = await azureChat({ system, user, temperature: 0.4, maxTokens: 2000 });
    const prompt = stripCodeFence(raw).replace(/^["']|["']$/g, "").trim();
    if (prompt.length > 200) return prompt.slice(0, 3900);
  } catch (e) {
    console.warn(`  ⚠ quiz prompt vision fallback: ${e.message}`);
  }
  return base;
}

export async function buildImagePrompt(bundle, root) {
  if (bundle.format === "quiz_comment") {
    return buildQuizPromptWithRef(bundle, root);
  }
  return buildPrompt(bundle);
}
