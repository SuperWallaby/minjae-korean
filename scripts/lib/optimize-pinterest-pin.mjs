/**
 * Optimize a vocab chart for Pinterest upload (mobile + desktop feed).
 *
 * Specs (Pinterest standard pin):
 *   - Prefer 2:3 → 1000×1500
 *   - Square 1:1 → 1000×1000
 *   - Cap taller pins at 1000×1500 (avoid feed truncation > ~2:3)
 *   - JPEG q90 + 4:4:4 chroma (Hangul/text stays sharp; Pinterest re-encodes anyway)
 *   - Target typically 200–700 KB vs 1–3 MB source PNGs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export const PIN_SQUARE = { w: 1000, h: 1000 };
export const PIN_STANDARD = { w: 1000, h: 1500 };

/**
 * @param {number} width
 * @param {number} height
 * @returns {{ w: number, h: number, kind: "square" | "standard" | "fit" }}
 */
export function targetPinSize(width, height) {
  const w = Math.max(1, width || 1024);
  const h = Math.max(1, height || 1536);
  const ratio = h / w;

  // Near-square
  if (ratio >= 0.92 && ratio <= 1.08) {
    return { ...PIN_SQUARE, kind: "square" };
  }
  // Portrait near 2:3 (incl. 1024×1536)
  if (ratio >= 1.35 && ratio <= 1.65) {
    return { ...PIN_STANDARD, kind: "standard" };
  }
  // Taller than 2:3 — force into standard box (cover, center)
  if (ratio > 1.65) {
    return { ...PIN_STANDARD, kind: "standard" };
  }
  // Landscape / other — fit inside standard pin box
  const scale = Math.min(PIN_STANDARD.w / w, PIN_STANDARD.h / h, 1);
  return {
    w: Math.max(1, Math.round(w * scale)),
    h: Math.max(1, Math.round(h * scale)),
    kind: "fit",
  };
}

/**
 * @param {string} inputPath
 * @param {string} outputPath  .jpg recommended
 * @returns {Promise<{ inputKb: number, outputKb: number, width: number, height: number, kind: string, path: string }>}
 */
export async function optimizePinterestPin(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`missing image: ${inputPath}`);
  }

  const inputKb = Math.round(fs.statSync(inputPath).size / 1024);
  const meta = await sharp(inputPath).rotate().metadata();
  const target = targetPinSize(meta.width || 1024, meta.height || 1536);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const pipeline = sharp(inputPath).rotate();

  if (target.kind === "fit") {
    pipeline.resize(target.w, target.h, {
      fit: "inside",
      withoutEnlargement: false,
    });
  } else {
    // square / standard: fill exact Pinterest dims
    pipeline.resize(target.w, target.h, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: false,
    });
  }

  await pipeline
    .jpeg({
      quality: 90,
      mozjpeg: true,
      chromaSubsampling: "4:4:4",
      progressive: true,
    })
    .toFile(outputPath);

  const outMeta = await sharp(outputPath).metadata();
  const outputKb = Math.round(fs.statSync(outputPath).size / 1024);

  return {
    inputKb,
    outputKb,
    width: outMeta.width || target.w,
    height: outMeta.height || target.h,
    kind: target.kind,
    path: outputPath,
  };
}

/**
 * Default cache path next to source PNG.
 * @param {string} sourcePng
 * @param {string} [cacheDir]
 */
export function optimizedPinPath(sourcePng, cacheDir) {
  const base = path.basename(sourcePng, path.extname(sourcePng));
  const dir = cacheDir || path.join(path.dirname(sourcePng), "pin-optimized");
  return path.join(dir, `${base}.jpg`);
}
