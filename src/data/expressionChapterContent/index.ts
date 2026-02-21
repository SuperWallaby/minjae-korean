import type { ExpressionChapterContent } from "../expressionTypes";

const contentLoaders: Record<string, () => Promise<{ default: ExpressionChapterContent }>> = {
  introductions: () => import("./content/introductions"),
  "where-from": () => import("./content/where-from"),
  "name-age-job": () => import("./content/name-age-job"),
  "where-live": () => import("./content/where-live"),
  "nice-to-meet-you": () => import("./content/nice-to-meet-you"),
  "likes-dislikes": () => import("./content/likes-dislikes"),
  "hobbies-interests": () => import("./content/hobbies-interests"),
  favorites: () => import("./content/favorites"),
  frequency: () => import("./content/frequency"),
  recommendations: () => import("./content/recommendations"),
  "what-did-today": () => import("./content/what-did-today"),
  "today-ate": () => import("./content/today-ate"),
  "where-went": () => import("./content/where-went"),
  "how-feeling": () => import("./content/how-feeling"),
  "weekend-plans": () => import("./content/weekend-plans"),
  "what-doing-now": () => import("./content/what-doing-now"),
  "where-am-now": () => import("./content/where-am-now"),
  "free-time": () => import("./content/free-time"),
  need: () => import("./content/need"),
  want: () => import("./content/want"),
  "want-to": () => import("./content/want-to"),
  "want-to-learn": () => import("./content/want-to-learn"),
  "basic-questions": () => import("./content/basic-questions"),
  "questions-about-today": () => import("./content/questions-about-today"),
  "make-plans-questions": () => import("./content/make-plans-questions"),
  "follow-up-questions": () => import("./content/follow-up-questions"),
  "add-ons": () => import("./content/add-ons"),
  "because-so": () => import("./content/because-so"),
  "but-and": () => import("./content/but-and"),
  "time-place-addons": () => import("./content/time-place-addons"),
  "when-stuck": () => import("./content/when-stuck"),
  "please-repeat": () => import("./content/please-repeat"),
  "forgot-the-word": () => import("./content/forgot-the-word"),
  "confirm-meaning": () => import("./content/confirm-meaning"),
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
