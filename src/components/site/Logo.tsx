import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  mode = "v2",
}: {
  className?: string;
  mode?: "v1" | "v2";
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-baseline gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label="Minjae Korean home"
    >
      <img
        src={mode === "v2" ? "/brand/logo-v2.png" : "/brand/logo.png"}
        alt="Minjae Korean logo"
        className="h-7"
      />
    </Link>
  );
}
