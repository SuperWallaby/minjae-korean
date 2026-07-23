"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Gamepad2, X } from "lucide-react";

import type {
  KoreanQuizPrepared,
  KoreanQuizPreparedChoice,
} from "@/lib/koreanQuiz/types";
import { withVocabQuizUtm } from "@/lib/vocabQuizAeoLinks";

import styles from "./seo-mini-quiz-widget.module.css";

const SEO_ROUTE_PREFIXES = [
  "/grammar/",
  "/when-to-use/",
  "/vocab/",
  "/vocab/compare/",
] as const;

const SEO_HUB_PATHS = new Set([
  "/grammar",
  "/when-to-use",
  "/vocab",
  "/vocab/compare",
]);

const SEO_DEVICE_ID_KEY = "seo-mini-quiz-device-id";
const SESSION_QUIZ_COUNT = 3;

function isSeoContentPath(pathname: string): boolean {
  if (pathname.endsWith("/edit") || pathname.includes("/new")) return false;
  return (
    SEO_HUB_PATHS.has(pathname) ||
    SEO_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function getSeoQuizDeviceId(): string {
  try {
    const existing = localStorage.getItem(SEO_DEVICE_ID_KEY)?.trim();
    if (existing?.startsWith("web_seo_")) return existing;
    const id = `web_seo_${crypto.randomUUID().replaceAll("-", "")}`;
    localStorage.setItem(SEO_DEVICE_ID_KEY, id);
    return id;
  } catch {
    return `web_seo_${Date.now().toString(36)}widget`;
  }
}

function compactChoices(quiz: KoreanQuizPrepared): KoreanQuizPreparedChoice[] {
  const correct = quiz.choices.find((choice) => choice.id === quiz.correctChoiceId);
  const wrong = quiz.choices
    .filter((choice) => choice.id !== quiz.correctChoiceId)
    .slice(0, 2);
  if (!correct) return quiz.choices.slice(0, 3);
  return [...wrong, correct].sort(() => Math.random() - 0.5);
}

export function SeoMiniQuizWidget() {
  const pathname = usePathname();
  const eligible = isSeoContentPath(pathname);
  const [open, setOpen] = React.useState(false);
  const [quizzes, setQuizzes] = React.useState<KoreanQuizPrepared[]>([]);
  const [quizIndex, setQuizIndex] = React.useState(0);
  const [choices, setChoices] = React.useState<KoreanQuizPreparedChoice[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const queueRequestedRef = React.useRef(false);

  const quiz = quizzes[quizIndex] ?? null;
  const answered = selectedId !== null;
  const sessionQuizCount = Math.min(SESSION_QUIZ_COUNT, quizzes.length);
  const sessionComplete = answered && quizIndex >= sessionQuizCount - 1;

  React.useEffect(() => {
    setOpen(window.matchMedia("(min-width: 768px)").matches);
  }, []);

  React.useEffect(() => {
    if (!eligible || queueRequestedRef.current) return;
    queueRequestedRef.current = true;
    const controller = new AbortController();
    setLoading(true);
    void fetch("/api/vocab-quiz/queue", {
      headers: { "X-Device-Id": getSeoQuizDeviceId() },
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load quiz");
        return (await response.json()) as { quizzes?: KoreanQuizPrepared[] };
      })
      .then((payload) => {
        const next = Array.isArray(payload.quizzes)
          ? payload.quizzes.filter((item) => item.imageUrl && item.choices.length >= 3)
          : [];
        setQuizzes(next);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [eligible]);

  React.useEffect(() => {
    if (!quiz) return;
    setChoices(compactChoices(quiz));
    setSelectedId(null);
  }, [quiz]);

  React.useEffect(() => {
    if (!answered || sessionComplete) return;
    const timer = window.setTimeout(() => {
      setQuizIndex((current) => current + 1);
    }, 800);
    return () => window.clearTimeout(timer);
  }, [answered, sessionComplete]);

  if (!eligible) return null;

  const fullQuizUrl = withVocabQuizUtm("/vocab-quiz", {
    source: "hub",
    content: `seo-mini-game:${pathname}`,
  });

  if (!open) {
    return (
      <button
        type="button"
        className={styles.launcher}
        onClick={() => setOpen(true)}
        aria-label="Open Korean flashcard game"
      >
        <Gamepad2 size={22} strokeWidth={2.2} aria-hidden />
        <span>Flashcard game</span>
      </button>
    );
  }

  return (
    <aside className={styles.widget} aria-label="Mini Korean flashcard quiz">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>60-second Korean</p>
          <h2 className={styles.title}>What is this in Korean?</h2>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={() => setOpen(false)}
          aria-label="Minimize flashcard game"
        >
          <X size={17} aria-hidden />
        </button>
      </div>

      {loading && !quiz ? (
        <div className={styles.loading}>Loading a card…</div>
      ) : quiz ? (
        <>
          <div className={styles.imageWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.image} src={quiz.imageUrl} alt="" />
          </div>

          <div className={styles.choices}>
            {choices.map((choice) => {
              const correct = choice.id === quiz.correctChoiceId;
              const selected = choice.id === selectedId;
              const stateClass = answered
                ? correct
                  ? styles.correct
                  : selected
                    ? styles.wrong
                    : styles.dimmed
                : "";
              return (
                <button
                  type="button"
                  key={choice.id}
                  className={`${styles.choice} ${stateClass}`}
                  disabled={answered}
                  onClick={() => setSelectedId(choice.id)}
                >
                  <span>{choice.label}</span>
                  {answered && correct ? <Check size={16} aria-hidden /> : null}
                </button>
              );
            })}
          </div>

          {sessionComplete ? (
            <div className={styles.result}>
              <Link className={styles.moreQuiz} href={fullQuizUrl}>
                More Quiz
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <div className={styles.loading}>
          <Link href={fullQuizUrl}>More Quiz</Link>
        </div>
      )}
    </aside>
  );
}
