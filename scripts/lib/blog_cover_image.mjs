import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

import { azureChat, stripCodeFence } from "./azure_chat.mjs";
import { ROOT } from "./env_local.mjs";
import { hasR2Config, uploadBufferToR2 } from "./r2_upload.mjs";

const WEBP_QUALITY_LARGE = 80;
const WEBP_QUALITY_THUMB = 76;
/** Article hero — resized from model output */
const LARGE_MAX_WIDTH = 1200;
/** List cards: grid ~33vw, major ~1024px CSS — 480px covers 2x retina */
const THUMB_MAX_WIDTH = 480;
const BLOG_COVER_SIZE = "1536x1024";

function imageDeployment() {
  // Blog pipeline always uses gpt-image-2 unless BLOG_IMAGE_DEPLOYMENT is set.
  return process.env.BLOG_IMAGE_DEPLOYMENT?.trim() || "gpt-image-2";
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

async function buildCoverPrompt(title, thesis) {
  const t = String(title || "").trim().slice(0, 200);
  const th = String(thesis || "").trim().slice(0, 400);
  if (!t) throw new Error("title required for cover prompt");

  const system = `You output only one raw English string: the prompt for an image generation model (GPT-image class). No quotes, no markdown, no preamble, no JSON.

The image model cannot see the reference PNG — study the attached image and translate its visual style into concrete words. Do not invent a different art direction.`;

  let userContent;
  if (existsSync(STYLE_REF)) {
    const b64 = readFileSync(STYLE_REF).toString("base64");
    userContent = [
      {
        type: "text",
        text: `Attached image = the ONLY style reference. Copy its illustration language (soft watercolor digital webtoon, hand-drawn soft brown outlines, pastel cream/beige/sky-blue palette, warm airy daylight, gentle shading, cozy slice-of-life mood).

Design a **blog essay cover** (editorial hero, not an interior panel) for:
Title: "${t.replace(/"/g, '\\"')}"
Theme: ${th.replace(/"/g, '\\"') || "Korean language learning"}

Canvas: wide landscape 1536×1024 — horizontal hero, strong focal illustration, room for optional short title typography.

Write ONE image prompt (English, max ~620 chars): scene inspired by the theme, rendered in the same style family as the reference. Visual metaphor for the essay — not a YouTube screenshot. Optional 3–6 word title text if it fits; no paragraphs, no watermarks.`,
      },
      { type: "image_url", image_url: { url: `data:image/png;base64,${b64}` } },
    ];
  } else {
    userContent = `Blog cover for Korean-learning essay.
Title: "${t.replace(/"/g, '\\"')}"
Theme: ${th.replace(/"/g, '\\"') || "Korean language"}

Wide landscape 1536×1024. Soft watercolor webtoon cover: clean soft brown outlines, pastel cream and light-blue palette, gentle daylight, slice-of-life mood. One prompt (~620 chars), optional short title text only.`;
  }

  const suffix =
    " Soft watercolor/marker webtoon, clean soft brown outlines, pastel cream and light-blue palette, gentle daylight. Blog cover only — no UI, no tiny unreadable text blocks, no photorealism. Never print prompt instructions or meta phrases such as 'match the reference style' in the image.";

  let raw = await azureChat({
    system,
    user: userContent,
    temperature: 0.42,
    maxTokens: 1200,
    jsonMode: false,
  });
  let prompt = stripCodeFence(raw).replace(/^["']|["']$/g, "").trim().slice(0, 3600);
  if (!prompt) {
    raw = await azureChat({
      system,
      user: typeof userContent === "string" ? userContent : userContent[0].text,
      temperature: 0.42,
      maxTokens: 1200,
    });
    prompt = stripCodeFence(raw).replace(/^["']|["']$/g, "").trim().slice(0, 3600);
  }
  if (!prompt) throw new Error("Cover prompt step returned empty");
  return (prompt + suffix).slice(0, 3900);
}

async function generateImageB64(prompt) {
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
      size: BLOG_COVER_SIZE,
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

const STYLE_REF = join(ROOT, "refrefref.png");

async function makeLargeWebp(pngBuffer) {
  return sharp(pngBuffer)
    .resize({ width: LARGE_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY_LARGE, effort: 4 })
    .toBuffer();
}

async function makeThumbWebp(pngBuffer) {
  return sharp(pngBuffer)
    .resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY_THUMB, effort: 4 })
    .toBuffer();
}

/**
 * Generate blog cover with gpt-image-2 (or BLOG_IMAGE_DEPLOYMENT), upload large + thumb to R2.
 * @returns {{ imageLarge: string, imageLargeLocal?: string, imageThumb: string, prompt: string }}
 */
export async function generateBlogCoverAssets({ title, thesis, slug, outDir }) {
  console.error(`[blog-cover] prompt (${imageDeployment()})…`);
  const prompt = await buildCoverPrompt(title, thesis);

  console.error(`[blog-cover] image generation ${BLOG_COVER_SIZE}…`);
  const b64 = await generateImageB64(prompt);
  const pngBuffer = Buffer.from(b64, "base64");
  const largeWebp = await makeLargeWebp(pngBuffer);
  const thumbWebp = await makeThumbWebp(pngBuffer);

  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  mkdirSync(outDir, { recursive: true });
  const localLarge = join(outDir, `${slug}-cover.webp`);
  writeFileSync(localLarge, largeWebp);
  console.error(`[blog-cover] saved local ${localLarge} (${Math.round(largeWebp.length / 1024)} KB)`);

  if (!hasR2Config()) {
    throw new Error(
      "R2 env missing — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL",
    );
  }

  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const largeKey = `articles/blog-cover-${slug}-${stamp}.webp`;
  const imageLarge = await uploadBufferToR2(largeKey, largeWebp, "image/webp");
  console.error(
    `[blog-cover] uploaded large webp → ${imageLarge} (${Math.round(largeWebp.length / 1024)} KB)`,
  );

  const thumbKey = `articles/blog-thumb-${slug}-${stamp}.webp`;
  const imageThumb = await uploadBufferToR2(thumbKey, thumbWebp, "image/webp");
  console.error(
    `[blog-cover] uploaded thumb webp → ${imageThumb} (${Math.round(thumbWebp.length / 1024)} KB)`,
  );

  return { imageLarge, imageLargeLocal: localLarge, imageThumb, prompt };
}
