/** Edge Neural voices for Japanese learners comparing English accents. */

export const JA_EN_ACCENTS = [
  {
    id: "us" as const,
    voice: "en-US-JennyNeural",
    labelJa: "米国",
    labelEn: "US",
    hint: "アメリカ英語",
  },
  {
    id: "uk" as const,
    voice: "en-GB-SoniaNeural",
    labelJa: "英国",
    labelEn: "UK",
    hint: "イギリス英語",
  },
  {
    id: "au" as const,
    voice: "en-AU-NatashaNeural",
    labelJa: "豪州",
    labelEn: "AU",
    hint: "オーストラリア英語",
  },
] as const;

export type JaEnAccentId = (typeof JA_EN_ACCENTS)[number]["id"];

export type JaEnTtsFields = {
  ttsUrl?: string;
  ttsUs?: string;
  ttsUk?: string;
  ttsAu?: string;
  ttsProvider?: string;
};

export function jaEnAccentUrls(item: JaEnTtsFields): Record<JaEnAccentId, string> {
  return {
    us: String(item.ttsUs || item.ttsUrl || "").trim(),
    uk: String(item.ttsUk || "").trim(),
    au: String(item.ttsAu || "").trim(),
  };
}

export function jaEnHasAllAccents(item: JaEnTtsFields): boolean {
  const u = jaEnAccentUrls(item);
  return Boolean(u.us && u.uk && u.au);
}

export function jaEnHasAnyAccent(item: JaEnTtsFields): boolean {
  const u = jaEnAccentUrls(item);
  return Boolean(u.us || u.uk || u.au);
}
