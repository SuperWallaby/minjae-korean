"use client";

import * as React from "react";
import { ChevronDown, Volume2, Play, Square } from "lucide-react";
import type { SongChunk, AidBlock, Lexeme } from "@/lib/songsRepo";

type Props = {
  chunk: SongChunk;
  lexicon?: Lexeme[];
  /** 청크 구간 재생 (유튜브 해당 시간으로 이동 후 재생, endMs까지 후 자동 정지) */
  onPlayRange?: (startMs: number, endMs: number) => void;
  isPlaying?: boolean;
  countdownRemainingMs?: number | null;
  onStop?: () => void;
  /** 개발 모드: 줄 클릭으로 구간(시작/끝 초) 입력 */
  devMode?: boolean;
  /** 재생 중인 청크의 현재 재생 시간(ms) */
  currentTimeMs?: number | null;
  /** 이 청크에서 재생 중인 줄 인덱스 (줄 단위 하이라이트용) */
  playingLineIndex?: number | null;
  /** 줄 구간 재생 (lineIndex, startMs, endMs) */
  onPlayLineRange?: (lineIndex: number, startMs: number, endMs: number) => void;
  /** 개발 모드에서 줄 구간(시작/끝) 저장 시 */
  onLineRangeChange?: (
    chunkId: string,
    lineIndex: number,
    startMs: number,
    endMs: number,
  ) => void;
};

function ToggleSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-1.5 px-4 py-3 text-left text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <ChevronDown
          className={`h-4 w-4 text-[hsl(var(--border))] transition-transform ${open ? "rotate-180" : ""}`}
        />
        <span>{label}</span>
      </button>
      {open && <div className="px-4 pb-4 pl-10">{children}</div>}
    </div>
  );
}

function blockTranslation(block: Extract<AidBlock, { type: "translation" }>) {
  return (
    <span className="text-base font-normal text-foreground leading-relaxed whitespace-pre-line">
      {block.text}
    </span>
  );
}

function blockNaturalEnglish(
  block: Extract<AidBlock, { type: "natural_english" }>,
) {
  return (
    <p className="text-sm text-muted-foreground italic mt-1 whitespace-pre-line">
      {block.text}
    </p>
  );
}

function blockExplanation(block: Extract<AidBlock, { type: "explanation" }>) {
  return (
    <div className="text-sm font-normal text-foreground/80 leading-7 whitespace-pre-line">
      {block.text}
    </div>
  );
}

function blockNuanceVsEnglish(
  block: Extract<AidBlock, { type: "nuance_vs_english" }>,
) {
  return (
    <div className="text-sm font-normal text-foreground/80 leading-7 whitespace-pre-line">
      {block.text}
    </div>
  );
}

function blockGrammar(block: Extract<AidBlock, { type: "grammar" }>) {
  return (
    <div className="text-sm">
      {block.title ? (
        <div className="font-medium text-foreground mb-1">{block.title}</div>
      ) : null}
      <div className="text-foreground/80 whitespace-pre-line">{block.text}</div>
      {block.refs?.length ? (
        <div className="mt-1 text-xs text-muted-foreground">
          Refs: {block.refs.join(", ")}
        </div>
      ) : null}
    </div>
  );
}

function blockVocab(
  block: Extract<AidBlock, { type: "vocab" }>,
  lexicon: Lexeme[],
) {
  const items = block.lexemeIds
    .map((id) => lexicon.find((l) => l.id === id))
    .filter((x): x is Lexeme => x != null);
  if (items.length === 0) return null;
  return (
    <div className="space-y-1">
      {items.map((lex) => {
        const playAudio = () => {
          if (!lex.audioUrl) return;
          const a = new Audio(lex.audioUrl);
          a.play().catch(() => {});
        };
        const content = (
          <>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-foreground font-medium">{lex.form}</span>
              {lex.phonetic ? (
                <span className="text-muted-foreground text-xs ml-1">
                  [{lex.phonetic}]
                </span>
              ) : null}
              {lex.lemma ? (
                <span className="text-muted-foreground text-xs ml-1">
                  ({lex.lemma})
                </span>
              ) : null}
              {lex.senses.map((s, i) => (
                <span key={i} className="text-muted-foreground">
                  {" "}
                  — {s.meaning}
                </span>
              ))}
              {lex.note ? (
                <span className="text-muted-foreground/70 text-xs ml-2">
                  ({lex.note})
                </span>
              ) : null}
            </div>
            {lex.audioUrl ? (
              <span className="shrink-0 flex items-center justify-center w-10 h-10 min-w-10 min-h-10 rounded text-muted-foreground">
                <Volume2 className="h-5 w-5" />
              </span>
            ) : null}
          </>
        );
        if (lex.audioUrl) {
          return (
            <button
              key={lex.id}
              type="button"
              onClick={playAudio}
              className="w-full text-sm font-normal flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg text-left hover:bg-muted/50 hover:text-foreground transition-colors touch-manipulation min-h-[44px]"
              aria-label={`Play pronunciation for ${lex.form}`}
            >
              {content}
            </button>
          );
        }
        return (
          <div
            key={lex.id}
            className="text-sm font-normal flex items-start gap-1.5 py-2"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

function blockCallout(block: Extract<AidBlock, { type: "callout" }>) {
  const tone =
    block.tone === "warn"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : "bg-sky-50 border-sky-200 text-sky-900";
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${tone}`}>
      {block.text}
    </div>
  );
}

function blockQuiz(block: Extract<AidBlock, { type: "quiz" }>) {
  return (
    <div className="text-sm">
      <p className="font-medium text-foreground">{block.prompt}</p>
      {block.choices?.length ? (
        <ul className="mt-1 list-disc pl-4 text-muted-foreground">
          {block.choices.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-foreground/80">
        <span className="font-medium">Answer:</span> {block.answer}
      </p>
      {block.explanation ? (
        <p className="mt-1 text-muted-foreground text-xs">
          {block.explanation}
        </p>
      ) : null}
    </div>
  );
}

function formatMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

function formatCountdown(ms: number) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

export function SongChunkCard({
  chunk,
  lexicon = [],
  onPlayRange,
  isPlaying,
  countdownRemainingMs,
  onStop,
  devMode = false,
  currentTimeMs = null,
  playingLineIndex = null,
  onPlayLineRange,
  onLineRangeChange,
}: Props) {
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({});
  const [editingLineIndex, setEditingLineIndex] = React.useState<number | null>(
    null,
  );
  const [editStartSec, setEditStartSec] = React.useState("");
  const [editEndSec, setEditEndSec] = React.useState("");

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    setIsMobile(m.matches);
    const on = () => setIsMobile(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  React.useEffect(() => {
    if (editingLineIndex === null) return;
    const r = chunk.lineRanges?.[editingLineIndex] ?? chunk.range;
    if (r) {
      setEditStartSec((r.startMs / 1000).toFixed(1));
      setEditEndSec((r.endMs / 1000).toFixed(1));
    } else {
      setEditStartSec("");
      setEditEndSec("");
    }
  }, [chunk.range, chunk.lineRanges, editingLineIndex]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasRange =
    chunk.range &&
    Number.isFinite(chunk.range.startMs) &&
    Number.isFinite(chunk.range.endMs);

  const blocks = chunk.aid?.blocks ?? [];
  const translationBlock = blocks.find(
    (b): b is Extract<AidBlock, { type: "translation" }> =>
      b.type === "translation",
  );
  const naturalEnglishBlock = blocks.find(
    (b): b is Extract<AidBlock, { type: "natural_english" }> =>
      b.type === "natural_english",
  );
  const explanationBlock = blocks.find(
    (b): b is Extract<AidBlock, { type: "explanation" }> =>
      b.type === "explanation",
  );
  const nuanceVsEnglishBlocks = blocks.filter(
    (b): b is Extract<AidBlock, { type: "nuance_vs_english" }> =>
      b.type === "nuance_vs_english",
  );
  const grammarBlocks = blocks.filter(
    (b): b is Extract<AidBlock, { type: "grammar" }> => b.type === "grammar",
  );
  const vocabBlock = blocks.find(
    (b): b is Extract<AidBlock, { type: "vocab" }> => b.type === "vocab",
  );
  const calloutBlocks = blocks.filter(
    (b): b is Extract<AidBlock, { type: "callout" }> => b.type === "callout",
  );
  const quizBlocks = blocks.filter(
    (b): b is Extract<AidBlock, { type: "quiz" }> => b.type === "quiz",
  );

  const hasVocab =
    vocabBlock && vocabBlock.lexemeIds.length > 0 && lexicon.length > 0;
  const vocabResolved = hasVocab && blockVocab(vocabBlock, lexicon);

  return (
    <div className="group rounded-lg border border-border bg-muted/10 overflow-hidden">
      {/* 가사 + 재생 버튼 (항상 표시) */}
      <div className="flex items-start gap-2 px-4 py-3">
        <div className="flex-1 min-w-0 text-lg leading-relaxed">
          {chunk.lines.map((line, i) => {
            const lineRange = chunk.lineRanges?.[i];
            const hasLineRange =
              lineRange &&
              Number.isFinite(lineRange.startMs) &&
              Number.isFinite(lineRange.endMs);
            const isPlayingLine = isPlaying && playingLineIndex === i;
            const canPlayLine = hasLineRange && (onPlayLineRange || onStop);
            const lineClickPlay = canPlayLine && !devMode;
            const lineClickEdit = devMode && !isMobile;
            const lineClick = lineClickPlay
              ? () =>
                  isPlayingLine &&
                  countdownRemainingMs != null &&
                  countdownRemainingMs > 0
                    ? onStop?.()
                    : onPlayLineRange?.(i, lineRange!.startMs, lineRange!.endMs)
              : lineClickEdit
                ? () => setEditingLineIndex((prev) => (prev === i ? null : i))
                : devMode && isMobile && canPlayLine
                  ? () =>
                      isPlayingLine &&
                      countdownRemainingMs != null &&
                      countdownRemainingMs > 0
                        ? onStop?.()
                        : onPlayLineRange?.(
                            i,
                            lineRange!.startMs,
                            lineRange!.endMs,
                          )
                  : undefined;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-md -mx-1 px-1 ${
                  isPlayingLine
                    ? "bg-included-2 text-included-2-foreground"
                    : ""
                } ${
                  lineClick
                    ? "cursor-pointer touch-manipulation active:opacity-90"
                    : ""
                } ${devMode && !isMobile ? (isPlayingLine ? "" : " hover:bg-muted/40") : ""}`}
                role={lineClick ? "button" : undefined}
                onClick={lineClick}
                onKeyDown={
                  lineClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          lineClick();
                        }
                      }
                    : undefined
                }
                tabIndex={lineClick ? 0 : undefined}
              >
                <span className="whitespace-pre-line py-0.5">{line}</span>
                {hasLineRange &&
                  (onPlayLineRange || onStop) &&
                  devMode &&
                  !isMobile && (
                    <span
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isPlayingLine &&
                      countdownRemainingMs != null &&
                      countdownRemainingMs > 0 ? (
                        <button
                          type="button"
                          onClick={() => onStop?.()}
                          className="flex items-center justify-center p-1.5 rounded border border-border text-foreground bg-muted/50 hover:bg-muted"
                          title="재생 정지"
                          aria-label="재생 정지"
                        >
                          <Square className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        onPlayLineRange && (
                          <button
                            type="button"
                            onClick={() =>
                              onPlayLineRange(
                                i,
                                lineRange!.startMs,
                                lineRange!.endMs,
                              )
                            }
                            className="flex items-center justify-center p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            title="재생"
                            aria-label="재생"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        )
                      )}
                    </span>
                  )}
                {isMobile && devMode && onLineRangeChange && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLineIndex((prev) => (prev === i ? null : i));
                    }}
                    className="shrink-0 p-1 rounded text-muted-foreground hover:bg-muted/50 hover:text-foreground text-xs"
                    title="시간 설정"
                    aria-label="시간 설정"
                  >
                    시간
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {devMode && editingLineIndex !== null && onLineRangeChange && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded border border-border bg-muted/30 p-2 text-sm shrink-0">
            <span className="text-muted-foreground">
              줄 {editingLineIndex + 1}
            </span>
            <label className="flex items-center gap-1">
              <span>시작 (초)</span>
              <input
                type="number"
                step={0.1}
                min={0}
                value={editStartSec}
                onChange={(e) => setEditStartSec(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-20 rounded border border-border bg-background px-2 py-1"
              />
            </label>
            <label className="flex items-center gap-1">
              <span>끝 (초)</span>
              <input
                type="number"
                step={0.1}
                min={0}
                value={editEndSec}
                onChange={(e) => setEditEndSec(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-20 rounded border border-border bg-background px-2 py-1"
              />
            </label>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const startSec = parseFloat(editStartSec);
                const endSec = parseFloat(editEndSec);
                if (Number.isFinite(startSec) && Number.isFinite(endSec)) {
                  onLineRangeChange(
                    chunk.id,
                    editingLineIndex,
                    Math.round(startSec * 1000),
                    Math.round(endSec * 1000),
                  );
                  setEditingLineIndex(null);
                }
              }}
              className="rounded border border-border bg-primary px-2 py-1 text-primary-foreground hover:bg-primary/90"
            >
              저장
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditingLineIndex(null);
              }}
              className="rounded border border-border px-2 py-1 hover:bg-muted/50"
            >
              취소
            </button>
          </div>
        )}
        {hasRange && (onPlayRange || onStop) && (
          <div className="shrink-0 flex items-center gap-2">
            {isPlaying &&
            countdownRemainingMs != null &&
            countdownRemainingMs > 0 ? (
              <>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatCountdown(countdownRemainingMs)} 후 정지
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStop?.();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-sm text-foreground bg-muted/50 hover:bg-muted transition-colors"
                  title="재생 정지"
                >
                  <Square className="h-4 w-4" />
                  <span>정지</span>
                </button>
              </>
            ) : (
              onPlayRange && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayRange(chunk.range!.startMs, chunk.range!.endMs);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  title={`${formatMs(chunk.range!.startMs)}부터 재생 (${formatMs(chunk.range!.endMs)}에 정지)`}
                >
                  <Play className="h-4 w-4" />
                  <span>{formatMs(chunk.range!.startMs)}</span>
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* 번역·설명·단어 등 항상 펼쳐서 표시 */}
      <div className="border-t border-border bg-muted/20">
        {(translationBlock || naturalEnglishBlock || blocks.length > 0) && (
          <div className="px-4 py-4">
            <div className="flex-1">
              {translationBlock ? blockTranslation(translationBlock) : null}
              {naturalEnglishBlock
                ? blockNaturalEnglish(naturalEnglishBlock)
                : null}
              {!translationBlock &&
              !naturalEnglishBlock &&
              blocks.length > 0 ? (
                <span className="text-muted-foreground text-sm">
                  No translation
                </span>
              ) : null}
            </div>
          </div>
        )}

        {vocabResolved && (
          <ToggleSection
            label={`Words (${vocabBlock!.lexemeIds.length})`}
            open={openSections.vocab ?? false}
            onToggle={() => toggleSection("vocab")}
          >
            {vocabResolved}
          </ToggleSection>
        )}

        {explanationBlock && explanationBlock.text && (
          <ToggleSection
            label="Explanation"
            open={openSections.explanation ?? false}
            onToggle={() => toggleSection("explanation")}
          >
            {blockExplanation(explanationBlock)}
          </ToggleSection>
        )}

        {nuanceVsEnglishBlocks.map((block, i) => (
          <ToggleSection
            key={i}
            label="Native Nuance"
            open={openSections[`nuance-${i}`] ?? false}
            onToggle={() => toggleSection(`nuance-${i}`)}
          >
            {blockNuanceVsEnglish(block)}
          </ToggleSection>
        ))}

        {grammarBlocks.map((block, i) => (
          <ToggleSection
            key={i}
            label={block.title ?? "Grammar"}
            open={openSections[`grammar-${i}`] ?? true}
            onToggle={() => toggleSection(`grammar-${i}`)}
          >
            {blockGrammar(block)}
          </ToggleSection>
        ))}

        {calloutBlocks.map((block, i) => (
          <div key={i} className="px-4 pb-2">
            {blockCallout(block)}
          </div>
        ))}

        {quizBlocks.map((block, i) => (
          <ToggleSection
            key={i}
            label="Quiz"
            open={openSections[`quiz-${i}`] ?? true}
            onToggle={() => toggleSection(`quiz-${i}`)}
          >
            {blockQuiz(block)}
          </ToggleSection>
        ))}
      </div>
    </div>
  );
}
