"use client";

import * as React from "react";

const DEBOUNCE_MS = 500;

export type ArticleJsonPayload = {
  title?: string;
  articleCode?: string;
  level?: number;
  levels?: number[];
  audio?: string;
  imageThumb?: string;
  imageLarge?: string;
  paragraphs?: Array<{ image?: string; subtitle: string; content: string }>;
  vocabulary?: Array<{
    sound?: string;
    word: string;
    description_en: string;
    example: string;
    image?: string;
    phonetic?: string;
    exampleSound?: string;
  }>;
  questions?: string[];
  discussion?: string[];
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeLevel(n: unknown): number {
  const v = Number(n);
  if (v >= 1 && v <= 5) return Math.floor(v) as 1 | 2 | 3 | 4 | 5;
  return 1;
}

function normalizePayload(parsed: unknown): ArticleJsonPayload {
  const o = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const level = normalizeLevel(o.level);
  const rawLevels = Array.isArray(o.levels) ? o.levels : [level];
  const levels = rawLevels.map(normalizeLevel).filter((n) => n >= 1 && n <= 5);
  const uniqueLevels = Array.from(new Set(levels)).sort((a, b) => a - b);
  return {
    title: typeof o.title === "string" ? o.title : "",
    articleCode:
      typeof o.articleCode === "string" && o.articleCode.trim()
        ? o.articleCode.trim()
        : undefined,
    level: uniqueLevels[0] ?? level,
    levels: uniqueLevels.length ? uniqueLevels : [level],
    audio: typeof o.audio === "string" && o.audio.trim() ? o.audio.trim() : undefined,
    imageThumb:
      typeof o.imageThumb === "string" && o.imageThumb.trim()
        ? o.imageThumb.trim()
        : undefined,
    imageLarge:
      typeof o.imageLarge === "string" && o.imageLarge.trim()
        ? o.imageLarge.trim()
        : undefined,
    paragraphs: Array.isArray(o.paragraphs)
      ? o.paragraphs.map((p: unknown) => {
          const row = p && typeof p === "object" ? (p as Record<string, unknown>) : {};
          return {
            image:
              typeof row.image === "string" && row.image.trim()
                ? row.image.trim()
                : undefined,
            subtitle: typeof row.subtitle === "string" ? row.subtitle : "",
            content: typeof row.content === "string" ? row.content : "",
          };
        })
      : [],
    vocabulary: Array.isArray(o.vocabulary)
      ? o.vocabulary.map((v: unknown) => {
          const row = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
          return {
            sound:
              typeof row.sound === "string" && row.sound.trim()
                ? row.sound.trim()
                : undefined,
            word: typeof row.word === "string" ? row.word : "",
            description_en: typeof row.description_en === "string" ? row.description_en : "",
            example: typeof row.example === "string" ? row.example : "",
            image:
              typeof row.image === "string" && row.image.trim()
                ? row.image.trim()
                : undefined,
            phonetic:
              typeof row.phonetic === "string" && row.phonetic.trim()
                ? row.phonetic.trim()
                : undefined,
            exampleSound:
              typeof row.exampleSound === "string" && row.exampleSound.trim()
                ? row.exampleSound.trim()
                : undefined,
          };
        })
      : [],
    questions: Array.isArray(o.questions)
      ? o.questions.map((q) => (typeof q === "string" ? q : String(q)))
      : [],
    discussion: Array.isArray(o.discussion)
      ? o.discussion.map((d) => (typeof d === "string" ? d : String(d)))
      : [],
    slug: typeof o.slug === "string" ? o.slug : undefined,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : undefined,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

type Props = {
  value: ArticleJsonPayload;
  onChange: (payload: ArticleJsonPayload) => void;
  onParseError?: (message: string | null) => void;
  className?: string;
};

export function ArticleJsonEditor({
  value,
  onChange,
  onParseError,
  className,
}: Props) {
  const [text, setText] = React.useState(() =>
    JSON.stringify(value, null, 2),
  );
  const [focused, setFocused] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedSerialized = React.useRef(JSON.stringify(value, null, 2));
  const isInternalUpdate = React.useRef(false);

  // Sync from parent value when not focused (e.g. form was edited)
  React.useEffect(() => {
    if (focused) return;
    const serialized = JSON.stringify(value, null, 2);
    if (serialized !== lastSyncedSerialized.current) {
      lastSyncedSerialized.current = serialized;
      setText(serialized);
    }
  }, [value, focused]);

  const tryApply = React.useCallback(
    (raw: string) => {
      try {
        const parsed = JSON.parse(raw) as unknown;
        const normalized = normalizePayload(parsed);
        onParseError?.(null);
        isInternalUpdate.current = true;
        onChange(normalized);
      } catch {
        onParseError?.("Invalid JSON");
      }
    },
    [onChange, onParseError],
  );

  const onTextChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      setText(next);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        tryApply(next);
      }, DEBOUNCE_MS);
    },
    [tryApply],
  );

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground mb-1.5 font-medium">
        JSON (edit to apply)
      </div>
      <textarea
        className="w-full min-h-[400px] rounded-md border border-border bg-muted/20 px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={text}
        onChange={onTextChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        spellCheck={false}
      />
    </div>
  );
}
