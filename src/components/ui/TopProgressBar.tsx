"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function TopProgressBar(props: {
  active: boolean;
  className?: string;
}) {
  const { active, className } = props;
  if (!active) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[3px] overflow-hidden bg-muted/40 sm:hidden",
        className,
      )}
      role="progressbar"
      aria-label="Loading"
    >
      <div className="h-full w-[40%] bg-primary opacity-90 topbar-indeterminate" />
      <style jsx>{`
        .topbar-indeterminate {
          transform: translateX(-120%);
          animation: topbar-move 1.15s infinite ease-in-out;
        }
        @keyframes topbar-move {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(70%);
          }
          100% {
            transform: translateX(260%);
          }
        }
      `}</style>
    </div>
  );
}

