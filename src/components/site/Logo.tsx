import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  mode = "v2",
}: {
  className?: string;
  mode?: "v1" | "v2" | "footer";
}) {
  const size = mode === "footer" ? 48 : 40;
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label="Kaja home"
    >
      <Image
        width={size}
        height={size}
        src="/brand/logo.webp"
        alt="Kaja logo"
        className="rounded-full"
      />
    </Link>
  );
}
