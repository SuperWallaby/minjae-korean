"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pronounceChromeCopy } from "@/lib/pronounceSite/chromeCopy";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Logo/back link — current language hub, not always Chinese `/`. */
export function PronounceHomeLink({ children, className }: Props) {
  const chrome = pronounceChromeCopy(usePathname());
  return (
    <Link href={chrome.homeHref} className={className}>
      {children}
    </Link>
  );
}
