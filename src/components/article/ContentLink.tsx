"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * 블로그/뉴스 등 본문 안에서 쓰는 링크. 밑줄·색상으로 링크처럼 보이게 함.
 * content/ 에서 import: import { ContentLink } from "@/components/article/ContentLink";
 */
export function ContentLink({
  href,
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      href={href}
      className={cn(
        "text-primary underline underline-offset-2 decoration-primary/70 hover:decoration-primary",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
