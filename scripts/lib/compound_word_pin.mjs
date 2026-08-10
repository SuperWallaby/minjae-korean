/**
 * Compound word equation pin — A + B → AB (Eggbun-style).
 * Icons generated separately (no text); Hangul/English overlaid via SVG.
 */
import sharp from "sharp";

export const CMP_W = 1024;
export const CMP_H = 1536;
export const CMP_BG = "#FBF3E6";
export const CMP_CARD = "#FFFFFF";
export const CMP_TEXT = "#1A1A1A";
export const CMP_ACCENT = "#E86A2B";

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapLines(text, maxChars) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

/**
 * @param {{
 *   leftIconPng: Buffer,
 *   rightIconPng: Buffer,
 *   left: { hangul: string, romanization: string, english: string },
 *   right: { hangul: string, romanization: string, english: string },
 *   resultHangul: string,
 *   resultRomanization: string,
 *   resultMeaning: string,
 * }} opts
 */
export async function composeCompoundWordPin(opts) {
  const w = CMP_W;
  const h = CMP_H;
  const pad = 48;
  const gap = 28;
  const plusW = 56;
  const cardW = Math.floor((w - pad * 2 - gap * 2 - plusW) / 2);
  const cardH = Math.round(h * 0.42);
  const cardY = Math.round(h * 0.07);
  const leftX = pad;
  const rightX = pad + cardW + gap + plusW + gap;

  async function fitIcon(buf, maxW, maxH) {
    let out = await sharp(buf)
      .rotate()
      .ensureAlpha()
      .resize(maxW, maxH, { fit: "inside", withoutEnlargement: false })
      .png()
      .toBuffer();
    try {
      out = await sharp(out).trim({ threshold: 14 }).png().toBuffer();
      out = await sharp(out)
        .resize(maxW, maxH, { fit: "inside", withoutEnlargement: true })
        .png()
        .toBuffer();
    } catch {
      /* keep */
    }
    return out;
  }

  const iconMaxW = Math.round(cardW * 0.72);
  const iconMaxH = Math.round(cardH * 0.48);
  const leftIcon = await fitIcon(opts.leftIconPng, iconMaxW, iconMaxH);
  const rightIcon = await fitIcon(opts.rightIconPng, iconMaxW, iconMaxH);
  const leftMeta = await sharp(leftIcon).metadata();
  const rightMeta = await sharp(rightIcon).metadata();
  const lIW = leftMeta.width || iconMaxW;
  const lIH = leftMeta.height || iconMaxH;
  const rIW = rightMeta.width || iconMaxW;
  const rIH = rightMeta.height || iconMaxH;

  const left = opts.left;
  const right = opts.right;
  const resultRom = String(opts.resultRomanization || "").trim();
  const resultKo = String(opts.resultHangul || "").trim();
  const meaningLines = wrapLines(opts.resultMeaning, 34);

  const arrowY = cardY + cardH + Math.round(h * 0.02);
  const resultRomY = arrowY + Math.round(h * 0.08);
  const resultKoY = resultRomY + Math.round(h * 0.07);
  const meaningStartY = resultKoY + Math.round(h * 0.07);

  const fontKo =
    "Apple SD Gothic Neo, AppleGothic, Noto Sans KR, Malgun Gothic, sans-serif";
  const fontEn =
    "Helvetica Neue, Inter, -apple-system, BlinkMacSystemFont, Arial, sans-serif";

  function cardText(x, y, cw, ch, part) {
    const romY = y + Math.round(ch * 0.58);
    const koY = y + Math.round(ch * 0.72);
    const enY = y + Math.round(ch * 0.86);
    return `
  <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="28" ry="28"
    fill="${CMP_CARD}" stroke="#EDE4D6" stroke-width="2"/>
  <text x="${x + cw / 2}" y="${romY}" text-anchor="middle" xml:space="preserve"
    font-family="${fontEn}" font-size="26" font-weight="600" fill="${CMP_ACCENT}">[${escapeXml(part.romanization)}]</text>
  <text x="${x + cw / 2}" y="${koY}" text-anchor="middle" xml:space="preserve"
    font-family="${fontKo}" font-size="64" font-weight="800" fill="${CMP_ACCENT}">${escapeXml(part.hangul)}</text>
  <text x="${x + cw / 2}" y="${enY}" text-anchor="middle" xml:space="preserve"
    font-family="${fontEn}" font-size="28" font-weight="500" fill="${CMP_TEXT}">${escapeXml(part.english)}</text>`;
  }

  const meaningSvg = meaningLines
    .map(
      (line, i) =>
        `<text x="${w / 2}" y="${meaningStartY + i * 36}" text-anchor="middle" xml:space="preserve"
    font-family="${fontEn}" font-size="26" font-weight="500" fill="${CMP_TEXT}">${escapeXml(line)}</text>`,
    )
    .join("\n");

  const plusX = leftX + cardW + gap + plusW / 2;
  const plusY = cardY + cardH / 2 + 12;

  const svg = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${CMP_BG}"/>
  ${cardText(leftX, cardY, cardW, cardH, left)}
  <text x="${plusX}" y="${plusY}" text-anchor="middle"
    font-family="${fontEn}" font-size="64" font-weight="800" fill="${CMP_TEXT}">+</text>
  ${cardText(rightX, cardY, cardW, cardH, right)}
  <text x="${w / 2}" y="${arrowY + 48}" text-anchor="middle"
    font-family="${fontEn}" font-size="56" font-weight="800" fill="${CMP_ACCENT}">↓</text>
  <text x="${w / 2}" y="${resultRomY}" text-anchor="middle" xml:space="preserve"
    font-family="${fontEn}" font-size="28" font-weight="600" fill="${CMP_TEXT}">[${escapeXml(resultRom)}]</text>
  <text x="${w / 2}" y="${resultKoY}" text-anchor="middle" xml:space="preserve"
    font-family="${fontKo}" font-size="72" font-weight="800" fill="${CMP_TEXT}">${escapeXml(resultKo)}</text>
  ${meaningSvg}
</svg>`);

  const leftIconTop = cardY + Math.round(cardH * 0.08);
  const rightIconTop = leftIconTop;
  const leftIconLeft = leftX + Math.round((cardW - lIW) / 2);
  const rightIconLeft = rightX + Math.round((cardW - rIW) / 2);

  return sharp(svg)
    .composite([
      { input: leftIcon, top: leftIconTop, left: leftIconLeft },
      { input: rightIcon, top: rightIconTop, left: rightIconLeft },
    ])
    .png()
    .toBuffer();
}

export function compoundIconPrompt(iconScene, styleBase, sideLabel) {
  return `${styleBase}

FORMAT: Soft cream / warm beige (#FBF3E6) square sticker icon ONLY for a compound-word card (${sideLabel}).
Subject: ${iconScene}
Centered cute flat doodle sticker, wobbly outlines, soft fills, lots of empty cream padding.
HARD BAN: any Hangul, English, romanization, logos, watermarks, UI chrome, plus signs, arrows.
One object only — no second character unless the subject needs it.`;
}
