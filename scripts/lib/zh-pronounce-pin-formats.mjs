/**
 * Chinese pronunciation Pinterest pins (getpronounce.net).
 * English gloss → capybara art → Hanzi + pinyin.
 */
import sharp from "sharp";
import {
  CAPYBARA_ART_STYLE,
  CAPYBARA_MASCOT,
} from "./vocab-infographic-gen.mjs";
import {
  EN_EN_PORTRAIT,
  pickSimpleUpgradeBg,
  simpleUpgradeArtPrompt,
} from "./en-en-pin-formats.mjs";

export { simpleUpgradeArtPrompt, pickSimpleUpgradeBg, EN_EN_PORTRAIT };

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** CJK-friendly stack for SVG text (no nested quotes — breaks XML). */
const CJK_FONT = "PingFang SC, Noto Sans SC, Hiragino Sans GB, Microsoft YaHei, sans-serif";

export async function composeChineseWordPin(opts) {
  const { w, h } = EN_EN_PORTRAIT;
  const english = String(opts.english || "").trim();
  const chinese = String(opts.chinese || "").trim();
  const pinyin = String(opts.pinyin || "").trim();
  const targetColor = String(opts.targetColor || "#b91c1c");
  const bg = String(opts.bgColor || "#FFFDF8");

  let englishSize = english.length > 24 ? 56 : english.length > 16 ? 64 : 72;
  let hanziSize = chinese.length > 4 ? 96 : chinese.length > 2 ? 120 : 140;
  let pySize = 44;
  const maxTextW = w * 0.86;
  const approx = (t, sz) => String(t).length * sz * ( /[\u4e00-\u9fff]/.test(t) ? 1.05 : 0.55 );
  while (englishSize > 40 && approx(english, englishSize) > maxTextW) englishSize -= 2;
  while (hanziSize > 72 && approx(chinese, hanziSize) > maxTextW) hanziSize -= 2;

  const englishY = Math.round(h * 0.11);
  const artH = Math.round(h * 0.48);
  const artW = Math.round(w * 0.62);
  const artTop = Math.round(h * 0.16);
  const artLeft = Math.round((w - artW) / 2);
  const hanziY = Math.round(h * 0.72);
  const pyY = Math.round(h * 0.805);

  const artScaled = await sharp(opts.illustrationPng)
    .rotate()
    .ensureAlpha()
    .resize(artW, artH, {
      fit: "contain",
      position: "centre",
      background: { r: 255, g: 253, b: 248, alpha: 1 },
    })
    .png()
    .toBuffer();

  const typeSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="${escapeXml(bg)}"/>
  <text x="${w / 2}" y="${englishY}" text-anchor="middle" dominant-baseline="middle"
    font-family="Avenir Next, Helvetica Neue, system-ui, sans-serif"
    font-size="${englishSize}" font-weight="650" fill="#3f3f46">${escapeXml(english)}</text>
  <text x="${w / 2}" y="${hanziY}" text-anchor="middle" dominant-baseline="middle"
    font-family="${CJK_FONT}"
    font-size="${hanziSize}" font-weight="800" fill="${escapeXml(targetColor)}">${escapeXml(chinese)}</text>
  ${pinyin ? `<text x="${w / 2}" y="${pyY}" text-anchor="middle" dominant-baseline="middle"
    font-family="Avenir Next, Helvetica Neue, system-ui, sans-serif"
    font-size="${pySize}" font-weight="600" fill="#52525b" letter-spacing="0.04em">${escapeXml(pinyin)}</text>` : ""}
</svg>`);

  const base = await sharp(typeSvg).png().toBuffer();
  return sharp(base)
    .composite([{ input: artScaled, top: artTop, left: artLeft }])
    .png()
    .toBuffer();
}

export function chineseWordArtPrompt(scene, bgColor) {
  return simpleUpgradeArtPrompt({ scene, bgColor });
}
