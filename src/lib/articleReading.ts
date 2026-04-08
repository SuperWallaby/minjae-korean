export type ParagraphBlock = {
  image?: string;
  subtitle: string;
  content: string;
  youtube?: string;
};

export type ReadingCue = {
  id: string;
  paragraphIndex: number;
  kind: "subtitle" | "sentence";
  text: string;
  startMs: number;
  endMs: number;
  sentenceIndex: number;
  order: number;
};

export type VttSegment = {
  startMs: number;
  endMs: number;
  text: string;
};

type ReadingUnit = Omit<ReadingCue, "startMs" | "endMs">;

const SENTENCE_FALLBACK_RE =
  /[^.!?。\n]+(?:[.!?。]+(?:["'”’)\]]+)?)?|[^\n]+$/g;

function normalizeLineBreaks(text: string): string {
  return text.replace(/\u0085/g, "\n").replace(/\r\n?/g, "\n");
}

function sanitizeWhitespace(text: string): string {
  return normalizeLineBreaks(text).replace(/[ \t]+/g, " ").trim();
}

function normalizeForAlignment(text: string): string {
  return sanitizeWhitespace(text)
    .normalize("NFKC")
    .replace(/["'“”‘’.,!?;:()[\]{}\-–—…/]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function cueId(
  paragraphIndex: number,
  kind: "subtitle" | "sentence",
  sentenceIndex: number,
): string {
  return `p${paragraphIndex}-${kind}-${sentenceIndex}`;
}

export function splitIntoSentences(text: string): string[] {
  const cleaned = sanitizeWhitespace(text);
  if (!cleaned) return [];

  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ko", { granularity: "sentence" });
    const parts = Array.from(segmenter.segment(cleaned))
      .map((part) => sanitizeWhitespace(part.segment))
      .filter(Boolean);
    if (parts.length > 0) return parts;
  }

  return cleaned
    .split("\n")
    .flatMap((line) => line.match(SENTENCE_FALLBACK_RE) ?? [])
    .map((part) => sanitizeWhitespace(part))
    .filter(Boolean);
}

export function buildReadingUnits(paragraphs: ParagraphBlock[]): ReadingUnit[] {
  const units: ReadingUnit[] = [];
  let order = 0;

  for (let paragraphIndex = 0; paragraphIndex < paragraphs.length; paragraphIndex += 1) {
    const paragraph = paragraphs[paragraphIndex];
    const subtitle = sanitizeWhitespace(paragraph.subtitle ?? "");
    if (subtitle) {
      units.push({
        id: cueId(paragraphIndex, "subtitle", 0),
        paragraphIndex,
        kind: "subtitle",
        text: subtitle,
        sentenceIndex: 0,
        order,
      });
      order += 1;
    }

    const sentences = splitIntoSentences(paragraph.content ?? "");
    for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex += 1) {
      units.push({
        id: cueId(paragraphIndex, "sentence", sentenceIndex),
        paragraphIndex,
        kind: "sentence",
        text: sentences[sentenceIndex] ?? "",
        sentenceIndex,
        order,
      });
      order += 1;
    }
  }

  return units;
}

export function parseVttSegments(vttText: string): VttSegment[] {
  const text = normalizeLineBreaks(vttText);
  const blocks = text.split(/\n{2,}/);
  const segments: VttSegment[] = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) continue;

    const timeLine = lines.find((line) => line.includes("-->"));
    if (!timeLine) continue;

    const [rawStart, rawEnd] = timeLine.split("-->").map((part) => part.trim());
    const startMs = parseTimestampMs(rawStart);
    const endMs = parseTimestampMs(rawEnd);
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
      continue;
    }

    const textLines = lines.slice(lines.indexOf(timeLine) + 1);
    const cueText = sanitizeWhitespace(textLines.join(" "));
    if (!cueText) continue;

    segments.push({ startMs, endMs, text: cueText });
  }

  return segments;
}

function parseTimestampMs(raw: string): number {
  const match = raw.match(/^(\d{2}):(\d{2}):(\d{2})[.,](\d{3})$/);
  if (!match) return Number.NaN;
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  const ss = Number(match[3]);
  const ms = Number(match[4]);
  return ((hh * 60 + mm) * 60 + ss) * 1000 + ms;
}

function buildRangeMapper(
  segments: VttSegment[],
): (charPosition: number) => number {
  const normalizedLengths = segments.map((segment) => {
    const len = normalizeForAlignment(segment.text).length;
    return len > 0 ? len : 1;
  });
  const totalChars = normalizedLengths.reduce((sum, len) => sum + len, 0);

  if (totalChars <= 0) {
    const firstStart = segments[0]?.startMs ?? 0;
    return () => firstStart;
  }

  return (charPosition: number) => {
    const target = Math.max(0, Math.min(totalChars, charPosition));
    let consumed = 0;

    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      const len = normalizedLengths[index] ?? 1;
      const nextConsumed = consumed + len;
      if (target <= nextConsumed || index === segments.length - 1) {
        const ratio = len <= 0 ? 0 : (target - consumed) / len;
        return Math.round(
          segment.startMs + (segment.endMs - segment.startMs) * Math.max(0, Math.min(1, ratio)),
        );
      }
      consumed = nextConsumed;
    }

    return segments[segments.length - 1]?.endMs ?? 0;
  };
}

export function generateReadingCues(
  paragraphs: ParagraphBlock[],
  segments: VttSegment[],
): ReadingCue[] {
  const units = buildReadingUnits(paragraphs);
  if (units.length === 0 || segments.length === 0) return [];

  const normalizedUnitLengths = units.map((unit) => {
    const len = normalizeForAlignment(unit.text).length;
    return len > 0 ? len : 1;
  });
  const totalUnitChars = normalizedUnitLengths.reduce((sum, len) => sum + len, 0);
  if (totalUnitChars <= 0) return [];

  const mapCharPositionToTime = buildRangeMapper(segments);
  const lastSegmentEnd = segments[segments.length - 1]?.endMs ?? 0;
  const cues: ReadingCue[] = [];

  let consumedChars = 0;

  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    const len = normalizedUnitLengths[index] ?? 1;
    const startMs = mapCharPositionToTime(consumedChars);
    consumedChars += len;
    const rawEndMs =
      index === units.length - 1
        ? lastSegmentEnd
        : mapCharPositionToTime(consumedChars);
    const minEndMs = Math.min(lastSegmentEnd, startMs + 160);
    const endMs = Math.max(minEndMs, rawEndMs);

    cues.push({
      ...unit,
      startMs,
      endMs: Math.max(endMs, startMs),
    });
  }

  return cues;
}
