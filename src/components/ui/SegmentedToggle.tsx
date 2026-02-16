"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type SegmentedToggleOption<T extends string | number> = {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
};

export function SegmentedToggle<T extends string | number>(props: {
  value: T;
  options: Array<SegmentedToggleOption<T>>;
  onChange: (next: T) => void;
  size?: "md" | "lg";
  className?: string;
}) {
  const { value, options, onChange, size = "md", className } = props;

  const btnBase =
    size === "lg"
      ? "rounded-xl px-4 py-2 text-base font-semibold"
      : "rounded-md px-3 py-1 text-sm font-medium";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-2xl border border-border bg-card p-1",
        className,
      )}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "transition cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
              btnBase,
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted/40",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
