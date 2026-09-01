/** Language chrome only — keep this file free of catalog JSON so client layouts stay small. */

export const GLOBAL_LANG_NAMES: Record<string, string> = {
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  ar: "Arabic",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
};

export const GLOBAL_LANG_META: Record<
  string,
  { native: string; dir?: "rtl"; rail: string }
> = {
  es: { native: "Español", rail: "#b4471e" },
  fr: { native: "Français", rail: "#2f4d73" },
  de: { native: "Deutsch", rail: "#9a6b12" },
  it: { native: "Italiano", rail: "#2c6a4a" },
  ar: { native: "العربية", dir: "rtl", rail: "#5b3d86" },
  ja: { native: "日本語", rail: "#a31d18" },
  ko: { native: "한국어", rail: "#0f6b5c" },
  zh: { native: "中文", rail: "#b91c1c" },
};

export function globalLangMeta(code: string) {
  const c = String(code || "").toLowerCase();
  return GLOBAL_LANG_META[c] || { native: code, rail: "#1b1511" };
}

export function getGlobalLang(code: string): { code: string; name: string } | null {
  const c = String(code || "")
    .trim()
    .toLowerCase();
  const name = GLOBAL_LANG_NAMES[c];
  return name ? { code: c, name } : null;
}
