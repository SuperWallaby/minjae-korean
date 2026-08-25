/**
 * EN→EN Pinterest pin formats (sound.eigopin.com / EigoSound).
 *
 * 1) simple_upgrade — GPT art (no text) → composite gloss + punch word
 * 2) other_ways — GPT character bg → composite phrase list
 * 3) slang_card — full pin in one gpt-image-2 shot
 */
import { createHash } from "node:crypto";
import sharp from "sharp";
import {
  CAPYBARA_ART_STYLE,
  CAPYBARA_MASCOT,
} from "./vocab-infographic-gen.mjs";

export const EN_EN_PORTRAIT = { w: 1024, h: 1536 };
export const EN_EN_INK = "#111827";

const UPGRADE_BGS = ["#FFFDF8", "#F7F4EE", "#F5F7FA", "#FBF7F2", "#F3F1FF"];
const OTHER_WAYS_PALETTE = [
  { bg: "#22c55e", ink: "#ffffff", name: "green" },
  { bg: "#ef4444", ink: "#ffffff", name: "red" },
  { bg: "#3b82f6", ink: "#ffffff", name: "blue" },
  { bg: "#a855f7", ink: "#ffffff", name: "violet" },
  { bg: "#f59e0b", ink: "#111827", name: "amber" },
  { bg: "#0f172a", ink: "#f8fafc", name: "slate" },
];

function escapeXml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hashPick(id, list) {
  const hex = createHash("sha1").update(String(id || "")).digest("hex");
  return list[parseInt(hex.slice(0, 8), 16) % list.length];
}

function approxTextWidth(text, fontSize) {
  return String(text || "").length * fontSize * 0.55;
}

/** Soft dark halo so light ink stays readable on busy art. */
function inkFillOnly(ink) {
  return `fill="${escapeXml(ink)}"`;
}


export function pickSimpleUpgradeBg(id) {
  return hashPick(id, UPGRADE_BGS);
}

export function pickOtherWaysPalette(id) {
  return hashPick(id, OTHER_WAYS_PALETTE);
}

/** ---------- Format 1: simple_upgrade ---------- */

/**
 * Illustration-only. Sticker-scale subject centered with generous margins
 * (composite places it small in the middle — do NOT fill the frame).
 * @param {{ scene: string, bgColor?: string }} opts
 */
export function simpleUpgradeArtPrompt(opts) {
  const scene = String(opts.scene || "expressive character moment").trim();
  const bg = String(opts.bgColor || "#FFFDF8");
  return `Premium Pinterest vocabulary sticker illustration, portrait 2:3 (1024×1536).

SUBJECT ONLY — NO TEXT of any kind (no English, no letters, no numbers, no logos, no watermarks, no captions).

CAST (mandatory): ${CAPYBARA_MASCOT}
${CAPYBARA_ART_STYLE}
Do NOT draw humans, anime people, Pixar/Disney lookalikes, or any other mascot — ONLY this beige doodle capybara.

Scene / action: ${scene}
Solid cream background ${bg}. Optional very faint school-supply watermark doodles — barely visible.

COMPOSITION (critical):
- MEDIUM-SMALL centered CAPYBARA sticker — about 40–50% of canvas height, NOT full-bleed.
- Generous empty cream margin on all sides (top/bottom ~20%+).
- Clean single subject on plain cream — no frame, no card, no border in the art.
- Wobbly black outlines, flat soft fills, cute potato-chibi proportions.
- No collage, no UI chrome, no edge-to-edge character.`.trim();
}

/**
 * Simple upgrade flashcard: gloss → small centered art → punch word.
 * No INSTEAD OF / UPGRADE chrome, no card frame around the illustration.
 * @param {{
 *   simple: string,
 *   target: string,
 *   illustrationPng: Buffer,
 *   bgColor?: string,
 *   targetColor?: string,
 * }} opts
 */
async function sampleCornerCream(pngBuf) {
  const { data, info } = await sharp(pngBuf)
    .rotate()
    .ensureAlpha()
    .resize(64, 64, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  // Average four corners — GPT cream bg, so pin paper matches and the "box" disappears.
  const pts = [
    [0, 0],
    [info.width - 1, 0],
    [0, info.height - 1],
    [info.width - 1, info.height - 1],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of pts) {
    const i = (y * info.width + x) * info.channels;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  r = Math.round(r / pts.length);
  g = Math.round(g / pts.length);
  b = Math.round(b / pts.length);
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  return { r, g, b, hex };
}

/** Edge flood-fill: knock cream paper (connected to frame) to alpha. */
async function knockOutArtPaper(pngBuf, paper) {
  const { data, info } = await sharp(pngBuf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const out = Buffer.from(data);
  const thr2 = 72 * 72;
  const isPaper = (i) => {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    if (out[i + 3] < 8) return true;
    const dr = r - paper.r;
    const dg = g - paper.g;
    const db = b - paper.b;
    if (dr * dr + dg * dg + db * db <= thr2) return true;
    // Loose warm cream / off-white (keeps tan character fill)
    return (
      r >= 220 &&
      g >= 212 &&
      b >= 190 &&
      Math.abs(r - g) < 28 &&
      g - b < 36 &&
      r - b < 42 &&
      (r + g + b) / 3 >= 220
    );
  };

  const seen = new Uint8Array(W * H);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (seen[p]) return;
    const i = p * C;
    if (!isPaper(i)) return;
    seen[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < W; x++) {
    push(x, 0);
    push(x, H - 1);
  }
  for (let y = 0; y < H; y++) {
    push(0, y);
    push(W - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    out[p * C + 3] = 0;
    const x = p % W;
    const y = (p / W) | 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
  return sharp(out, {
    raw: { width: W, height: H, channels: C },
  })
    .png()
    .toBuffer();
}

export async function composeSimpleUpgradePin(opts) {
  const { w, h } = EN_EN_PORTRAIT;
  const simple = String(opts.simple || "").trim();
  const target = String(opts.target || "").trim();
  const targetColor = String(opts.targetColor || "#dc2626");

  // Match pin paper to illustration cream so the art rectangle doesn't show.
  const paper = await sampleCornerCream(opts.illustrationPng);
  const bg = paper.hex;

  let simpleSize = simple.length > 28 ? 58 : simple.length > 18 ? 68 : 78;
  let targetSize = target.length > 16 ? 108 : target.length > 10 ? 124 : 140;
  const maxTextW = w * 0.86;
  while (simpleSize > 40 && approxTextWidth(simple, simpleSize) > maxTextW)
    simpleSize -= 2;
  while (targetSize > 68 && approxTextWidth(target, targetSize) > maxTextW)
    targetSize -= 2;

  const simpleY = Math.round(h * 0.125);
  // Another ~10% smaller; contain (no cover-crop) so the full sticker stays in frame.
  const artH = Math.round(h * 0.5);
  const artW = Math.round(w * 0.635);
  const artTop = Math.round(h * 0.175);
  const artLeft = Math.round((w - artW) / 2);
  // Extra bottom padding under the target word.
  // Sit closer under the illustration (was 0.86 — too much gap).
  const targetY = Math.round(h * 0.74);

  const artScaled = await sharp(opts.illustrationPng)
    .rotate()
    .ensureAlpha()
    .resize(artW, artH, {
      fit: "contain",
      position: "centre",
      background: { r: paper.r, g: paper.g, b: paper.b, alpha: 1 },
    })
    .png()
    .toBuffer();
  const artRaw = await knockOutArtPaper(artScaled, paper);

  const typeSvg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="${escapeXml(bg)}"/>
  <text x="${w / 2}" y="${simpleY}" text-anchor="middle" dominant-baseline="middle"
    font-family="Avenir Next, Helvetica Neue, system-ui, sans-serif"
    font-size="${simpleSize}" font-weight="650" fill="#3f3f46">${escapeXml(simple)}</text>
  <text x="${w / 2}" y="${targetY}" text-anchor="middle" dominant-baseline="middle"
    font-family="Avenir Next, Helvetica Neue, system-ui, sans-serif"
    font-size="${targetSize}" font-weight="800" fill="${escapeXml(targetColor)}">${escapeXml(target)}</text>
</svg>`);

  const base = await sharp(typeSvg).png().toBuffer();
  return sharp(base)
    .composite([{ input: artRaw, top: artTop, left: artLeft }])
    .png()
    .toBuffer();
}


/** ---------- Format 2: other_ways ---------- */

/**
 * Character fills the right; left lane for phrases. No letters in art.
 * @param {{ mood: string, characterHint: string, bgColor: string }} opts
 */
export function otherWaysArtPrompt(opts) {
  const mood = String(opts.mood || "strong feeling").trim();
  const action = String(
    opts.characterHint || "expressive pose matching the mood",
  ).trim();
  const bg = String(opts.bgColor || "#22c55e");
  return `Premium Pinterest vocabulary background, portrait 2:3 (1024×1536).

NO TEXT of any kind (no English, no letters, no logos, no watermarks, no captions).

Solid vibrant background color ${bg} (subtle texture OK).

CAST (mandatory): ${CAPYBARA_MASCOT}
${CAPYBARA_ART_STYLE}
Do NOT draw humans, anime people, Pixar/Disney/Inside Out lookalikes, or any other mascot — ONLY this beige doodle capybara.

Pose / action: ${action}
Mood / emotion: ${mood}

COMPOSITION (critical — avoid empty space):
- Large CAPYBARA fills the RIGHT ~55–60% of the canvas (waist-up / 3/4 chibi, close crop).
- Character should feel BIG and present — potato body, sticker-chibi scale.
- LEFT ~45% MUST stay clear solid color only (text lane) — no paws, props, or face in that lane.
- Keep ALL limbs / raised hands / props inside the RIGHT 55%.
- High contrast, bold shapes, mobile-thumb readable, save-worthy edu-influencer look.
- Match brand sticker sheet line weight and flat fills exactly.`.trim();
}

/**
 * @param {{
 *   headline: string,
 *   phrases: string[],
 *   illustrationPng: Buffer,
 *   ink?: string,
 *   brand?: string,
 *   kicker?: string,
 * }} opts
 */
export async function composeOtherWaysPin(opts) {
  const { w, h } = EN_EN_PORTRAIT;
  const ink = String(opts.ink || "#ffffff");
  const kicker = String(opts.kicker || "Other ways to say").trim();
  const headline = String(opts.headline || "").trim().toUpperCase();
  // brand footer retired — ignore opts.brand
  const phrases = (opts.phrases || [])
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .slice(0, 14);

  // Character stays large / right-biased (Pinterest thumb-stop).
  const zoom = 1.28;
  const zw = Math.round(w * zoom);
  const zh = Math.round(h * zoom);
  const bgBuf = await sharp(opts.illustrationPng)
    .rotate()
    .ensureAlpha()
    .resize(zw, zh, { fit: "cover", position: "right" })
    .extract({
      left: zw - w,
      top: Math.round((zh - h) / 2),
      width: w,
      height: h,
    })
    .png()
    .toBuffer();

  const leftX = Math.round(w * 0.055);
  const maxPhraseW = Math.round(w * 0.46);
  const maxHeadlineW = Math.round(w * 0.55);

  // Title is the main lever — keep it big; leave list/layout alone.
  let headlineSize = headline.length > 18 ? 108 : headline.length > 12 ? 128 : 148;
  while (
    headlineSize > 72 &&
    approxTextWidth(headline, headlineSize) > maxHeadlineW
  ) {
    headlineSize -= 2;
  }

  const kickerY = Math.round(h * 0.042);
  const headlineY = Math.round(h * 0.12);
  const listTop = Math.round(h * 0.2);
  const listBottom = h - 40;
  const n = Math.max(phrases.length, 1);
  const span = Math.max(listBottom - listTop, 1);
  const slotH = span / n;

  let phraseSize = Math.min(
    52,
    Math.max(34, Math.floor(slotH / 1.18)),
  );
  while (phraseSize > 28) {
    const tooWide = phrases.some(
      (p) => approxTextWidth(p, phraseSize) > maxPhraseW,
    );
    if (!tooWide) break;
    phraseSize -= 1;
  }

  const inkAttrs = inkFillOnly(ink);
  const phraseLines = phrases
    .map((p, i) => {
      const y = Math.round(listTop + slotH * (i + 0.5) + phraseSize * 0.35);
      return `<text x="${leftX}" y="${y}" text-anchor="start"
    font-family="Avenir Next, Helvetica Neue, system-ui, sans-serif"
    font-size="${phraseSize}" font-weight="800" ${inkAttrs}>${escapeXml(p)}</text>`;
    })
    .join("\n");

  const scrimW = Math.round(w * 0.58);
  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="leftScrim" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.58"/>
      <stop offset="42%" stop-color="#000000" stop-opacity="0.38"/>
      <stop offset="75%" stop-color="#000000" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${scrimW}" height="${h}" fill="url(#leftScrim)"/>
  <text x="${leftX}" y="${kickerY}" text-anchor="start"
    font-family="Avenir Next, Helvetica Neue, system-ui, sans-serif"
    font-size="34" font-weight="700" ${inkAttrs}>${escapeXml(kicker)}</text>
  <text x="${leftX}" y="${headlineY}" text-anchor="start"
    font-family="Avenir Next, Helvetica Neue, system-ui, sans-serif"
    font-size="${headlineSize}" font-weight="800" ${inkAttrs}>${escapeXml(headline)}</text>
  ${phraseLines}
</svg>`);

  return sharp(bgBuf)
    .composite([{ input: svg, top: 0, left: 0 }])
    .png()
    .toBuffer();
}

/** ---------- Format 3: slang_card (oneshot) ---------- */

/**
 * @param {{
 *   label: string,
 *   word: string,
 *   definition: string,
 *   example: string,
 *   scene: string,
 *   accent?: string,
 * }} opts
 */
export function slangCardFullPinPrompt(opts) {
  const label = String(opts.label || "Modern English Slang").trim();
  const word = String(opts.word || "").trim();
  const definition = String(opts.definition || "")
    .replace(/\s+/g, " ")
    .trim();
  const example = String(opts.example || "")
    .replace(/\s+/g, " ")
    .trim();
  const scene = String(
    opts.scene || "simple scene that shows the meaning",
  ).trim();
  const accent = String(opts.accent || "deep purple / violet").trim();

  if (!word) throw new Error("slang_card requires word");
  if (!definition) throw new Error("slang_card requires definition");
  if (!example) throw new Error("slang_card requires example");

  return `Create a single tall vertical Pinterest vocabulary card, full finished graphic 1024×1536 (portrait 2:3), ready to post. ONE complete design — paint ALL text into the image. Do NOT leave empty bands for external typography.

STYLE: clean educational flashcard / language-teacher pin.
- White / near-white paper background (#FFFFFF–#FAFAFC), flat, soft studio light.
- Accent color: ${accent} for the series label, the huge headword, divider ornaments, and the highlighted word inside the example.
- Body text (definition + non-highlighted example words): near-black charcoal.
- Mix: small elegant serif for the top series label; bold modern sans-serif for the headword; clean sans for definition and example.
- Flat 2D vector illustration (not photoreal, not 3D CGI), soft muted cafe/office palette.

LAYOUT (strict top → bottom stack — KEEP STACK TIGHT, minimal empty whitespace between sections):
1) TOP: centered series label exactly: "${label.replace(/"/g, '\\"')}"
   Small serif, ${accent}, flanked by short thin accent lines / soft swirls.
2) Below label: the headword in HUGE bold sans-serif, centered, fill ${accent}.
   Exact spelling (case as given): "${word.replace(/"/g, '\\"')}"
3) Directly under the headword: one short definition in medium black sans-serif, centered, wrap to 2 lines max.
   Exact text: "${definition.replace(/"/g, '\\"')}"
4) MIDDLE (~45% of height): LARGE centered illustration that clearly shows the meaning — fill the middle band, not a tiny sticker.
   Scene: ${scene}
   Keep illustration inside the white card — no full-bleed photo, no phone UI chrome, no extra captions inside the art.
5) BOTTOM: thin accent divider, then one italic example sentence, centered.
   Exact sentence: "${example.replace(/"/g, '\\"')}"
   Inside that sentence, make the word "${word.replace(/"/g, '\\"')}" (or its conjugated form if the sentence uses one) bold + ${accent}; the rest of the sentence stays charcoal italic.

Hard rules:
- Spell every locked string EXACTLY as written above — no synonyms, no extra slogans, no hashtags, no logos, no watermarks, no QR, no URL, no brand footer.
- No Korean/Japanese. English only.
- Mobile-thumb readable: headword must dominate; definition and example must stay clear.
- Single composition on one white card — not a collage of multiple panels.
- Avoid large empty white gaps between sections.`.trim();
}
