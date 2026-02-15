import Link from "next/link";
import Image from "next/image";
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
      <Image
        width={71}
        height={28}
        src={mode === "v2" ? "/brand/logo-v2.webp" : "/brand/logo.webp"}
        alt="Minjae Korean logo"
      />
    </Link>
  );
}
