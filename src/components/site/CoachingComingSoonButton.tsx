"use client";

import * as React from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const COMING_SOON_MSG =
  "We're preparing 1:1 coaching with Minjae — it'll be back soon. Thanks for your patience!";

type Props = {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "gradient" | "primary" | "outline" | "secondary";
};

/** Coach booking is paused — show English notice instead of navigating. */
export function CoachingComingSoonButton({
  children,
  className,
  size = "md",
  variant = "gradient",
}: Props) {
  const [note, setNote] = React.useState(false);

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <Button
        type="button"
        size={size}
        variant={variant}
        className={cn("w-fit px-5", className)}
        onClick={() => setNote(true)}
        aria-expanded={note}
      >
        {children}
      </Button>
      {note ? (
        <p
          className="max-w-sm text-sm leading-relaxed text-[var(--quiz-text-sub)]"
          role="status"
        >
          {COMING_SOON_MSG}
        </p>
      ) : null}
    </div>
  );
}

export { COMING_SOON_MSG };
