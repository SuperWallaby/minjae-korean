export type ReadingLevel = 1 | 2 | 3 | 4 | 5;

/** 사이트 톤에 맞는 배지 배경 (included-1~4, panel-stone) */
export function levelBadgeClass(level: ReadingLevel): string {
  switch (level) {
    case 1:
      return "bg-[var(--included-1)] text-[var(--badge-muted-foreground)]";
    case 2:
      return "bg-[var(--included-2)] text-[var(--text-primary)]";
    case 3:
      return "bg-[var(--included-3)] text-[var(--text-primary)]";
    case 4:
      return "bg-[var(--level-4-bg)] text-[var(--text-primary)]";
    case 5:
      return "bg-[var(--level-5-bg)] text-[var(--text-primary)]";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function levelLabel(level: ReadingLevel): string {
  const labels: Record<ReadingLevel, string> = {
    1: "Beginner",
    2: "Basic",
    3: "Intermediate",
    4: "Advanced",
    5: "Proficient",
  };
  return labels[level] ?? `Level ${level}`;
}

/** 표기용 레벨: 내부 1~5 → 5~9 */
export function displayLevel(level: ReadingLevel): number {
  return Math.min(9, Math.max(5, level + 4));
}

export function formatNewsDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
