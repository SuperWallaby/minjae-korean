import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = { label: string; href?: string };

const SEPARATOR = "·";

export function Breadcrumb({
  items,
  className,
  ...props
}: { items: BreadcrumbItem[] } & Omit<
  React.ComponentPropsWithoutRef<"nav">,
  "aria-label"
>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("mb-6", className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          const isCurrent = isLast && item.href == null;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <li aria-hidden className="select-none">
                  {SEPARATOR}
                </li>
              )}
              <li>
                {item.href != null ? (
                  <Link href={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isCurrent ? "font-medium text-foreground" : ""}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
