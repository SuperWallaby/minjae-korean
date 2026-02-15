import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "muted" | "outline" | "black";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClass: Record<BadgeVariant, string> = {
  default:
    "bg-[color-mix(in_srgb,var(--accent-muted)_28%,var(--bg-canvas))] text-foreground",
  // Use theme variable so color can be managed from globals.css
  muted: "bg-[var(--included-1)] text-[var(--badge-muted-foreground)]",
  outline: "bg-transparent text-muted-foreground",
  black: "bg-black text-white",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium leading-none",
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
