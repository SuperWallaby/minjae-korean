/**
 * Blog / news Pinterest promo pin (tall).
 *
 * ONE full gpt-image-2 render of the entire pin (title + character art + URL
 * all painted by the model). No SVG/sharp text compositing.
 * Destination = article URL at upload (always site, never affiliate).
 *
 *   import { generateContentPromoPin } from "./lib/blog_promo_pin.mjs"
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

import { ROOT } from "./env_local.mjs";
import { hasR2Config, uploadBufferToR2 } from "./r2_upload.mjs";

export const PROMO_PIN_W = 1000;
export const PROMO_PIN_H = 1500;
/** Tall portrait for full pin (Azure gpt-image). */
export const PROMO_PIN_SIZE = "1024x1536";

const SITE_HOST = "kajakorean.com";

function imageDeployment() {
  return (
    process.env.BLOG_PROMO_IMAGE_DEPLOYMENT?.trim() ||
    process.env.BLOG_IMAGE_DEPLOYMENT?.trim() ||
    process.env.AZURE_OPENAI_IMAGE_DEPLOYMENT?.trim() ||
    "gpt-image-2"
  );
}

function imageApiVersion() {
  return process.env.AZURE_OPENAI_IMAGE_API_VERSION?.trim() || "2025-04-01-preview";
}

function imageQuality() {
  return process.env.AZURE_OPENAI_IMAGE_QUALITY?.trim() || "high";
}

function azureBase() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  if (!endpoint || !apiKey) {
    throw new Error("Missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY");
  }
  return { endpoint, apiKey };
}

/**
 * Build a direct full-pin image prompt. Title/URL are painted IN the image by gpt-image-2.
 * No style-reference image attachment. No post-layout compositing.
 */
function buildFullPinPrompt({ title, description = "" }) {
  const t = String(title || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  if (!t) throw new Error("title required");
  const d = String(description || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);

  // Layout mirrors classic language-teacher Pinterest pins
  // (pale pink bg · chunky high-contrast title · cute clipart · tiny site URL).
  // Headline color is free — do NOT force brand blue every time.
  return [
    `Create a single tall vertical Pinterest pin, full finished graphic ${PROMO_PIN_SIZE} (portrait 2:3), ready to post. One complete design — do NOT leave empty regions for external typography.`,
    ``,
    `LAYOUT (strict vertical stack on one solid canvas):`,
    `1) Background: solid very light soft pale pink / blush cream (#FFF0EE-like) edge-to-edge, flat, no gradient bands, no photo border.`,
    `2) TOP third: large centered multi-line headline painted INTO the image. Chunky thick rounded sans-serif, thin dark outline for readability. All caps. Break title naturally over 2–4 short lines so it reads at thumbnail size. Exact title words: "${t.replace(/"/g, '\\"')}"`,
    `   Headline color: pick ONE bold high-contrast fill that fits the article mood — coral/red, warm orange, deep navy/charcoal, forest green, or purple are all fine. Brand blue (#0071E3) is optional, not required. Avoid pale/low-contrast pastels for the title.`,
    `3) Under the title: one short support line in small dark navy/charcoal sans-serif — e.g. a short phrase from the article theme; keep it secondary and small.`,
    `4) LOWER half: cute soft Japanese free-clipart / soft sticker illustration of ONE student character related to the article, simple props (desk, book, pen, small window), centered, plenty of pale-pink breathing room around the character, soft flat shading, soft brownish outlines. NO white die-cut sticker frame, NO card shadow plate.`,
    `5) Very bottom center: small simple dark grey text exactly: "${SITE_HOST}"  (only that site, no other URLs).`,
    ``,
    `Article theme for the illustration: ${d || "learning Korean, study tips for beginners"}.`,
    ``,
    `Style: clean language-teacher educational pin (same stack as viral Japanese teacher “how to learn …” pins): airy pale pink canvas, loud chunky title in a mood-fitting accent color (not locked to blue), adorable simple character art, quiet footer. Not photoreal, not full-bleed cinematic cityscape, not dark overlay design.`,
    `Hard rules: no watermarks, no QR, no extra logos, no app UI, no tiny unreadable paragraphs, no Korean or English body copy beyond the title + optional one short support line + footer domain.`,
  ].join("\n");
}

async function generateImageB64(prompt, size = PROMO_PIN_SIZE) {
  const { endpoint, apiKey } = azureBase();
  const deployment = imageDeployment();
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/images/generations?api-version=${encodeURIComponent(imageApiVersion())}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      prompt: prompt.slice(0, 3900),
      n: 1,
      size,
      quality: imageQuality(),
      output_format: "png",
    }),
    signal: AbortSignal.timeout(300_000),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      data?.error?.message || data?.message || `Azure image HTTP ${res.status} (${deployment})`,
    );
  }
  const row = data?.data?.[0];
  if (row?.b64_json) return row.b64_json;
  if (row?.url) {
    const img = await fetch(row.url);
    if (!img.ok) throw new Error(`Failed to download image URL: HTTP ${img.status}`);
    return Buffer.from(await img.arrayBuffer()).toString("base64");
  }
  throw new Error("Azure image response missing b64_json/url");
}

/**
 * Full pin from gpt-image-2 only (title/URL burned in).
 * @returns {Promise<{ png: Buffer, prompt: string }>}
 */
export async function generateFullPromoPinImage({ title, description }) {
  const prompt = buildFullPinPrompt({ title, description });
  console.error(`[blog-promo] full pin gen ${PROMO_PIN_SIZE} (${imageDeployment()}) — no composite…`);
  const b64 = await generateImageB64(prompt);
  return { png: Buffer.from(b64, "base64"), prompt };
}

/**
 * @param {"blog"|"news"} kind
 * @param {string} slug
 */
export function articleDestinationUrl(kind, slug, { utm = true } = {}) {
  const s = encodeURIComponent(String(slug || "").trim());
  if (!s) throw new Error("slug required");
  const path =
    kind === "news"
      ? `https://${SITE_HOST}/news/article/${s}`
      : `https://${SITE_HOST}/blog/article/${s}`;
  if (!utm) return path;
  const campaign = kind === "news" ? "news-promo" : "blog-promo";
  return `${path}?utm_source=pinterest&utm_medium=pin&utm_campaign=${campaign}`;
}

/**
 * Generate full pin with gpt-image-2 and write files (+ optional R2).
 * Only post-process: resize/cover to 1000×1500 and JPEG encode — no overlays.
 *
 * @returns {Promise<{
 *   slug: string,
 *   kind: string,
 *   title: string,
 *   destination: string,
 *   pinPath: string,
 *   pinJpgPath: string,
 *   prompt: string,
 *   r2Url?: string,
 * }>}
 */
export async function generateContentPromoPin({
  kind = "blog",
  slug,
  title,
  description = "",
  outDir,
  uploadR2 = false,
}) {
  if (!slug || !title) throw new Error("slug and title required");
  mkdirSync(outDir, { recursive: true });

  const { png: rawPng, prompt } = await generateFullPromoPinImage({
    title,
    description,
  });

  // Raw model output
  const rawPath = join(outDir, `${slug}-raw.png`);
  writeFileSync(rawPath, rawPng);

  // Pinterest size only (cover-fit). No text/overlay compositing.
  const pinPng = await sharp(rawPng)
    .rotate()
    .resize(PROMO_PIN_W, PROMO_PIN_H, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const pinPath = join(outDir, `${slug}-promo.png`);
  writeFileSync(pinPath, pinPng);

  const pinJpgPath = join(outDir, `${slug}-promo.jpg`);
  await sharp(pinPng)
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toFile(pinJpgPath);

  const destination = articleDestinationUrl(kind, slug);
  let r2Url;
  if (uploadR2) {
    if (!hasR2Config()) {
      console.warn("[blog-promo] R2 env missing — skip upload");
    } else {
      const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const key = `pinterest/content-promo/${kind}-${slug}-${stamp}.jpg`;
      const jpg = readFileSync(pinJpgPath);
      r2Url = await uploadBufferToR2(key, jpg, "image/jpeg");
      console.error(`[blog-promo] R2 → ${r2Url}`);
    }
  }

  return {
    slug,
    kind,
    title,
    destination,
    pinPath,
    pinJpgPath,
    prompt,
    r2Url,
  };
}
