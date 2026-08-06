#!/usr/bin/env node
/**
 * Generate Preply affiliate mid-page banner candidates via gpt-image-2.
 * No $10 / discount copy (Preply offer differs from italki).
 *
 *   node scripts/generate-preply-banner-candidates.mjs
 *   node scripts/generate-preply-banner-candidates.mjs --only sq-01,wide-02
 *
 * Output: .tmp/preply-banners/ + index.html gallery
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";

loadEnvLocal(ROOT);

const OUT = join(ROOT, ".tmp", "preply-banners");
const IMAGE_DEPLOY =
  process.env.AZURE_OPENAI_DEPLOYMENT_IMAGE?.trim() || "gpt-image-2";
const IMAGE_VER =
  process.env.AZURE_OPENAI_IMAGE_API_VERSION?.trim() || "2025-04-01-preview";
const QUALITY = process.env.AZURE_OPENAI_IMAGE_QUALITY?.trim() || "high";
const TIMEOUT_MS = 300_000;

const SHARED = `
Mid-page web banner for a Korean-learning website affiliate promo.
Promote finding a 1:1 Korean tutor / language tutor (not a vocab quiz chart, not Pinterest).
On-image English text must be chunky and mobile-readable:
  Primary headline: "Find my Korean tutor"
  Secondary ONLY: "1:1 Korean lessons" and/or "Book a tutor"
Do NOT write dollar amounts, discounts, OFF, coupons, or "% off".
High contrast type, generous margins, clean composition, no clutter.
Do NOT invent or imitate the Preply logo or trademark wordmark.
No watermarks, no QR codes, no tiny paragraphs, no UI chrome, no browser mockups with fake brands.
Soft modern marketing illustration — warm, friendly, trustworthy.
`.trim();

/** @type {{ id: string, size: "1024x1024" | "1536x1024", label: string, prompt: string }[]} */
const CANDIDATES = [
  {
    id: "sq-01",
    size: "1024x1024",
    label: "Square · bold graphic (italki sq-03 DNA, no discount)",
    prompt: `${SHARED}
Square 1024×1024. Bold minimal graphic banner matching a winning speech-bubble ad style:
Cream/off-white background, large coral-red multi-lobed speech bubble centered with huge white type "Find my Korean tutor" (3 lines).
Corner abstract bubbles in coral + electric blue.
Under the main bubble: one clear blue pill saying "1:1 Korean lessons" in white — emphasized, thick, high contrast.
No people faces. Modern SaaS landing ad style. No discount text anywhere.`,
  },
  {
    id: "sq-02",
    size: "1024x1024",
    label: "Square · bold graphic + Book a tutor",
    prompt: `${SHARED}
Square 1024×1024. Same bold speech-bubble DNA as sq-01, slight variant:
Coral main bubble "Find my Korean tutor"; below it a bigger blue pill "Book a tutor" and a smaller grey pill "1:1 Korean lessons".
Cream background, coral/blue corner shapes. No discount, no dollar signs. Clean, mobile-readable.`,
  },
  {
    id: "sq-03",
    size: "1024x1024",
    label: "Square · blue-forward graphic",
    prompt: `${SHARED}
Square 1024×1024. Bold speech-bubble graphic, blue-forward variant:
Main bubble electric blue with white "Find my Korean tutor"; secondary coral pill "1:1 Korean lessons".
Corner abstract bubbles cream + coral. No people. No discounts.`,
  },
  {
    id: "wide-01",
    size: "1536x1024",
    label: "Wide · conversation energy (italki wide-03 DNA, no discount)",
    prompt: `${SHARED}
Wide landscape 1536×1024. Friendly illustrated scene of two people with laptops, soft speech bubbles suggesting language exchange (Korean greeting vibe OK).
Warm peach/orange pastels. Big text "Find my Korean tutor"; bottom strip "1:1 Korean lessons" only — NO discount, NO dollar amounts.
Clean editorial mid-page banner, not busy.`,
  },
  {
    id: "wide-02",
    size: "1536x1024",
    label: "Wide · conversation · left headline",
    prompt: `${SHARED}
Wide landscape 1536×1024. Slight variant of warm two-people tutoring illustration:
Oversized white headline "Find my Korean tutor" on the LEFT; characters more on the RIGHT; bottom bar "1:1 Korean lessons · Book a tutor".
Warm peach pastels, soft watercolor webtoon. No discount text.`,
  },
  {
    id: "wide-03",
    size: "1536x1024",
    label: "Wide · conversation · cooler sky accents",
    prompt: `${SHARED}
Wide landscape 1536×1024. Two smiling people with laptops, soft speech bubbles, big "Find my Korean tutor".
Warm base with soft sky-blue accents; bottom strip "1:1 Korean lessons".
No discount, no dollar signs. Soft watercolor, airy, not busy.`,
  },
];

function azureBase() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  if (!endpoint || !apiKey) {
    throw new Error("Missing AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_API_KEY");
  }
  return { endpoint, apiKey };
}

async function generatePngBuffer(prompt, size) {
  const { endpoint, apiKey } = azureBase();
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(IMAGE_DEPLOY)}/images/generations?api-version=${encodeURIComponent(IMAGE_VER)}`;
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
      quality: QUALITY,
      output_format: "png",
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      data?.error?.message || data?.message || `Azure image HTTP ${res.status}`,
    );
  }
  const row = data?.data?.[0];
  if (row?.b64_json) return Buffer.from(row.b64_json, "base64");
  if (row?.url) {
    const img = await fetch(row.url);
    if (!img.ok) throw new Error(`Download failed HTTP ${img.status}`);
    return Buffer.from(await img.arrayBuffer());
  }
  throw new Error("Azure image response missing b64_json/url");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function generateWithRetry(prompt, size, { maxAttempts = 5 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await generatePngBuffer(prompt, size);
    } catch (e) {
      lastErr = e;
      const msg = String(e?.message || e);
      console.warn(`  ⚠ attempt ${attempt}/${maxAttempts}: ${msg}`);
      if (attempt < maxAttempts) await sleep(Math.min(90_000, 12_000 * attempt));
    }
  }
  throw lastErr;
}

function parseOnlyFlag(argv) {
  const flag = argv.find((a) => a.startsWith("--only="));
  if (flag) {
    return new Set(
      flag
        .slice("--only=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  const idx = argv.indexOf("--only");
  if (idx >= 0 && argv[idx + 1]) {
    return new Set(
      argv[idx + 1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  return null;
}

function writeGallery(manifest) {
  const cards = manifest
    .map(
      (row) => `
    <figure class="card">
      <a href="${row.file}" target="_blank" rel="noopener">
        <img src="${row.file}" alt="${row.id}" loading="lazy" />
      </a>
      <figcaption>
        <strong>${row.id}</strong> · ${row.size}<br/>
        ${row.label}<br/>
        <span class="muted">${row.kb} KB · ${row.status}</span>
      </figcaption>
    </figure>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Preply banner candidates</title>
  <style>
    :root { color-scheme: light; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; padding: 24px; background: #eef2f7; color: #152033; }
    h1 { font-size: 1.4rem; margin: 0 0 8px; }
    p { margin: 0 0 20px; color: #5a6578; max-width: 52rem; line-height: 1.5; }
    .grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    .card { margin: 0; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #d8e0eb; box-shadow: 0 10px 30px -22px rgba(20,40,80,.45); }
    .card img { display: block; width: 100%; height: auto; background: #e8eef6; }
    figcaption { padding: 12px 14px 14px; font-size: 0.86rem; line-height: 1.4; }
    .muted { color: #8a94a6; font-size: 0.78rem; }
    code { background: #e8eef6; padding: 0.1em 0.35em; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Preply affiliate banner candidates</h1>
  <p>
    No $10 / discount copy — secondary: <code>1:1 Korean lessons</code> / <code>Book a tutor</code>.<br/>
    Same vibe as winning italki sq-03 / wide-03, but Preply-safe.
  </p>
  <div class="grid">
    ${cards}
  </div>
</body>
</html>
`;
  writeFileSync(join(OUT, "index.html"), html, "utf8");
}

async function main() {
  const only = parseOnlyFlag(process.argv.slice(2));
  mkdirSync(OUT, { recursive: true });

  const list = only
    ? CANDIDATES.filter((c) => only.has(c.id))
    : CANDIDATES;
  if (!list.length) {
    throw new Error("No candidates matched --only filter");
  }

  console.log(`Preply banners → ${OUT}`);
  console.log(`model=${IMAGE_DEPLOY} quality=${QUALITY} count=${list.length}\n`);

  /** @type {any[]} */
  const manifest = [];

  for (const c of list) {
    const webpName = `${c.id}.webp`;
    const pngName = `${c.id}.png`;
    const webpPath = join(OUT, webpName);
    const pngPath = join(OUT, pngName);
    const promptPath = join(OUT, `${c.id}.prompt.txt`);

    writeFileSync(promptPath, c.prompt, "utf8");

    if (existsSync(webpPath) && !process.argv.includes("--force")) {
      const st = readFileSync(webpPath);
      console.log(`skip existing ${c.id} (${Math.round(st.length / 1024)} KB)`);
      manifest.push({
        id: c.id,
        size: c.size,
        label: c.label,
        file: webpName,
        kb: Math.round(st.length / 1024),
        status: "cached",
      });
      continue;
    }

    console.log(`generating ${c.id} (${c.size}) — ${c.label}`);
    const png = await generateWithRetry(c.prompt, c.size);
    writeFileSync(pngPath, png);
    const webp = await sharp(png)
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    writeFileSync(webpPath, webp);
    console.log(
      `  ✓ ${webpName} ${Math.round(webp.length / 1024)} KB (png ${Math.round(png.length / 1024)} KB)`,
    );
    manifest.push({
      id: c.id,
      size: c.size,
      label: c.label,
      file: webpName,
      kb: Math.round(webp.length / 1024),
      status: "new",
    });
  }

  if (only) {
    for (const c of CANDIDATES) {
      if (manifest.some((m) => m.id === c.id)) continue;
      const webpName = `${c.id}.webp`;
      const webpPath = join(OUT, webpName);
      if (!existsSync(webpPath)) continue;
      const st = readFileSync(webpPath);
      manifest.push({
        id: c.id,
        size: c.size,
        label: c.label,
        file: webpName,
        kb: Math.round(st.length / 1024),
        status: "cached",
      });
    }
  }

  manifest.sort((a, b) => a.id.localeCompare(b.id));
  writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  writeGallery(manifest);
  console.log(`\ngallery: ${join(OUT, "index.html")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
