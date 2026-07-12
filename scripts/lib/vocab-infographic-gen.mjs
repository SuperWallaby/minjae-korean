import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export const IMAGE_DEPLOY = "gpt-image-2";
export const LOGO_PATH = "public/brand/logo-for-footer.png";
export const FOOTER_TAGLINE = "What is this in Korean?";

/** Kaja boy from refrefref.png — soft watercolor webtoon (NOT capybara, NOT kimono anime). */
export const KAJA_MASCOT =
  "Kaja boy character exactly like brand refrefref.png: young Korean man in soft watercolor digital webtoon style, " +
  "thin soft brown outlines, pink blush on cheeks, large round dark eyes, black hair under a backwards blue baseball cap, " +
  "beige oatmeal oversized hoodie, dark backpack strap visible. Friendly smile, pointing at the quiz options.";

export const KAJA_ART_STYLE =
  "Art style must match refrefref.png: soft watercolor/marker webtoon, hand-drawn soft brown outlines, " +
  "pastel cream/beige/sky-blue palette, gentle shading, cozy slice-of-life mood — NOT flat cel-anime, NOT capybara.";

export function resolveCharacterRefPath(root) {
  const env = process.env.VOCAB_CHARACTER_REF?.trim() || process.env.IG_VOCAB_CHARACTER_REF?.trim();
  const candidates = [
    env,
    root ? join(root, "refrefref.png") : null,
    root ? join(root, "public", "brand", "character-style-ref.png") : null,
    root ? join(root, "..", "auto-video-korean", "refrefref.png") : null,
    root ? join(root, "..", "projects", "neo-project", "auto-video-korean", "refrefref.png") : null,
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export const STYLE_BASE = `Premium Korean-learning Instagram save graphic for English-speaking beginners.
Soft pastel cream or blush background, clean modern sans-serif typography, cute colorful semi-flat illustrations (not photorealistic).
Every Korean word must show: English label, Hangul, and romanization in [brackets].
High contrast, readable on mobile, Pinterest/IG carousel quality — the kind foreigners bookmark to study later.
Warm, friendly, professional edu-influencer aesthetic.
NO website URLs, NO watermarks, NO @handles, NO logos, NO footer text anywhere in the image.
Leave a clean empty footer band (about 10% height at bottom) completely blank for branding overlay.`;

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

export async function generateGptImage2({ prompt, size, root }) {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  if (!endpoint || !apiKey) {
    throw new Error("Missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY");
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
  if (!res.ok) {
    const msg = data?.error?.message || data?.message || `gpt-image-2 HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.code = data?.error?.code || data?.error?.type || "";
    if (isPromptContentError(err)) err.skipReason = "prompt";
    throw err;
  }
  const row = data?.data?.[0];
  if (row?.b64_json) return Buffer.from(row.b64_json, "base64");
  if (row?.url) {
    const img = await fetch(row.url);
    if (!img.ok) throw new Error(`image URL download failed: ${img.status}`);
    return Buffer.from(await img.arrayBuffer());
  }
  throw new Error("gpt-image-2 response missing image data");
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

export async function compositeFooter(basePng, logoPath) {
  if (!existsSync(logoPath)) {
    throw new Error(`Logo not found: ${logoPath}`);
  }

  const meta = await sharp(basePng).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 1024;

  const footerH = Math.round(h * 0.1);
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

  const logoB64 = logoBuf.toString("base64");
  const footerSvg = `
<svg width="${w}" height="${footerH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="rgba(255,252,248,0.96)"/>
  <image href="data:image/png;base64,${logoB64}" x="${groupLeft}" y="${logoTop}" height="${logoMaxH}" width="${logoW}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${groupLeft + logoW + gap}" y="${textY}"
    font-family="system-ui, -apple-system, Helvetica, Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="600"
    fill="#374151">${label}</text>
</svg>`;

  return sharp(basePng)
    .composite([{ input: Buffer.from(footerSvg), top: h - footerH, left: 0 }])
    .png()
    .toBuffer();
}

export function sizeForFormat(format) {
  if (format === "grid_cluster") return "1024x1024";
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
RIGHT SIDE: ${KAJA_MASCOT}
${KAJA_ART_STYLE}
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
        text: `Attached image = refrefref.png, the ONLY character + illustration style reference.

The quiz card's RIGHT-SIDE character MUST be the young man from this reference (backwards blue baseball cap, beige hoodie, watercolor webtoon look).
Do NOT draw capybara, kimono, cel-anime, or a different person.

Keep this quiz layout exactly (question, 4 options, CTA bar, footer band empty):
${base}

Write ONE image prompt (max ~3200 chars) merging the layout above with the reference character and art style.`,
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
