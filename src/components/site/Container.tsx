"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TEACHING_PATHS = ["/booking", "/join"];

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname();
  const teachingMode =
    pathname != null &&
    TEACHING_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <div
      className={cn(
        "site-container mx-auto w-full max-w-6xl",
        teachingMode ? "px-2 sm:px-4 lg:px-5" : "px-4 sm:px-6 lg:px-8",
        className,
      )}
      {...props}
    />
  );
}
