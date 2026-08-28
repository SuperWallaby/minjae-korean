/**
 * Grammar spotlight pin — Eggbun-style bilingual highlight card.
 * Illustration (no text) + SVG Hangul/English with parallel coral spans.
 */
import sharp from "sharp";

export const GRAMMAR_PIN_W = 1024;
export const GRAMMAR_PIN_H = 1536;
export const GRAMMAR_PIN_BG = "#FBF3E6";
export const GRAMMAR_TEXT = "#1A1A1A";
export const GRAMMAR_HIGHLIGHT = "#E86A2B";

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fitFontSize(text, maxWidth, maxSize, minSize, charFactor) {
  const len = Math.max(1, String(text || "").length);
  let size = maxSize;
  while (size > minSize && len * size * charFactor > maxWidth) size -= 2;
  return size;
}

/**
 * @param {{
 *   illustrationPng: Buffer,
 *   koreanBefore: string,
 *   koreanHighlight: string,
 *   koreanAfter?: string,
 *   englishBefore: string,
 *   englishHighlight: string,
 *   englishAfter?: string,
 *   grammarLabel?: string,
 * }} opts
 */
export async function composeGrammarSpotlightPin(opts) {
  const w = GRAMMAR_PIN_W;
  const h = GRAMMAR_PIN_H;
  const koB = String(opts.koreanBefore || "");
  const koH = String(opts.koreanHighlight || "");
  const koA = String(opts.koreanAfter || "");
  const enB = String(opts.englishBefore || "");
  const enH = String(opts.englishHighlight || "");
  const enA = String(opts.englishAfter || "");
  const koFull = `${koB}${koH}${koA}`;
  const enFull = `${enB}${enH}${enA}`;

  // Leave room for brand footer overlay (~10–12%).
  const footerReserve = Math.round(h * 0.12);
  const contentH = h - footerReserve;

  // Subject should read large on mobile — trim empty cream from the AI canvas,
  // then scale the subject up (old layout left a huge dead zone under tiny art).
  const illMaxW = Math.round(w * 0.78);
  const illMaxH = Math.round(contentH * 0.5);
  let illBuf = await sharp(opts.illustrationPng)
    .rotate()
    .ensureAlpha()
    .resize(Math.round(w * 0.92), Math.round(h * 0.72), {
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  try {
    illBuf = await sharp(illBuf).trim({ threshold: 14 }).png().toBuffer();
  } catch {
    /* keep untrimmed */
  }
  illBuf = await sharp(illBuf)
    .resize(illMaxW, illMaxH, { fit: "inside", withoutEnlargement: false })
    .png()
    .toBuffer();

  const illMeta = await sharp(illBuf).metadata();
  const illW = illMeta.width || illMaxW;
  const illH = illMeta.height || illMaxH;

  const koSize = fitFontSize(koFull, w * 0.88, 68, 38, 0.95);
  const enSize = fitFontSize(enFull, w * 0.88, 38, 24, 0.55);
  const gapIllText = Math.round(h * 0.045);
  const gapKoEn = Math.round(koSize * 0.55);
  // Approximate text block height (baseline → next line + descenders).
  const textBlockH = Math.round(koSize * 1.05 + gapKoEn + enSize * 1.15);
  const stackH = illH + gapIllText + textBlockH;

  // Vertically center the (illustration + sentences) stack in the content area.
  const stackTop = Math.max(
    Math.round(h * 0.06),
    Math.round((contentH - stackH) / 2),
  );
  const illTop = stackTop;
  const illLeft = Math.round((w - illW) / 2);
  const koY = illTop + illH + gapIllText + Math.round(koSize * 0.85);
  const enY = koY + Math.round(koSize * 0.55) + Math.round(enSize * 0.95);

  const fontKo =
    "Apple SD Gothic Neo, AppleGothic, Noto Sans KR, Malgun Gothic, sans-serif";
  const fontEn =
    "Helvetica Neue, Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif";

  const textSvg = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${GRAMMAR_PIN_BG}"/>
  <text x="${w / 2}" y="${koY}" text-anchor="middle" xml:space="preserve"
    font-family="${fontKo}" font-size="${koSize}" font-weight="800" letter-spacing="-1.2">
    <tspan fill="${GRAMMAR_TEXT}">${escapeXml(koB)}</tspan><tspan fill="${GRAMMAR_HIGHLIGHT}">${escapeXml(koH)}</tspan><tspan fill="${GRAMMAR_TEXT}">${escapeXml(koA)}</tspan>
  </text>
  <text x="${w / 2}" y="${enY}" text-anchor="middle" xml:space="preserve"
    font-family="${fontEn}" font-size="${enSize}" font-weight="500" letter-spacing="-0.4">
    <tspan fill="${GRAMMAR_TEXT}">${escapeXml(enB)}</tspan><tspan fill="${GRAMMAR_HIGHLIGHT}">${escapeXml(enH)}</tspan><tspan fill="${GRAMMAR_TEXT}">${escapeXml(enA)}</tspan>
  </text>
</svg>`);

  return sharp(textSvg)
    .composite([{ input: illBuf, top: illTop, left: illLeft }])
    .png()
    .toBuffer();
}

/** Illustration-only prompt (no sentence text). */
export function grammarSpotlightIllustrationPrompt(scene, styleBase) {
  return `${styleBase}

FORMAT: ONE simple scene illustration ONLY (portrait). Soft cream / warm beige (#FBF3E6).
This is the MIDDLE art for a grammar flashcard — NOT a full lesson poster.

Subject (exactly this scene): ${scene}

RULES:
- One clear subject / moment. Flat doodle sticker, wobbly outlines, soft fills.
- Subject fills the middle of the frame (not tiny in a corner).
- Modest clean cream margin around the subject — do NOT leave a huge empty bottom half.
- NO tables, NO columns, NO numbered rows, NO title headers, NO explanation boxes.
- NO Hangul, NO English, NO romanization, NO labels, NO logos, NO watermarks, NO UI chrome.
- Tiny zzz / sparkles / hearts OK only if they are part of the scene (not text).`;
}
