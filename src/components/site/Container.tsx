"use client";

import * as React from "react";

import { useEducationMode } from "@/lib/EducationModeProvider";
import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { enabled: teachingMode } = useEducationMode();

  return (
    <div
      className={cn(
        "site-container mx-auto w-full max-w-6xl",
        teachingMode ? "!px-3 !sm:px-4 !lg:px-5" : "px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
