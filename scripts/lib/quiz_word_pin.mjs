/**
 * Quiz word flashcard pins (Pinterest 1000×1500).
 *
 * Layout (only) mirrors classic word cards: English → ill → Hangul →
 * romanization + speaker → site CTA → brand.
 * Style tokens = Kaja quiz app / site (globals.css + QuizTheme).
 *
 * Destination: /vocab/detail/how-to-say/{id}/{slug}
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";
import HangulRomanize from "hangul-romanize";

import { ROOT } from "./env_local.mjs";

const { Format, Romanize } = HangulRomanize;

export const WORD_PIN_W = 1000;
export const WORD_PIN_H = 1500;
/** Kaja app / site tokens (--quiz-*) */
export const WORD_PIN_BG = "#F5F5F7";
const TEXT = "#1D1D1F";
const TEXT_SUB = "#6E6E73";
const PRIMARY = "#0071E3";
/** Inter-like on macOS via Helvetica Neue; Hangul via SD Gothic. */
const FONT_LATIN =
  "Helvetica Neue, Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif";
const FONT_HANGUL =
  "Apple SD Gothic Neo, AppleGothic, Noto Sans KR, Malgun Gothic, sans-serif";
const SITE = "https://kajakorean.com";

/** Title Case for pin display (data is often all-lower). */
function displayEnglish(english) {
  const s = String(english || "").trim();
  if (!s) return "Word";
  return s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
export function slugifyEnglish(english) {
  const base = String(english || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 72);
  return base || "word";
}

export function howToSayDestination(quizId, english, { utm = true } = {}) {
  const id = encodeURIComponent(String(quizId || "").trim());
  const slug = encodeURIComponent(slugifyEnglish(english));
  const path = `${SITE}/vocab/detail/how-to-say/${id}/${slug}`;
  if (!utm) return path;
  return `${path}?utm_source=pinterest&utm_medium=pin&utm_campaign=quiz-word-pin`;
}

export function romanizeHangul(hangul) {
  const text = String(hangul || "").trim();
  if (!text) return "";
  try {
    // Match site grammar romanization: syllable-level, lowercase RR
    const syllables = [...text].map((ch) => {
      if (!/[\uac00-\ud7a3]/.test(ch)) return ch;
      return Romanize.from(ch, { format: Format.LOWERCASE, separator: "-" }) || ch;
    });
    return syllables
      .join("-")
      .replace(/-+/g, "-")
      .replace(/^\-+|\-+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Parse approved image_mcq document into card fields.
 * @param {Record<string, unknown>} doc
 */
export function wordFieldsFromQuizDoc(doc) {
  const id = String(doc.id || doc._id || "").trim();
  const choices = Array.isArray(doc.choices) ? doc.choices : [];
  const correctId = String(doc.correctChoiceId || "").trim().toLowerCase();
  const correct =
    choices.find((c) => String(c?.id || "").trim().toLowerCase() === correctId) ||
    choices[0] ||
    {};
  const hangul = String(correct.label || correct.korean || "").trim();
  const english = String(
    doc.illustrationEnglish || correct.english || doc.answerEnglish || "",
  )
    .trim()
    .toLowerCase();
  const romanization =
    String(doc.romanization || "").trim() || romanizeHangul(hangul);
  const imageUrl = String(doc.imageUrl || "").trim();
  return {
    id,
    hangul,
    english,
    romanization,
    imageUrl,
    imageR2Key: String(doc.imageR2Key || "").trim(),
    hasExplanation: Boolean(String(doc.wordExplanation || "").trim()),
    destination: howToSayDestination(id, english),
  };
}

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fitFontSize(text, maxW, start, min, charWidth = 0.52) {
  let size = start;
  while (size > min && text.length * size * charWidth > maxW) size -= 2;
  return size;
}

/** Preferred AVK flag assets (proper Taegeukgi). Prefer PNG for fidelity. */
function resolveKoreaFlagPath() {
  const candidates = [
    "/Users/minjaekim/Desktop/projects/neo-project/auto-video-korean/korean-flag.png",
    "/Users/minjaekim/Desktop/projects/neo-project/auto-video-korean/korean-flag.svg",
    join(ROOT, "public/brand/korean-flag.png"),
    join(ROOT, "public/brand/korean-flag.svg"),
    join(ROOT, "../projects/neo-project/auto-video-korean/korean-flag.png"),
    join(ROOT, "../projects/neo-project/auto-video-korean/korean-flag.svg"),
    join(ROOT, "../neo-project/auto-video-korean/korean-flag.png"),
    join(ROOT, "../neo-project/auto-video-korean/korean-flag.svg"),
  ];
  return candidates.find((p) => existsSync(p)) || null;
}

/**
 * Load official korean-flag asset rasterized at width (3:2).
 * @param {number} flagW
 */
async function loadKoreaFlagPng(flagW = 96) {
  const path = resolveKoreaFlagPath();
  if (!path) throw new Error("korean-flag.png/.svg not found (expected in auto-video-korean)");
  const flagH = Math.max(1, Math.round(flagW * (2 / 3)));
  const pipeline = sharp(path, path.endsWith(".svg") ? { density: 300 } : {});
  const buf = await pipeline
    .resize(flagW, flagH, { fit: "fill" })
    .ensureAlpha()
    .png()
    .toBuffer();
  const meta = await sharp(buf).metadata();
  return {
    buf,
    width: meta.width || flagW,
    height: meta.height || flagH,
    path,
  };
}

/**
 * Headphones (#5 candidate).
 * @param {number} x top-left
 * @param {number} y top-left
 * @param {number} size
 * @param {string} color
 */
function speakerSvgSnippet(x, y, size = 34, color = PRIMARY) {
  const s = size / 24;
  return `
  <g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round">
    <path d="M4 13a8 8 0 0 1 16 0"/>
    <rect x="3" y="13" width="4" height="7" rx="1.5" fill="${color}" stroke="none"/>
    <rect x="17" y="13" width="4" height="7" rx="1.5" fill="${color}" stroke="none"/>
  </g>`;
}

/**
 * @param {{
 *   english: string,
 *   hangul: string,
 *   romanization: string,
 *   illustrationPng: Buffer,
 *   logoPath?: string,
 * }} opts
 * @returns {Promise<Buffer>} PNG
 */
export async function composeWordFlashcardPin(opts) {
  const w = WORD_PIN_W;
  const h = WORD_PIN_H;
  const en = displayEnglish(opts.english);
  const ko = String(opts.hangul || "").trim() || "단어";
  const rom = String(opts.romanization || "").trim() || romanizeHangul(ko);

  // Display English — rounded bold; size a bit modest so gaps read clearly
  const enSize = fitFontSize(en, w * 0.9, 68, 38, 0.5);
  const koSize = fitFontSize(ko, w * 0.88, 76, 42, 0.95);
  const romSize = fitFontSize(rom, w * 0.7, 32, 22, 0.52);

  // Illustration — trim outer transparent pads only (do not collapse
  // intentional gaps between English / ill / Hangul / rom).
  const illMaxW = Math.round(w * 0.7);
  const illMaxH = Math.round(h * 0.4);
  let illBuf;
  try {
    illBuf = await sharp(opts.illustrationPng)
      .rotate()
      .ensureAlpha()
      .trim({ threshold: 14 })
      .resize(illMaxW, illMaxH, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
  } catch {
    illBuf = await sharp(opts.illustrationPng)
      .rotate()
      .ensureAlpha()
      .resize(illMaxW, illMaxH, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
  }
  const illMeta = await sharp(illBuf).metadata();
  const illW = illMeta.width || illMaxW;
  const illH = illMeta.height || illMaxH;
  const illLeft = Math.round((w - illW) / 2);

  // Canvas top margin + airy rhythm between stack items
  // (matches pre-tightening pin: ~0.08h en→ill, ~0.07–0.08h ill→ko)
  const topPad = 150;
  const enY = topPad + Math.round(enSize * 0.9);
  const enIllGap = 72; // English → illustration
  const illTop = enY + Math.round(enSize * 0.18) + enIllGap;

  const illKoGap = Math.round(h * 0.085); // illustration → Hangul
  const koY = illTop + illH + illKoGap;
  const romBaseline = koY + Math.round(koSize * 1.4); // Hangul → romanization
  const ctaY = Math.round(h * 0.88);
  const brandY = Math.round(h * 0.94);

  const cta = "Tap the link for sound & examples.";
  const ctaSize = 22;

  // speaker + romanization row — icon vertically centered to romanization
  const iconSize = 40;
  const iconGap = 12;
  const romW = Math.max(40, Math.round(rom.length * romSize * 0.52));
  const rowW = iconSize + iconGap + romW;
  const rowLeft = Math.round((w - rowW) / 2);
  const speakerX = rowLeft;
  // Optical mid of Latin text ≈ baseline − 0.35em; slight down nudge for headphones
  const romMidY = romBaseline - romSize * 0.35;
  const speakerY = Math.round(romMidY - iconSize / 2 + 1);
  const romX = rowLeft + iconSize + iconGap;

  // System PostScript name resolves in librsvg (data-URI @font-face is flaky).
  const enFamily =
    "Arial Rounded MT Bold, Arial Rounded Bold, Helvetica Neue, sans-serif";

  const textSvg = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${WORD_PIN_BG}"/>
  <text x="${w / 2}" y="${enY}" text-anchor="middle"
    font-family="${enFamily}"
    font-size="${enSize}" font-weight="700" letter-spacing="-1.4"
    fill="${TEXT}">${escapeXml(en)}</text>
  <text x="${w / 2}" y="${koY}" text-anchor="middle"
    font-family="${FONT_HANGUL}"
    font-size="${koSize}" font-weight="800" letter-spacing="-1"
    fill="${TEXT}">${escapeXml(ko)}</text>
  ${speakerSvgSnippet(speakerX, speakerY, iconSize, PRIMARY)}
  <text x="${romX}" y="${romBaseline}" text-anchor="start"
    font-family="${FONT_LATIN}"
    font-size="${romSize}" font-weight="500" letter-spacing="-0.3"
    fill="${TEXT_SUB}">${escapeXml(rom)}</text>
  <text x="${w / 2}" y="${ctaY}" text-anchor="middle"
    font-family="${FONT_LATIN}"
    font-size="${ctaSize}" font-weight="500" letter-spacing="-0.2"
    fill="${PRIMARY}">${escapeXml(cta)}</text>
</svg>`);

  const layers = [{ input: illBuf, top: illTop, left: illLeft }];

  // Official Taegeukgi from auto-video-korean (bottom-right)
  try {
    const flagW = 90;
    const flag = await loadKoreaFlagPng(flagW);
    layers.push({
      input: flag.buf,
      top: h - flag.height - 36,
      left: w - flag.width - 36,
    });
  } catch (err) {
    console.warn(
      "[quiz-word-pin] korea flag missing:",
      err instanceof Error ? err.message : err,
    );
  }

  let canvas = await sharp(textSvg).composite(layers).png().toBuffer();

  // Brand footer: logo + “Kaja Korean”
  const logoPath =
    opts.logoPath || join(ROOT, "public/brand/logo-for-footer.png");
  if (existsSync(logoPath)) {
    const logoH = 44;
    const logoBuf = await sharp(logoPath)
      .resize({ height: logoH, fit: "inside" })
      .png()
      .toBuffer();
    const logoMeta = await sharp(logoBuf).metadata();
    const logoW = logoMeta.width || logoH;
    const brandLabel = "kajakorean.com";
    const brandFont = 20;
    const gap = 10;
    const groupW = logoW + gap + Math.round(brandLabel.length * brandFont * 0.52);
    const groupLeft = Math.round((w - groupW) / 2);
    const brandSvg = Buffer.from(`<svg width="${w}" height="70" xmlns="http://www.w3.org/2000/svg">
  <text x="${groupLeft + logoW + gap}" y="36"
    font-family="${FONT_LATIN}"
    font-size="${brandFont}" font-weight="600" letter-spacing="-0.3"
    fill="${TEXT}">${escapeXml(brandLabel)}</text>
</svg>`);
    canvas = await sharp(canvas)
      .composite([
        { input: logoBuf, top: brandY - 28, left: groupLeft },
        { input: brandSvg, top: brandY - 38, left: 0 },
      ])
      .png()
      .toBuffer();
  }

  return canvas;
}

/**
 * Download quiz illustration to buffer (png/webp).
 * @param {string} url
 */
export async function downloadImageBuffer(url) {
  const clean = String(url || "").split("?")[0];
  if (!clean) throw new Error("empty image url");
  const res = await fetch(clean, {
    headers: { "User-Agent": "kajakorean-word-pin/1.0" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`image HTTP ${res.status}: ${clean}`);
  const buf = Buffer.from(await res.arrayBuffer());
  // Normalize to PNG (flatten onto cream for opaque look)
  return sharp(buf)
    .rotate()
    .flatten({ background: WORD_PIN_BG })
    .png()
    .toBuffer();
}

/**
 * Full pipeline: compose + write jpg/png.
 */
export async function generateWordFlashcardFiles(word, outDir) {
  mkdirSync(outDir, { recursive: true });
  if (!word.imageUrl) throw new Error(`no imageUrl for ${word.id}`);
  const ill = await downloadImageBuffer(word.imageUrl);
  const pinPng = await composeWordFlashcardPin({
    english: word.english,
    hangul: word.hangul,
    romanization: word.romanization,
    illustrationPng: ill,
  });
  const safe = String(word.english || word.id)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const base = `${safe || "word"}-${String(word.id).slice(0, 8)}`;
  const pngPath = join(outDir, `${base}-word-pin.png`);
  const jpgPath = join(outDir, `${base}-word-pin.jpg`);
  writeFileSync(pngPath, pinPng);
  await sharp(pinPng)
    .resize(WORD_PIN_W, WORD_PIN_H, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
    .toFile(jpgPath);
  return { pngPath, jpgPath, pinPng };
}
