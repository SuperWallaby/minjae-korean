/**
 * Web-sized WebP for global.kajakorean.com listings + pin pages.
 * Source PNGs are ~1024×1667 / 1.6–2.3MB — far too heavy for a card grid.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const CARD_W = 480;
export const CARD_H = 720;
export const PAGE_W = 1000;
export const CARD_Q = 78;
export const PAGE_Q = 82;

export function webPathsFromPng(pngPath) {
  const ext = path.extname(pngPath);
  const base = pngPath.slice(0, -ext.length);
  return {
    card: `${base}.card.webp`,
    page: `${base}.webp`,
  };
}

/**
 * @param {string} pngPath
 * @param {{ force?: boolean }} [opts]
 */
export async function optimizeGlobalPinWeb(pngPath, opts = {}) {
  if (!fs.existsSync(pngPath)) {
    throw new Error(`missing png: ${pngPath}`);
  }
  const { card, page } = webPathsFromPng(pngPath);
  const force = Boolean(opts.force);
  const inputKb = Math.round(fs.statSync(pngPath).size / 1024);
  const pngMtime = fs.statSync(pngPath).mtimeMs;

  const need = (out) =>
    force || !fs.existsSync(out) || fs.statSync(out).mtimeMs < pngMtime;

  const writeCard = need(card);
  const writePage = need(page);

  if (writeCard) {
    fs.mkdirSync(path.dirname(card), { recursive: true });
    await sharp(pngPath)
      .rotate()
      .resize(CARD_W, CARD_H, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: false,
      })
      .webp({ quality: CARD_Q, effort: 5 })
      .toFile(card);
  }

  if (writePage) {
    fs.mkdirSync(path.dirname(page), { recursive: true });
    await sharp(pngPath)
      .rotate()
      .resize(PAGE_W, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: PAGE_Q, effort: 5 })
      .toFile(page);
  }

  return {
    inputKb,
    cardKb: Math.round(fs.statSync(card).size / 1024),
    pageKb: Math.round(fs.statSync(page).size / 1024),
    card,
    page,
    wroteCard: writeCard,
    wrotePage: writePage,
  };
}
