import type { ParagraphBlock, ReadingCue } from "@/lib/articleReading";
import {
  NEWS_COVER_IMAGE_SIZE,
  NEWS_PARAGRAPH_IMAGE_MAX,
  NEWS_PARAGRAPH_IMAGE_STICK_PROBABILITY,
} from "@/lib/newsCoverDefaults";
import { smartUnsplashSearch } from "@/lib/smartUnsplash";

export type ArticlePostJson = (
  url: string,
  body?: unknown,
) => Promise<{ res: Response; json: unknown }>;

export type ArticleVocabItem = {
  sound?: string;
  word: string;
  description_en: string;
  example: string;
  image?: string;
  phonetic?: string;
  exampleSound?: string;
};

export type ArticleBatchProgress =
  | { phase: "edge-tts" }
  | { phase: "timings" }
  | { phase: "cover" }
  | { phase: "paragraphs"; cur: number; total: number }
  | { phase: "thumbnail" }
  | { phase: "vocabulary-auto"; cur: number; total: number }
  | { phase: "done" };

export function formatArticleBatchProgress(
  p: ArticleBatchProgress | null,
): string {
  if (!p || p.phase === "done") return "";
  switch (p.phase) {
    case "edge-tts":
      return "1/6 — Edge TTS…";
    case "timings":
      return "2/6 — Reading timings (Whisper)…";
    case "cover":
      return "3/6 — Cover (Azure)…";
    case "paragraphs":
      return p.total > 0
        ? `4/6 — Paragraph art (${p.cur}/${p.total})…`
        : "4/6 — Paragraph art (none)…";
    case "thumbnail":
      return "5/6 — Thumbnail (from cover)…";
    case "vocabulary-auto":
      return p.total > 0
        ? `6/6 — Vocabulary auto (${p.cur}/${p.total})…`
        : "6/6 — Vocabulary (empty)…";
    default:
      return "";
  }
}

const DELAY_MS = {
  afterStep: 500,
  betweenParagraphAzure: 1000,
  unsplashGap: 400,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function errMsg(json: unknown, fallback: string): string {
  if (json && typeof json === "object" && "error" in json) {
    const e = (json as { error?: unknown }).error;
    if (typeof e === "string" && e.trim()) return e;
  }
  return fallback;
}

/** Vocabulary “Auto” (optional opening article TTS like the standalone Auto button). */
export async function runVocabularyAutoPhase(opts: {
  postJson: ArticlePostJson;
  getParagraphsPlainText: () => string;
  getVocabularySnapshot: () => ArticleVocabItem[];
  patchVocabulary: (index: number, patch: Partial<ArticleVocabItem>) => void;
  /** When true, first call matches legacy “Auto” (article-wide TTS if body text exists). */
  includeArticleWideTts: boolean;
  setAudioFromArticleTts?: (url: string) => void;
  resetReadingCuesOnArticleTts?: () => void;
  onVocabProgress?: (cur: number, total: number) => void;
}): Promise<void> {
  const {
    postJson,
    getParagraphsPlainText,
    getVocabularySnapshot,
    patchVocabulary,
    includeArticleWideTts,
    setAudioFromArticleTts,
    resetReadingCuesOnArticleTts,
    onVocabProgress,
  } = opts;

  if (includeArticleWideTts) {
    const articleText = getParagraphsPlainText().trim();
    if (
      articleText &&
      setAudioFromArticleTts &&
      resetReadingCuesOnArticleTts
    ) {
      const { res, json } = await postJson("/api/admin/tts/word", {
        text: articleText,
      });
      if (res.ok && json && typeof json === "object" && "ok" in json) {
        const j = json as { ok?: boolean; url?: string };
        if (j.ok && j.url) {
          setAudioFromArticleTts(String(j.url));
          resetReadingCuesOnArticleTts();
        }
      }
    }
  }

  const vocab = getVocabularySnapshot();
  const total = vocab.length;
  for (let idx = 0; idx < total; idx++) {
    onVocabProgress?.(idx + 1, total);
    const v = vocab[idx]!;
    if (v.word?.trim()) {
      const { res: r1, json: j1 } = await postJson("/api/admin/tts/word", {
        text: v.word.trim(),
      });
      if (r1.ok && j1 && typeof j1 === "object" && "ok" in j1) {
        const j = j1 as { ok?: boolean; url?: string };
        if (j.ok && j.url) {
          patchVocabulary(idx, { sound: String(j.url) });
        }
      }
    }
    if (v.example?.trim()) {
      const { res: r2, json: j2 } = await postJson("/api/admin/tts/word", {
        text: v.example.trim(),
      });
      if (r2.ok && j2 && typeof j2 === "object" && "ok" in j2) {
        const j = j2 as { ok?: boolean; url?: string };
        if (j.ok && j.url) {
          patchVocabulary(idx, { exampleSound: String(j.url) });
        }
      }
    }
    if (v.word?.trim() && !v.image?.trim()) {
      const imageUrl = await smartUnsplashSearch(v.word.trim());
      if (imageUrl) {
        patchVocabulary(idx, { image: imageUrl });
      }
      await sleep(DELAY_MS.unsplashGap);
    }
  }
}

export type RunArticleFullBatchOpts = {
  postJson: ArticlePostJson;
  onProgress: (p: ArticleBatchProgress) => void;
  getTtsPlainText: () => string;
  getTitle: () => string;
  getParagraphs: () => ParagraphBlock[];
  setAudio: (url: string) => void;
  setReadingCues: (cues: ReadingCue[]) => void;
  setImageLarge: (url: string) => void;
  setImageThumb: (url: string) => void;
  setParagraphImage: (paragraphIndex: number, imageUrl: string | null) => void;
  getVocabularySnapshot: () => ArticleVocabItem[];
  patchVocabulary: (index: number, patch: Partial<ArticleVocabItem>) => void;
};

/**
 * Sequential: edge-tts → reading timings (Whisper) → cover (Azure) → paragraph images → thumb from large → vocabulary Auto (no duplicate article TTS).
 */
export async function runArticleFullBatch(
  opts: RunArticleFullBatchOpts,
): Promise<void> {
  const {
    postJson,
    onProgress,
    getTtsPlainText,
    getTitle,
    getParagraphs,
    setAudio,
    setReadingCues,
    setImageLarge,
    setImageThumb,
    setParagraphImage,
    getVocabularySnapshot,
    patchVocabulary,
  } = opts;

  const ttsText = getTtsPlainText().trim();
  if (!ttsText) {
    throw new Error("Add paragraph content before running the full pipeline.");
  }

  onProgress({ phase: "edge-tts" });
  let articleAudioUrl = "";
  {
    const { res, json } = await postJson("/api/admin/tts/word", {
      text: ttsText,
    });
    if (!res.ok || !json || typeof json !== "object") {
      throw new Error(errMsg(json, "edge-tts failed"));
    }
    const j = json as { ok?: boolean; url?: string; error?: string };
    if (!j.ok || !j.url) {
      throw new Error(j.error ?? "edge-tts failed");
    }
    articleAudioUrl = String(j.url);
    setAudio(articleAudioUrl);
  }
  await sleep(DELAY_MS.afterStep);

  onProgress({ phase: "timings" });
  {
    setReadingCues([]);
    const { res, json } = await postJson("/api/admin/articles/reading-cues", {
      audioUrl: articleAudioUrl,
      paragraphs: getParagraphs(),
    });
    if (!res.ok || !json || typeof json !== "object") {
      throw new Error(errMsg(json, "Reading timings failed"));
    }
    const jr = json as {
      ok?: boolean;
      data?: { readingCues?: ReadingCue[] };
      error?: string;
    };
    if (!jr.ok || !jr.data?.readingCues?.length) {
      throw new Error(jr.error ?? "Reading timings failed");
    }
    setReadingCues(jr.data.readingCues as ReadingCue[]);
  }
  await sleep(DELAY_MS.afterStep);

  const title = getTitle().trim();
  if (!title) {
    throw new Error("Title is required for cover generation.");
  }

  onProgress({ phase: "cover" });
  let largeUrl = "";
  {
    const { res, json } = await postJson("/api/admin/news/cover-image", {
      title,
      size: NEWS_COVER_IMAGE_SIZE,
      target: "large",
    });
    if (!res.ok || !json || typeof json !== "object") {
      const j = json as {
        error?: string;
        stage?: string;
        chat?: { lastMessage?: string };
        azure?: { message?: string };
      } | null;
      throw new Error(
        [
          j?.error,
          j?.stage && `[${j.stage}]`,
          j?.chat?.lastMessage,
          j?.azure?.message,
        ]
          .filter(Boolean)
          .join(" — ") || "Cover generation failed",
      );
    }
    const j = json as { ok?: boolean; url?: string };
    if (!j.ok || !j.url) {
      throw new Error("Cover generation failed");
    }
    largeUrl = String(j.url);
    setImageLarge(largeUrl);
  }
  await sleep(DELAY_MS.afterStep);

  const targets = getParagraphs()
    .map((p, i) => ({
      i,
      t: [p.subtitle?.trim(), p.content?.trim()].filter(Boolean).join("\n\n"),
    }))
    .filter((x) => x.t);

  if (targets.length === 0) {
    onProgress({ phase: "paragraphs", cur: 0, total: 0 });
  } else {
    let paragraphImageCount = 0;
    for (let step = 0; step < targets.length; step++) {
      onProgress({
        phase: "paragraphs",
        cur: step + 1,
        total: targets.length,
      });
      const { i } = targets[step]!;
      const p = getParagraphs()[i]!;
      if (
        paragraphImageCount >= NEWS_PARAGRAPH_IMAGE_MAX ||
        Math.random() >= NEWS_PARAGRAPH_IMAGE_STICK_PROBABILITY
      ) {
        setParagraphImage(i, null);
        continue;
      }
      const { res, json } = await postJson("/api/admin/news/paragraph-image", {
        subtitle: p.subtitle ?? "",
        content: p.content ?? "",
      });
      if (!res.ok || !json || typeof json !== "object") {
        throw new Error(errMsg(json, "Paragraph image failed"));
      }
      const j = json as { ok?: boolean; url?: string; error?: string };
      if (!j.ok || !j.url) {
        throw new Error(j.error ?? "Paragraph image failed");
      }
      setParagraphImage(i, String(j.url));
      paragraphImageCount++;
      if (step < targets.length - 1) {
        await sleep(DELAY_MS.betweenParagraphAzure);
      }
    }
  }
  await sleep(DELAY_MS.afterStep);

  onProgress({ phase: "thumbnail" });
  {
    const { res, json } = await postJson("/api/admin/news/thumbnail-from-url", {
      imageUrl: largeUrl,
    });
    if (!res.ok || !json || typeof json !== "object") {
      throw new Error(errMsg(json, "Thumbnail generation failed"));
    }
    const j = json as { ok?: boolean; url?: string; error?: string };
    if (!j.ok || !j.url) {
      throw new Error(j.error ?? "Thumbnail generation failed");
    }
    setImageThumb(String(j.url));
  }
  await sleep(DELAY_MS.afterStep);

  const vocabSnap = getVocabularySnapshot();
  if (vocabSnap.length > 0) {
    onProgress({ phase: "vocabulary-auto", cur: 0, total: vocabSnap.length });
    await runVocabularyAutoPhase({
      postJson,
      getParagraphsPlainText: getTtsPlainText,
      getVocabularySnapshot,
      patchVocabulary,
      includeArticleWideTts: false,
      onVocabProgress: (cur, total) =>
        onProgress({ phase: "vocabulary-auto", cur, total }),
    });
  } else {
    onProgress({ phase: "vocabulary-auto", cur: 0, total: 0 });
  }

  onProgress({ phase: "done" });
}
