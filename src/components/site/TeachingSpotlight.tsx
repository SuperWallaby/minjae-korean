"use client";

import * as React from "react";
import { useEducationMode } from "@/lib/EducationModeProvider";

const DOT_SIZE = 8; // 정확 포인트
const GLOW_SIZE = 140; // 화면공유에서도 잘 보이게 큼

// 레드 계열(가시성 우선) — 필요하면 더 쨍하게 올려도 됨
const DOT_COLOR = "rgba(255, 60, 60, 0.98)";
const GLOW_CORE = "rgba(255, 60, 60, 0.28)";
const GLOW_SOFT = "rgba(255, 60, 60, 0.10)";
// const OUTLINE = "rgba(0, 0, 0, 0.35)"; // 어떤 배경에서도 분리되도록 얇은 외곽 느낌

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function TeachingSpotlight() {
  const { enabled } = useEducationMode();

  const dotRef = React.useRef<HTMLDivElement | null>(null);
  const glowRef = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  const targetRef = React.useRef({ x: -9999, y: -9999 });
  const dotPosRef = React.useRef({ x: -9999, y: -9999 });
  const glowPosRef = React.useRef({ x: -9999, y: -9999 });

  const isCoarsePointer = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  }, []);

  React.useEffect(() => {
    if (!enabled || isCoarsePointer) return;

    const onMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };

    const onLeave = () => {
      targetRef.current.x = -9999;
      targetRef.current.y = -9999;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled, isCoarsePointer]);

  React.useEffect(() => {
    if (!enabled || isCoarsePointer) return;

    const tick = () => {
      const { x: tx, y: ty } = targetRef.current;

      // dot은 빠르게, glow는 느리게
      dotPosRef.current.x = lerp(dotPosRef.current.x, tx, 0.4);
      dotPosRef.current.y = lerp(dotPosRef.current.y, ty, 0.4);
      glowPosRef.current.x = lerp(glowPosRef.current.x, tx, 0.18);
      glowPosRef.current.y = lerp(glowPosRef.current.y, ty, 0.18);

      const dx = dotPosRef.current.x;
      const dy = dotPosRef.current.y;
      const gx = glowPosRef.current.x;
      const gy = glowPosRef.current.y;

      if (dotRef.current)
        dotRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      if (glowRef.current)
        glowRef.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, isCoarsePointer]);

  if (!enabled || isCoarsePointer) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      {/* Glow */}
      <div
        ref={glowRef}
        className="fixed left-0 top-0 rounded-full"
        style={{
          width: GLOW_SIZE,
          height: GLOW_SIZE,
          marginLeft: -GLOW_SIZE / 2,
          marginTop: -GLOW_SIZE / 2,
          background: `radial-gradient(circle at center, ${GLOW_CORE} 0%, ${GLOW_SOFT} 28%, transparent 78%)`,
          // 외곽선을 살짝 줘서 어떤 배경에도 분리되게
          transform: "translate3d(-9999px, -9999px, 0)",
          willChange: "transform",
        }}
      />

      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 rounded-full"
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          marginLeft: -DOT_SIZE / 2,
          marginTop: -DOT_SIZE / 2,
          background: DOT_COLOR,
          // dot도 외곽선을 살짝 + 강한 halo
          // boxShadow: `0 0 0 1px ${OUTLINE}, 0 0 0 12px rgba(255,60,60,0.16), 0 0 26px 10px rgba(255,60,60,0.22)`,
          transform: "translate3d(-9999px, -9999px, 0)",
          willChange: "transform",
        }}
      />
    </div>
  );
}
