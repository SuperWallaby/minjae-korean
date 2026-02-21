"use client";

import type { SwapCategoryWithResult } from "@/data/expressionTypes";

type Props = {
  categories: SwapCategoryWithResult[];
  onSelectResult?: (result: string) => void;
};

export function SwapChips({ categories, onSelectResult }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="space-y-3">
      {categories.map((category, i) => (
        <div key={i} className="flex flex-wrap gap-2">
          {category.items.map((item, j) => (
              <button
                key={j}
                type="button"
                onClick={() => onSelectResult?.(item.result)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/40"
              >
                <span className="font-medium text-foreground">{item.korean}</span>
                {item.english != null && (
                  <span className="text-muted-foreground">{item.english}</span>
                )}
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
