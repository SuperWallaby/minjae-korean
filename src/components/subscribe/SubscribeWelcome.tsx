"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Mail, Puzzle, Sparkles } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/Button";

import styles from "./subscribe-welcome.module.css";

const CONFETTI_COLORS = ["#0071e3", "#34c759", "#ff9500", "#af52de", "#ff2d55"];

function burstConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const draw = ctx;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  draw.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = rect.height;
  const particles = Array.from({ length: 52 }, (_, i) => ({
    x: w / 2 + (Math.random() - 0.5) * 40,
    y: h * 0.32 + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 9,
    vy: Math.random() * -9 - 2,
    width: 4 + Math.random() * 5,
    height: 6 + Math.random() * 7,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]!,
    rot: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.25,
    life: 1,
  }));

  let frame = 0;
  const maxFrames = 95;

  function tick() {
    draw.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.rot += p.spin;
      p.life -= 1 / maxFrames;
      if (p.life <= 0) continue;

      draw.save();
      draw.translate(p.x, p.y);
      draw.rotate(p.rot);
      draw.globalAlpha = Math.max(0, p.life);
      draw.fillStyle = p.color;
      draw.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      draw.restore();
    }

    frame += 1;
    if (frame < maxFrames) {
      requestAnimationFrame(tick);
    } else {
      draw.clearRect(0, 0, w, h);
    }
  }

  tick();
}

type SubscribeWelcomeProps = {
  email: string;
  onSubscribeAgain?: () => void;
};

export function SubscribeWelcome({ email, onSubscribeAgain }: SubscribeWelcomeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const safeEmail = email.trim();

  React.useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (reduced || !canvas) return;
    burstConfetti(canvas);
  }, []);

  return (
    <div className={styles.subscribeWelcomeRoot}>
      <canvas
        ref={canvasRef}
        className={styles.confettiCanvas}
        aria-hidden
      />
      <div className={styles.glowOrb} aria-hidden />

      <div className={`relative z-[1] ${styles.welcomeCard}`}>
        <div className={`mx-auto mb-6 grid size-[4.5rem] place-items-center ${styles.iconWrap}`}>
          <span className={styles.iconRing} aria-hidden />
          <div className="relative grid size-[4.5rem] place-items-center rounded-full border border-[color-mix(in_srgb,var(--quiz-primary)_30%,var(--quiz-border))] bg-[color-mix(in_srgb,var(--quiz-primary)_12%,white)] shadow-[0_10px_30px_color-mix(in_srgb,var(--quiz-primary)_18%,transparent)]">
            <Check
              className="size-8 text-[var(--quiz-primary)]"
              strokeWidth={2.5}
              aria-hidden
            />
          </div>
        </div>

        <Image
          src="/brand/logo.webp"
          alt=""
          width={56}
          height={56}
          className={`mx-auto rounded-full opacity-90 ${styles.fadeUp1}`}
          aria-hidden
        />

        <p
          className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--quiz-primary)_22%,transparent)] bg-[color-mix(in_srgb,var(--quiz-primary)_8%,white)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--quiz-primary)] ${styles.fadeUp1}`}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Welcome to Kaja
        </p>

        <h1
          className={`mt-4 font-serif text-[clamp(1.75rem,4vw,2.35rem)] font-semibold leading-tight tracking-tight text-[var(--quiz-text)] ${styles.fadeUp2}`}
        >
          You&apos;re in!
        </h1>

        <p
          className={`mx-auto mt-3 max-w-md text-base leading-relaxed text-[var(--quiz-text-sub)] ${styles.fadeUp2}`}
        >
          Your free Korean study PDF is on its way. Check your inbox — and your
          spam or promotions folder if you don&apos;t see it within a few
          minutes.
        </p>

        {safeEmail ? (
          <p
            className={`mx-auto mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-2 text-sm text-[var(--quiz-text-sub)] ${styles.fadeUp3}`}
          >
            <Mail className="size-4 shrink-0 text-[var(--quiz-primary)]" aria-hidden />
            <span className="truncate font-medium text-[var(--quiz-text)]">
              {safeEmail}
            </span>
          </p>
        ) : null}

        <ul
          className={`mx-auto mt-8 grid max-w-md gap-3 text-left text-sm ${styles.fadeUp3}`}
        >
          <li className="flex items-start gap-3 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3.5">
            <Mail className="mt-0.5 size-4 shrink-0 text-[var(--quiz-primary)]" />
            <span className="text-[var(--quiz-text-sub)]">
              Open the welcome email and download your{" "}
              <strong className="font-semibold text-[var(--quiz-text)]">
                free PDF
              </strong>
              . Still nothing? Check spam, promotions, or updates.
            </span>
          </li>
          <li className="flex items-start gap-3 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3.5">
            <Puzzle className="mt-0.5 size-4 shrink-0 text-[var(--quiz-primary)]" />
            <span className="text-[var(--quiz-text-sub)]">
              <strong className="font-semibold text-[var(--quiz-text)]">
                Korean quizzes and challenges every week!
              </strong>{" "}
              Your first one may arrive soon.
            </span>
          </li>
        </ul>

        <div
          className={`mx-auto mt-8 flex max-w-md flex-col gap-2.5 sm:flex-row ${styles.fadeUp4}`}
        >
          <Button asChild className="w-full sm:flex-1" size="lg" variant="primary">
            <Link href="/vocab-quiz">Play a quiz now</Link>
          </Button>
          <Button asChild className="w-full sm:flex-1" size="lg" variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        <p className={`mt-6 text-xs text-[var(--quiz-text-muted)] ${styles.fadeUp4}`}>
          Wrong address?{" "}
          <button
            type="button"
            className="text-[var(--quiz-primary)] underline underline-offset-2 hover:no-underline"
            onClick={onSubscribeAgain}
          >
            Try a different email
          </button>
        </p>
      </div>
    </div>
  );
}
