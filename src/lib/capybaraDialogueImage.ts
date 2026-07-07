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
  /** Answer text bottom must stay above this y (0–1) — clears capybara heads. */
  answerMaxBottomY?: number;
};

/** Default layout for repo `capybara.png` (1600×983). */
export const DEFAULT_CAPYBARA_DIALOGUE_LAYOUT: CapybaraDialogueLayout = {
  questionBox: { x: 0.05, y: 0.08, maxWidth: 0.4 },
  answerBox: { x: 0.52, y: 0.08, maxWidth: 0.43 },
  leftAnchor: { x: 0.24, y: 0.36 },
  /** Right capybara — line starts at the right edge of the bread collar. */
  rightAnchor: { x: 0.81, y: 0.51 },
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
  /** Compared words — enables "When to use" / "a vs b" question split. */
  questionWords?: string[];
  /** Answer: comma-separated synonyms, a sentence, or an array of either. */
  answers?: string | string[];
  /** Per-word grouped lines: `{word} for a, b, c` — use with `answerFormat: "groupedList"`. */
  groupedAnswers?: GroupedAnswer[];
  /** One keyword per word, `{word}: keyword` lines. */
  groupedListCompact?: boolean;
  /** Minimum vertical gap between grouped dialogue entries (px at 1600px canvas width). */
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
  /** Extra dy for blank separator lines between dialogue entries. */
  entryGap?: number;
  fontSize: number;
  color: string;
  fontWeight?: number;
};

type Point = { x: number; y: number };

const QUESTION_TEXT_COLOR = "#15803d";
const ANSWER_TEXT_COLOR = "#111827";
/** Right connector — softer than answer text. */
const ANSWER_CONNECTOR_COLOR = "#636972";
const BRAND_TEXT = "kajakorean.com";
const BRAND_TEXT_COLOR = "#6b7280";
/** Logo height in final 960px WebP output. */
const BRAND_LOGO_HEIGHT_FINAL = 36;
const BRAND_IMAGE_WIDTH_FINAL = 960;
/** Min gap between grouped answer lines at 1600px output width. */
const DEFAULT_GROUPED_ENTRY_GAP = 24;
/** Left connector: start this far below question text (px at 960px final width). */
const LEFT_CONNECTOR_Y_OFFSET_FINAL = 50;
/** Right connector: line ends this far right of bread anchor (px at 960px final width). */
const RIGHT_CONNECTOR_END_H_OFFSET_FINAL = 70;
/** Extra top header (px at 1600px width) — extends canvas with base paper color. */
const TOP_HEADER_PAD_FINAL = 110;
/** Text inset from top of canvas (px at 960px final width). */
const TEXT_TOP_PAD_FINAL = 36;
/** Extra top inset for left question only (px at 960px final width). */
const QUESTION_EXTRA_TOP_PAD_FINAL = 20;
/** Extra left inset for right answer (px at 960px final width). */
const ANSWER_EXTRA_LEFT_PAD_FINAL = 20;
const FALLBACK_PAPER_BG = { r: 243, g: 238, b: 232 };

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

function linePixelWidth(line: string, fontSize: number, wide = false): number {
  return line.length * approxCharWidth(fontSize, wide);
}

function lineFitsWidth(
  line: string,
  maxWidthPx: number,
  fontSize: number,
  wide = false,
): boolean {
  return linePixelWidth(line, fontSize, wide) <= maxWidthPx;
}

/** "When to use a vs b?" → split only when the single line overflows. */
function formatQuestionLines(
  question: string,
  maxWidthPx: number,
  fontSize: number,
  wordNames?: string[],
): string[] {
  const words = (wordNames ?? []).map((w) => w.trim()).filter(Boolean);
  const q = question.trim().endsWith("?") ? question.trim() : `${question.trim()}?`;

  if (words.length >= 2) {
    const single = `When to use ${words.join(" vs ")}?`;
    if (lineFitsWidth(single, maxWidthPx, fontSize, true)) {
      return [single];
    }
    return ["When to use", `${words.join(" vs ")}?`];
  }

  if (lineFitsWidth(q, maxWidthPx, fontSize, true)) {
    return [q];
  }

  const whenUse = q.match(/^When to use\s+(.+?)\?$/i);
  if (whenUse) {
    return ["When to use", `${whenUse[1]!.trim()}?`];
  }

  return wrapWords(q, maxCharsForWidth(maxWidthPx, fontSize, true));
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

function approxCharWidth(fontSize: number, wide = false): number {
  return fontSize * (wide ? 0.68 : 0.58);
}

function maxCharsForWidth(maxWidthPx: number, fontSize: number, wide = false): number {
  return Math.max(8, Math.floor(maxWidthPx / approxCharWidth(fontSize, wide)));
}

function blockLineWidth(block: TextBlock, lineIndex: number): number {
  const line = block.lines[lineIndex] ?? "";
  return line.length * approxCharWidth(block.fontSize);
}

function blockTextHeight(block: TextBlock): number {
  let height = block.fontSize * 0.12;
  for (let i = 0; i < block.lines.length; i++) {
    if (i === 0) continue;
    const line = block.lines[i] ?? "";
    height += line === "" && block.entryGap ? block.entryGap : block.lineHeight;
  }
  return height;
}

function blockBottomY(block: TextBlock): number {
  return block.y + blockTextHeight(block);
}

function blockLineStart(block: TextBlock, side: "left" | "right"): Point {
  const textHeight = blockTextHeight(block);
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

/** Fit answer above capybara heads — shrink gaps/font only, keep line-height. */
function fitAnswerBlockVertically(
  lines: string[],
  box: { x: number; y: number },
  maxBottomY: number,
  start: { fontSize: number; lineHeight: number; entryGap?: number },
): { lines: string[]; fontSize: number; lineHeight: number; entryGap?: number } {
  const lineHeight = start.lineHeight;
  let fontSize = start.fontSize;
  let entryGap = start.entryGap;
  const minEntryGap =
    start.entryGap != null
      ? Math.max(Math.round(start.entryGap * 0.72), Math.round(14 * (lineHeight / 56)))
      : undefined;
  const minFontSize = Math.round(start.fontSize * 0.9);

  const fits = () =>
    blockBottomY({
      lines,
      x: box.x,
      y: box.y,
      lineHeight,
      entryGap,
      fontSize,
      color: ANSWER_TEXT_COLOR,
    }) <= maxBottomY;

  if (fits()) {
    return { lines, fontSize, lineHeight, entryGap };
  }

  if (entryGap != null && minEntryGap != null) {
    while (entryGap > minEntryGap && !fits()) {
      entryGap = Math.max(minEntryGap, Math.round(entryGap * 0.9));
    }
    if (fits()) {
      return { lines, fontSize, lineHeight, entryGap };
    }
  }

  while (fontSize > minFontSize && !fits()) {
    fontSize = Math.max(minFontSize, Math.round(fontSize * 0.97));
  }

  return { lines, fontSize, lineHeight, entryGap };
}

/** Right answer line: bread right edge → curved path to (start.x + 70px, text baseline y). */
function rightConnectorPath(
  textEnd: Point,
  breadAnchor: Point,
  outW: number,
): string {
  const offset =
    RIGHT_CONNECTOR_END_H_OFFSET_FINAL * (outW / BRAND_IMAGE_WIDTH_FINAL);
  const endX = Math.min(breadAnchor.x + offset, outW - 8);
  const endY = textEnd.y;
  const dx = endX - breadAnchor.x;
  const dy = endY - breadAnchor.y;
  const cp1X = breadAnchor.x + dx * 0.82;
  const cp1Y = breadAnchor.y;
  const cp2X = endX - dx * 0.08;
  const cp2Y = breadAnchor.y + dy * 0.52;
  return [
    `M ${breadAnchor.x.toFixed(1)} ${breadAnchor.y.toFixed(1)}`,
    `C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)} ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
  ].join(" ");
}

/** Question text (below block) → left capybara anchor. */
function leftConnectorPath(from: Point, to: Point, outW: number): string {
  const yOffset =
    LEFT_CONNECTOR_Y_OFFSET_FINAL * (outW / BRAND_IMAGE_WIDTH_FINAL);
  const startY = from.y + yOffset;
  return `M ${from.x.toFixed(1)} ${startY.toFixed(1)} Q ${from.x.toFixed(1)} ${to.y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

function renderTextBlock(block: TextBlock): string {
  const weight = block.fontWeight ?? 400;
  const entryGap = block.entryGap ?? block.lineHeight;
  const tspans = block.lines
    .map((line, i) => {
      if (i === 0) {
        return `<tspan x="${block.x.toFixed(1)}" dy="0">${escapeXml(line)}</tspan>`;
      }
      const dy = line === "" ? entryGap : block.lineHeight;
      return `<tspan x="${block.x.toFixed(1)}" dy="${dy}">${escapeXml(line)}</tspan>`;
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
  const leftPath = leftConnectorPath(qStart, leftAnchor, width);
  const rightPath = rightConnectorPath(aStart, rightAnchor, width);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <path d="${leftPath}" fill="none" stroke="${questionBlock.color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${rightPath}" fill="none" stroke="${ANSWER_CONNECTOR_COLOR}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  ${renderTextBlock(questionBlock)}
  ${renderTextBlock(answerBlock)}
</svg>`;
}

async function samplePaperBackground(
  basePath: string,
): Promise<{ r: number; g: number; b: number }> {
  try {
    const { data, info } = await sharp(basePath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const w = info.width;
    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;
    const rows = Math.min(12, info.height);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * info.channels;
        r += data[i] ?? 0;
        g += data[i + 1] ?? 0;
        b += data[i + 2] ?? 0;
        n += 1;
      }
    }
    if (n === 0) return FALLBACK_PAPER_BG;
    return {
      r: Math.round(r / n),
      g: Math.round(g / n),
      b: Math.round(b / n),
    };
  } catch {
    return FALLBACK_PAPER_BG;
  }
}

async function buildExtendedBase(
  base: sharp.Sharp,
  outW: number,
  outH: number,
  topPad: number,
  bg: { r: number; g: number; b: number },
): Promise<Buffer> {
  const art = await base.resize(outW, outH).png().toBuffer();
  return sharp({
    create: {
      width: outW,
      height: outH + topPad,
      channels: 3,
      background: bg,
    },
  })
    .composite([{ input: art, top: topPad, left: 0 }])
    .png()
    .toBuffer();
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
  const topPad = Math.round(TOP_HEADER_PAD_FINAL * scale);
  const canvasH = outH + topPad;
  const paperBg = await samplePaperBackground(basePath);

  const questionFont = Math.round(44 * scale);
  const answerFont = Math.round(40 * scale);
  const questionLineHeight = Math.round(50 * scale);
  const isCompactGrouped = isGrouped && Boolean(input.groupedListCompact);
  const entryGapPx = input.groupedListCompactGap ?? DEFAULT_GROUPED_ENTRY_GAP;
  const answerEntryGap = isCompactGrouped ? Math.round(entryGapPx * scale) : undefined;
  const answerLineHeight = Math.round((isCompactGrouped ? 56 : 48) * scale);

  const textMarginY = Math.round(
    TEXT_TOP_PAD_FINAL * (outW / BRAND_IMAGE_WIDTH_FINAL),
  );
  const questionExtraTop = Math.round(
    QUESTION_EXTRA_TOP_PAD_FINAL * (outW / BRAND_IMAGE_WIDTH_FINAL),
  );
  const qBoxX = layout.questionBox.x * outW;
  const qBoxY = textMarginY + questionExtraTop;
  const qMaxW = layout.questionBox.maxWidth * outW;
  const answerExtraLeft = Math.round(
    ANSWER_EXTRA_LEFT_PAD_FINAL * (outW / BRAND_IMAGE_WIDTH_FINAL),
  );
  const aBoxX = layout.answerBox.x * outW + answerExtraLeft;
  const aBoxY = textMarginY;
  const aMaxW = layout.answerBox.maxWidth * outW - answerExtraLeft;
  const answerMaxBottomY = topPad - Math.round(10 * scale);

  const questionLines = formatQuestionLines(
    question,
    qMaxW,
    questionFont,
    input.questionWords,
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

  const fitted = fitAnswerBlockVertically(
    answerLines,
    { x: aBoxX, y: aBoxY },
    answerMaxBottomY,
    {
      fontSize: answerFont,
      lineHeight: answerLineHeight,
      entryGap: answerEntryGap,
    },
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
    lines: fitted.lines,
    x: aBoxX,
    y: aBoxY,
    lineHeight: fitted.lineHeight,
    entryGap: fitted.entryGap,
    fontSize: fitted.fontSize,
    color: ANSWER_TEXT_COLOR,
    fontWeight: 700,
  };

  const leftAnchor: Point = {
    x: layout.leftAnchor.x * outW,
    y: layout.leftAnchor.y * outH + topPad,
  };
  const rightAnchor: Point = {
    x: layout.rightAnchor.x * outW,
    y: layout.rightAnchor.y * outH + topPad,
  };

  const svg = buildOverlaySvg(
    outW,
    canvasH,
    questionBlock,
    answerBlock,
    leftAnchor,
    rightAnchor,
  );

  const extendedBase = await buildExtendedBase(base, outW, outH, topPad, paperBg);

  const layers: sharp.OverlayOptions[] = [
    { input: Buffer.from(svg), top: 0, left: 0 },
  ];
  if (brandFooterEnabled(input)) {
    layers.push(...(await buildBrandFooterLayers(outW, canvasH)));
  }

  return sharp(extendedBase).composite(layers).png().toBuffer();
}
