#!/usr/bin/env node
/**
 * Generate italki affiliate mid-page banner candidates via gpt-image-2.
 *
 *   node scripts/generate-italki-banner-candidates.mjs
 *   node scripts/generate-italki-banner-candidates.mjs --only sq-01,wide-02
 *
 * Output: .tmp/italki-banners/ + index.html gallery
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { loadEnvLocal, ROOT } from "./lib/env_local.mjs";

loadEnvLocal(ROOT);

const OUT = join(ROOT, ".tmp", "italki-banners");
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
  Secondary: "$10 discount" and/or "1:1 Korean lessons"
High contrast type, generous margins, clean composition, no clutter.
Do NOT invent or imitate the italki logo or trademark wordmark.
No watermarks, no QR codes, no tiny paragraphs, no UI chrome, no browser mockups with fake brands.
Soft modern marketing illustration — warm, friendly, trustworthy.
`.trim();

/** @type {{ id: string, size: "1024x1024" | "1536x1024", label: string, prompt: string }[]} */
const CANDIDATES = [
  {
    id: "sq-01",
    size: "1024x1024",
    label: "Square · warm video-call tutor",
    prompt: `${SHARED}
Square 1024×1024. Warm illustration of a friendly 1:1 online Korean lesson: student and tutor smiling on a laptop video call, soft cream and sky-blue palette, gentle daylight, cozy desk plants. Large headline "Find my Korean tutor" in the upper third; small chip "$10 discount" near the bottom. Soft watercolor webtoon vibe, not photoreal.`,
  },
  {
    id: "sq-02",
    size: "1024x1024",
    label: "Square · study desk still life",
    prompt: `${SHARED}
Square 1024×1024. Soft still-life illustration: notebook with Hangul practice, earbuds, coffee mug, laptop half-open showing a calm lesson screen (no logos). Pastel cream background, airy light. Big centered text "Find my Korean tutor"; under it "1:1 Korean lessons" and a soft badge "$10 discount". Clean marketing poster look.`,
  },
  {
    id: "sq-03",
    size: "1024x1024",
    label: "Square · bold graphic",
    prompt: `${SHARED}
Square 1024×1024. Bold minimal graphic banner: large rounded shapes in cream, soft coral, and electric blue accents. Huge typography "Find my Korean tutor" dominating the center. Small secondary line "1:1 Korean lessons · $10 discount". Abstract friendly shapes hinting at speech bubbles / connection — no people faces required. Modern SaaS landing ad style.`,
  },
  {
    id: "sq-03b",
    size: "1024x1024",
    label: "Square · bold graphic variant B (warmer coral)",
    prompt: `${SHARED}
Square 1024×1024. Same DNA as a bold speech-bubble graphic ad, slight variation only:
Keep huge centered white type "Find my Korean tutor" inside one large coral/red speech bubble; secondary pill "1:1 Korean lessons · $10 discount" in blue.
Slightly warmer: more soft peach/coral bubbles in corners, cream background, a bit more breathing room around the center bubble. Still abstract — no people faces. Modern SaaS landing ad style.`,
  },
  {
    id: "sq-03c",
    size: "1024x1024",
    label: "Square · bold graphic variant C (blue-forward)",
    prompt: `${SHARED}
Square 1024×1024. Same DNA as a bold speech-bubble graphic ad, slight variation only:
Huge typography "Find my Korean tutor" still dominates; swap accent balance so the main bubble is electric blue with white type, and the secondary chip is soft coral with "$10 discount" / "1:1 Korean lessons".
Corner abstract bubbles in cream + coral. Clean, high contrast, no people. Modern SaaS landing ad style.`,
  },
  {
    id: "sq-03d",
    size: "1024x1024",
    label: "Square · bold graphic · $10 OFF emphasized",
    prompt: `${SHARED}
Square 1024×1024. Near-identical to the winning bold speech-bubble graphic:
Cream/off-white background, large coral-red multi-lobed speech bubble centered with huge white type "Find my Korean tutor" (3 lines), corner abstract bubbles in coral + electric blue.
CRITICAL copy change vs older versions:
- Under the main bubble, show TWO clear chips stacked or side-by-side:
  1) A bigger, bolder, more emphasized pill/badge saying exactly "$10 OFF" in white on electric blue (or bright blue) — make this badge larger, thicker, higher contrast, slight soft shadow so it pops more than the headline secondary text.
  2) A smaller secondary line or thinner pill: "1:1 Korean lessons".
Do NOT write "discount" — use "$10 OFF" only.
No people faces. Modern SaaS landing ad style, clean, mobile-readable.`,
  },
  {
    id: "sq-04",
    size: "1024x1024",
    label: "Square · Kaja cream + blue accent",
    prompt: `${SHARED}
Square 1024×1024. Brand-adjacent soft cream canvas with electric-blue (#2A7FFC) accent shapes. Optional tiny cute beige doodle capybara in a corner (simple KakaoTalk sticker vibe, not photoreal) as a quiet mascot — not the main focus. Headline "Find my Korean tutor" large and clear; badge "$10 discount". Clean mid-page promo card, lots of breathing room.`,
  },
  {
    id: "wide-01",
    size: "1536x1024",
    label: "Wide · tutor + student split",
    prompt: `${SHARED}
Wide landscape 1536×1024 mid-article banner. Horizontal composition: left side soft illustration of tutor and student on a video call; right side large clear text block "Find my Korean tutor" with supporting "1:1 Korean lessons" and CTA-like pill "$10 discount". Soft watercolor webtoon style, cream/beige/sky-blue, airy daylight. Leave margins so it crops safely on mobile.`,
  },
  {
    id: "wide-02",
    size: "1536x1024",
    label: "Wide · headline-forward",
    prompt: `${SHARED}
Wide landscape 1536×1024. Text-forward horizontal banner: oversized headline "Find my Korean tutor" across the middle-left; right side a small warm vignette of headphones + notebook + Hangul notes. Soft gradient cream-to-pale-blue background. Secondary line "1:1 Korean lessons" and a rounded "$10 discount" chip. Minimal, premium, high-contrast type.`,
  },
  {
    id: "wide-03",
    size: "1536x1024",
    label: "Wide · conversation energy",
    prompt: `${SHARED}
Wide landscape 1536×1024. Friendly illustrated scene of two people chatting across a table with laptops (in-person tutoring vibe) OR connected by soft speech-bubble shapes suggesting language exchange. Warm pastel palette. Centered or left-aligned big text "Find my Korean tutor"; bottom strip with "1:1 Korean lessons · $10 discount". Clean editorial banner, not busy.`,
  },
  {
    id: "wide-03b",
    size: "1536x1024",
    label: "Wide · conversation energy variant B (left text)",
    prompt: `${SHARED}
Wide landscape 1536×1024. Slight variant of a warm two-people 1:1 tutoring illustration:
Keep friendly soft-illustration style, warm peach/orange pastels, two people with laptops connected by soft speech bubbles (Korean greeting vibe OK).
Layout tweak: oversized white headline "Find my Korean tutor" clearly on the LEFT; characters more on the RIGHT; bottom bar still "1:1 Korean lessons · $10 discount".
Clean editorial mid-page banner — same energy, not a full redesign.`,
  },
  {
    id: "wide-03c",
    size: "1536x1024",
    label: "Wide · conversation energy variant C (cooler accents)",
    prompt: `${SHARED}
Wide landscape 1536×1024. Slight variant of a warm two-people tutoring banner:
Same composition idea — two smiling people with laptops, soft speech bubbles suggesting language exchange, bottom strip "1:1 Korean lessons · $10 discount", big "Find my Korean tutor".
Palette tweak only: keep warmth but add soft sky-blue accents in background shapes / one sweater; slightly airier negative space. Soft watercolor webtoon, not photoreal, not busy.`,
  },
  {
    id: "wide-04",
    size: "1536x1024",
    label: "Wide · soft abstract CTA",
    prompt: `${SHARED}
Wide landscape 1536×1024. Soft abstract horizontal ad: flowing cream ribbons, subtle blue accent arcs, one small laptop silhouette. Dominant type "Find my Korean tutor". Secondary "Book a 1:1 Korean tutor" and pill "$10 discount". Ultra-clean mid-page web banner, generous negative space, no clutter, no logos.`,
  },
  {
    id: "wide-05",
    size: "1536x1024",
    label: "Wide · evening cozy lesson",
    prompt: `${SHARED}
Wide landscape 1536×1024. Cozy evening study mood: warm lamp light, person studying Korean on a tablet while a friendly tutor appears in a soft floating video window (no brand UI). Soft illustration, gentle shadows. Headline "Find my Korean tutor" in a clear banner band; "$10 discount" chip. Inviting, calm, trustworthy.`,
  },
  {
    id: "wide-06",
    size: "1536x1024",
    label: "Wide · travel Korea vibe",
    prompt: `${SHARED}
Wide landscape 1536×1024. Soft travel-to-Korea learning vibe without landmarks clichés overload: subtle Seoul skyline silhouette in pale blue mist, foreground student with notebook, warm cream sky. Large readable text "Find my Korean tutor"; smaller "1:1 Korean lessons" and "$10 discount". Soft watercolor key-art, mid-page affiliate banner.`,
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
  <title>italki banner candidates</title>
  <style>
    :root { color-scheme: light; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; padding: 24px; background: #f4f1ea; color: #1a1400; }
    h1 { font-size: 1.4rem; margin: 0 0 8px; }
    p { margin: 0 0 20px; color: #5c5346; max-width: 52rem; line-height: 1.5; }
    .grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    .card { margin: 0; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5ddd0; box-shadow: 0 10px 30px -22px rgba(40,28,18,.45); }
    .card img { display: block; width: 100%; height: auto; background: #efe6da; }
    figcaption { padding: 12px 14px 14px; font-size: 0.86rem; line-height: 1.4; }
    .muted { color: #8a8072; font-size: 0.78rem; }
    code { background: #efe6da; padding: 0.1em 0.35em; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>italki affiliate banner candidates</h1>
  <p>
    Link target: <code>https://www.italki.com/en/affshare?ref=af33117569</code><br/>
    Copy vibe: Find my Korean tutor ($10 discount) · 1:1 Korean lessons.<br/>
    Pick winners, then we place them on the site.
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

  console.log(`italki banners → ${OUT}`);
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

  // Include any other existing candidates in gallery if filtering.
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
