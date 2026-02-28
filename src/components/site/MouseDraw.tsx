"use client";

import * as React from "react";
import { useEducationMode } from "@/lib/EducationModeProvider";

type Pt = { x: number; y: number };

const STROKE = "rgba(255, 60, 60, 0.95)";
const STROKE_WIDTH = 4;

const dist = (a: Pt, b: Pt) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

function pointsToPath(points: Pt[]) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++)
    d += ` L ${points[i].x} ${points[i].y}`;
  return d;
}

export function TeachingCmdDraw() {
  const { enabled } = useEducationMode();

  const [points, setPoints] = React.useState<Pt[]>([]);
  const metaDownRef = React.useRef(false);
  const lastRef = React.useRef<Pt | null>(null);

  const isCoarsePointer = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  }, []);

  const clear = React.useCallback(() => {
    setPoints([]);
    lastRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!enabled || isCoarsePointer) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        metaDownRef.current = true;
        // 새 스트로크 시작: 다음 move에서 시작점이 잡힘
        lastRef.current = null;
        setPoints([]);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Meta") {
        metaDownRef.current = false;
        lastRef.current = null;
        // 키 뗄 때는 선 유지(요구사항: 스크롤 시 삭제)
      }
    };

    const onMove = (e: PointerEvent) => {
      // 커맨드 누른 상태에서만 그리기
      if (!metaDownRef.current || !e.metaKey) return;

      const p = { x: e.clientX, y: e.clientY };
      const last = lastRef.current;

      // 너무 촘촘히 쌓이지 않게 최소 이동 거리
      if (last && dist(last, p) < 3) return;

      lastRef.current = p;
      setPoints((prev) => (prev.length === 0 ? [p] : [...prev, p]));
    };

    // 스크롤하면 싹 지우기
    const onScroll = () => clear();
    const onWheel = () => clear();

    const onBlur = () => {
      metaDownRef.current = false;
      lastRef.current = null;
      // blur 시 선은 유지해도 되지만, 안전하게 초기화하고 싶으면 clear()로 바꿔도 됨
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("blur", onBlur);
    };
  }, [enabled, isCoarsePointer, clear]);

  if (!enabled || isCoarsePointer) return null;

  const path = pointsToPath(points);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden>
      <svg className="h-full w-full">
        {path ? (
          <path
            d={path}
            fill="none"
            stroke={STROKE}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.35))",
            }}
          />
        ) : null}
      </svg>
    </div>
  );
}
