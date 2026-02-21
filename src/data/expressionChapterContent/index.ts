import type { ExpressionChapterContent } from "../expressionTypes";

const contentLoaders: Record<string, () => Promise<{ default: ExpressionChapterContent }>> = {
  introductions: () => import("./content/introductions"),
};

export async function getExpressionChapterContent(
  slug: string
): Promise<ExpressionChapterContent | null> {
  const loader = contentLoaders[slug];
  if (!loader) return null;
  try {
    const mod = await loader();
    return mod.default;
  } catch {
    return null;
  }
}
