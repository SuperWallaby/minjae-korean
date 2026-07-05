import fs from "fs";
import path from "path";

import sharp from "sharp";

/** Base plate: two capybaras (question left, answer right). */
export function capybaraDialogueBaseImagePath(): string {
  const env = process.env.CAPYBARA_DIALOGUE_BASE_IMAGE?.trim();
  if (env) {
    return path.isAbsolute(env) ? env : path.join(process.cwd(), env);
  }
  return path.join(process.cwd(), "capybara.png");
}

export type CapybaraDialogueLayout = {
  /** Left text column (question). */
  questionBox: { x: number; y: number; maxWidth: number };
  /** Right text column (answer word list). */
  answerBox: { x: number; y: number; maxWidth: number };
  /** Line ends near each character — short of the illustration (0–1 fractions). */
  leftAnchor: { x: number; y: number };
  rightAnchor: { x: number; y: number };
};

/** Default layout for repo `capybara.png` (1600×983). */
export const DEFAULT_CAPYBARA_DIALOGUE_LAYOUT: CapybaraDialogueLayout = {
  questionBox: { x: 0.05, y: 0.08, maxWidth: 0.4 },
  answerBox: { x: 0.52, y: 0.08, maxWidth: 0.43 },
  leftAnchor: { x: 0.24, y: 0.36 },
  rightAnchor: { x: 0.76, y: 0.36 },
};

export type AnswerFormat = "auto" | "list" | "sentence" | "groupedList";

export type GroupedAnswer = {
  word: string;
  /** Short situation labels joined after "for" on each line. */
  situations: string[];
};

export type RenderCapybaraDialogueImageInput = {
  /** Question shown above the left character. */
  question: string;
  /** Answer: comma-separated synonyms, a sentence, or an array of either. */
  answers?: string | string[];
  /** Per-word grouped lines: `{word} for a, b, c` — use with `answerFormat: "groupedList"`. */
  groupedAnswers?: GroupedAnswer[];
  /** One keyword per word, `{word}: keyword` lines. */
  groupedListCompact?: boolean;
  /** Extra vertical gap between compact grouped lines (one per compared word). */
  groupedListCompactGap?: number;
  /** `list` = comma-separated chips; `sentence` = prose wrap; `groupedList` = per-word lines; `auto` = detect (default). */
  answerFormat?: AnswerFormat;
  baseImagePath?: string;
  layout?: CapybaraDialogueLayout;
  /** Output width; height scales with source aspect ratio. */
  outputWidth?: number;
  /** Logo + kajakorean.com footer (default on). */
  showBrandFooter?: boolean;
};

type TextBlock = {
  lines: string[];
  x: number;
  y: number;
  lineHeight: number;
  fontSize: number;
  color: string;
  fontWeight?: number;
};

type Point = { x: number; y: number };

const QUESTION_TEXT_COLOR = "#15803d";
const ANSWER_TEXT_COLOR = "#111827";
const BRAND_TEXT = "kajakorean.com";
const BRAND_TEXT_COLOR = "#6b7280";
/** Logo height in final 960px WebP output. */
const BRAND_LOGO_HEIGHT_FINAL = 36;
const BRAND_IMAGE_WIDTH_FINAL = 960;

function brandLogoPath(): string {
  const env = process.env.CAPYBARA_BRAND_LOGO?.trim();
  if (env) {
    return path.isAbsolute(env) ? env : path.join(process.cwd(), env);
  }
  return path.join(process.cwd(), "public/brand/logo.webp");
}

function brandFooterEnabled(input: RenderCapybaraDialogueImageInput): boolean {
  if (input.showBrandFooter === false) return false;
  const env = process.env.CAPYBARA_BRAND_FOOTER?.trim().toLowerCase();
  if (env === "0" || env === "false" || env === "off") return false;
  return true;
}

async function buildBrandFooterLayers(
  outW: number,
  outH: number,
): Promise<sharp.OverlayOptions[]> {
  const logoPath = brandLogoPath();
  if (!fs.existsSync(logoPath)) return [];

  const logoH = Math.round(
    BRAND_LOGO_HEIGHT_FINAL * (outW / BRAND_IMAGE_WIDTH_FINAL),
  );
  const fontSize = Math.round(logoH * 0.56);
  const gap = Math.round(logoH * 0.22);
  const bottomPad = Math.round(logoH * 0.48);

  const logoBuf = await sharp(logoPath)
    .resize({ height: logoH, fit: "contain" })
    .png()
    .toBuffer();
  const logoMeta = await sharp(logoBuf).metadata();
  const logoW = logoMeta.width ?? logoH;

  const textW = Math.ceil(BRAND_TEXT.length * fontSize * 0.54);
  const rowH = logoH;
  const totalW = logoW + gap + textW;
  const left = Math.max(0, Math.round((outW - totalW) / 2));
  const top = Math.max(0, Math.round(outH - bottomPad - rowH));

  const textSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${textW + 2}" height="${rowH}">
  <text
    x="0"
    y="${(rowH / 2).toFixed(1)}"
    dominant-baseline="middle"
    alignment-baseline="middle"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-size="${fontSize}"
    font-weight="500"
    fill="${BRAND_TEXT_COLOR}"
  >${escapeXml(BRAND_TEXT)}</text>
</svg>`;
  const textBuf = Buffer.from(textSvg);

  const rowW = logoW + gap + textW;
  const rowBuf = await sharp({
    create: {
      width: rowW,
      height: rowH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: logoBuf, top: 0, left: 0 },
      { input: textBuf, top: 0, left: logoW + gap },
    ])
    .png()
    .toBuffer();

  return [{ input: rowBuf, top, left }];
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parseAnswerList(raw: string | string[]): string[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => s.trim()).filter(Boolean);
  }
  return raw
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function looksLikeSynonymList(parts: string[]): boolean {
  if (parts.length <= 1) return false;
  return parts.every(
    (p) => p.length <= 40 && !/[.!?。！？]/.test(p) && p.split(/\s+/).length <= 4,
  );
}

function resolveAnswerFormat(
  raw: string | string[],
  explicit: AnswerFormat | undefined,
): AnswerFormat {
  if (explicit && explicit !== "auto") return explicit;
  if (Array.isArray(raw)) {
    if (raw.length === 1) return "sentence";
    return looksLikeSynonymList(raw.map((s) => s.trim()).filter(Boolean))
      ? "list"
      : "sentence";
  }
  const trimmed = raw.trim();
  if (!/[,，、]/.test(trimmed)) return "sentence";
  const parts = parseAnswerList(trimmed);
  return looksLikeSynonymList(parts) ? "list" : "sentence";
}

function formatAnswerLines(
  raw: string | string[],
  maxChars: number,
  format: AnswerFormat,
): string[] {
  if (format === "sentence") {
    const text = Array.isArray(raw) ? raw.join(" ").trim() : raw.trim();
    return wrapWords(text, maxChars);
  }
  const parts = parseAnswerList(raw);
  if (parts.length === 0) return [];
  if (parts.length === 1) return wrapWords(parts[0]!, maxChars);
  return wrapAnswerWords(parts, maxChars);
}

function wrapWords(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const w = words[i]!;
    const candidate = `${line} ${w}`;
    if (candidate.length > maxChars) {
      lines.push(line);
      line = w;
    } else {
      line = candidate;
    }
  }
  lines.push(line);
  return lines;
}

function wrapAnswerWords(words: string[], maxChars: number): string[] {
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = words[0]!;
  for (let i = 1; i < words.length; i++) {
    const w = words[i]!;
    const candidate = `${line}, ${w}`;
    if (candidate.length > maxChars) {
      lines.push(`${line},`);
      line = w;
    } else {
      line = candidate;
    }
  }
  lines.push(line);
  return lines;
}

function formatGroupedAnswerLine(
  word: string,
  situations: string[],
  compact = false,
): string {
  const label = word.trim();
  const parts = situations.map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return label;
  if (compact) {
    return `${label}: ${parts[0]}`;
  }
  return `${label} for ${parts.join(", ")}`;
}

function formatGroupedAnswerLines(
  grouped: GroupedAnswer[],
  maxChars: number,
  compact = false,
): string[] {
  const rawLines = grouped
    .map((g) =>
      formatGroupedAnswerLine(
        g.word,
        compact ? g.situations.slice(0, 1) : g.situations,
        compact,
      ),
    )
    .filter(Boolean);
  if (rawLines.length === 0) return [];
  if (compact) {
    const lines: string[] = [];
    for (let i = 0; i < rawLines.length; i++) {
      if (i > 0) lines.push("");
      lines.push(...wrapWords(rawLines[i]!, maxChars));
    }
    return lines;
  }
  const lines: string[] = [];
  for (const raw of rawLines) {
    const wrapped = wrapWords(raw, maxChars);
    lines.push(...wrapped);
  }
  return lines;
}

function approxCharWidth(fontSize: number): number {
  return fontSize * 0.58;
}

function maxCharsForWidth(maxWidthPx: number, fontSize: number): number {
  return Math.max(8, Math.floor(maxWidthPx / approxCharWidth(fontSize)));
}

function blockLineWidth(block: TextBlock, lineIndex: number): number {
  const line = block.lines[lineIndex] ?? "";
  return line.length * approxCharWidth(block.fontSize);
}

function blockLineStart(block: TextBlock, side: "left" | "right"): Point {
  const textHeight =
    block.lines.length * block.lineHeight + block.fontSize * 0.12;
  const lastLineIndex = Math.max(0, block.lines.length - 1);
  const x =
    side === "left"
      ? block.x
      : block.x + blockLineWidth(block, lastLineIndex);
  return {
    x,
    y: block.y + textHeight,
  };
}

/** Smooth curve from text to a near-point beside each character. */
function connectorPath(from: Point, to: Point, side: "left" | "right"): string {
  if (side === "left") {
    // Drop under the question, then sweep inward toward the left capybara.
    return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${from.x.toFixed(1)} ${to.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
  }
  // Mirror: bow outward (right) under the answer, then down to the near-point.
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} Q ${to.x.toFixed(1)} ${from.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

function renderTextBlock(block: TextBlock): string {
  const weight = block.fontWeight ?? 400;
  const tspans = block.lines
    .map((line, i) => {
      const dy = i === 0 ? 0 : block.lineHeight;
      return `<tspan x="${block.x.toFixed(1)}" dy="${i === 0 ? 0 : dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");
  return `<text
    x="${block.x.toFixed(1)}"
    y="${block.y.toFixed(1)}"
    dominant-baseline="hanging"
    text-anchor="start"
    font-family="'Courier New', Courier, monospace"
    font-size="${block.fontSize}"
    font-weight="${weight}"
    fill="${block.color}"
    xml:space="preserve"
  >${tspans}</text>`;
}

function buildOverlaySvg(
  width: number,
  height: number,
  questionBlock: TextBlock,
  answerBlock: TextBlock,
  leftAnchor: Point,
  rightAnchor: Point,
): string {
  const qStart = blockLineStart(questionBlock, "left");
  const aStart = blockLineStart(answerBlock, "right");
  const leftPath = connectorPath(qStart, leftAnchor, "left");
  const rightPath = connectorPath(aStart, rightAnchor, "right");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="${leftPath}" fill="none" stroke="${questionBlock.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${rightPath}" fill="none" stroke="${answerBlock.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  ${renderTextBlock(questionBlock)}
  ${renderTextBlock(answerBlock)}
</svg>`;
}

/**
 * Composite question (left) + answer word list (right) onto `capybara.png`,
 * with simple curved connector lines to each character (no speech bubbles).
 */
export async function renderCapybaraDialogueImage(
  input: RenderCapybaraDialogueImageInput,
): Promise<Buffer> {
  const basePath = input.baseImagePath ?? capybaraDialogueBaseImagePath();
  if (!fs.existsSync(basePath)) {
    throw new Error(`Capybara base image not found: ${basePath}`);
  }

  const layout = input.layout ?? DEFAULT_CAPYBARA_DIALOGUE_LAYOUT;
  const question = String(input.question ?? "").trim();
  const answerFormatInput = input.answerFormat ?? "auto";
  const isGrouped = answerFormatInput === "groupedList";
  const groupedAnswers = (input.groupedAnswers ?? []).filter(
    (g) => g.word.trim() && g.situations.some((s) => s.trim()),
  );
  const answers = isGrouped ? [] : parseAnswerList(input.answers ?? []);
  if (!question) throw new Error("question is required");
  if (isGrouped) {
    if (groupedAnswers.length === 0) {
      throw new Error("groupedAnswers must contain at least one word with situations");
    }
  } else if (answers.length === 0) {
    throw new Error("answers must contain at least one word");
  }

  const base = sharp(basePath);
  const meta = await base.metadata();
  const srcW = meta.width ?? 1600;
  const srcH = meta.height ?? 983;
  const outW = input.outputWidth ?? srcW;
  const scale = outW / srcW;
  const outH = Math.round(srcH * scale);

  const questionFont = Math.round(44 * scale);
  const answerFont = Math.round(40 * scale);
  const questionLineHeight = Math.round(50 * scale);
  const isCompactGrouped = isGrouped && Boolean(input.groupedListCompact);
  const compactGap = input.groupedListCompactGap ?? 14;
  const answerLineHeight = Math.round(
    (isCompactGrouped ? 56 + compactGap * 0.35 : 48) * scale,
  );

  const qBoxX = layout.questionBox.x * outW;
  const qBoxY = layout.questionBox.y * outH;
  const qMaxW = layout.questionBox.maxWidth * outW;
  const aBoxX = layout.answerBox.x * outW;
  const aBoxY = layout.answerBox.y * outH;
  const aMaxW = layout.answerBox.maxWidth * outW;

  const questionLines = wrapWords(
    question.endsWith("?") ? question : `${question}?`,
    maxCharsForWidth(qMaxW, questionFont),
  );
  const answerFormat = isGrouped
    ? "groupedList"
    : resolveAnswerFormat(answers, input.answerFormat);
  const answerLines =
    answerFormat === "groupedList"
      ? formatGroupedAnswerLines(
          groupedAnswers,
          maxCharsForWidth(aMaxW, answerFont),
          Boolean(input.groupedListCompact),
        )
      : formatAnswerLines(
          answers,
          maxCharsForWidth(aMaxW, answerFont),
          answerFormat,
        );

  const questionBlock: TextBlock = {
    lines: questionLines,
    x: qBoxX,
    y: qBoxY,
    lineHeight: questionLineHeight,
    fontSize: questionFont,
    color: QUESTION_TEXT_COLOR,
    fontWeight: 700,
  };
  const answerBlock: TextBlock = {
    lines: answerLines,
    x: aBoxX,
    y: aBoxY,
    lineHeight: answerLineHeight,
    fontSize: answerFont,
    color: ANSWER_TEXT_COLOR,
    fontWeight: 700,
  };

  const leftAnchor: Point = {
    x: layout.leftAnchor.x * outW,
    y: layout.leftAnchor.y * outH,
  };
  const rightAnchor: Point = {
    x: layout.rightAnchor.x * outW,
    y: layout.rightAnchor.y * outH,
  };

  const svg = buildOverlaySvg(
    outW,
    outH,
    questionBlock,
    answerBlock,
    leftAnchor,
    rightAnchor,
  );

  const resizedBase =
    outW === srcW
      ? await base.png().toBuffer()
      : await base.resize(outW, outH).png().toBuffer();

  const layers: sharp.OverlayOptions[] = [
    { input: Buffer.from(svg), top: 0, left: 0 },
  ];
  if (brandFooterEnabled(input)) {
    layers.push(...(await buildBrandFooterLayers(outW, outH)));
  }

  return sharp(resizedBase).composite(layers).png().toBuffer();
}
