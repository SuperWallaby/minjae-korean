/** Spanish accent branching for getpronounce / global charts (ES vs LatAm). */

export const SPANISH_ACCENTS = [
  {
    id: "latam" as const,
    /** Default for US Pinterest traffic. */
    default: true,
    label: "LatAm",
    hint: "Latin America (Mexico)",
    edgeVoice: "es-MX-DaliaNeural",
    edgeVoiceMale: "es-MX-JorgeNeural",
    locale: "es-MX",
  },
  {
    id: "es" as const,
    default: false,
    label: "Spain",
    hint: "Castilian (Spain)",
    edgeVoice: "es-ES-ElviraNeural",
    edgeVoiceMale: "es-ES-AlvaroNeural",
    locale: "es-ES",
  },
] as const;

export type SpanishAccentId = (typeof SPANISH_ACCENTS)[number]["id"];

export type SpanishTtsFields = {
  /** Legacy / primary — prefer LatAm when both exist. */
  ttsUrl?: string;
  ttsLatam?: string;
  ttsEs?: string;
  ttsProvider?: string;
};

export function spanishAccentById(
  id: string | null | undefined,
): (typeof SPANISH_ACCENTS)[number] {
  const hit = SPANISH_ACCENTS.find((a) => a.id === id);
  return hit || SPANISH_ACCENTS.find((a) => a.default)!;
}

export function spanishAccentUrls(
  item: SpanishTtsFields,
): Record<SpanishAccentId, string> {
  const latam = String(item.ttsLatam || item.ttsUrl || "").trim();
  const es = String(item.ttsEs || "").trim();
  return { latam, es };
}

export function spanishTtsUrl(
  item: SpanishTtsFields,
  accent: SpanishAccentId = "latam",
): string {
  const urls = spanishAccentUrls(item);
  if (accent === "es") return urls.es || urls.latam;
  return urls.latam || urls.es;
}

export function spanishHasBothAccents(item: SpanishTtsFields): boolean {
  const u = spanishAccentUrls(item);
  return Boolean(u.latam && u.es);
}

export function spanishHasAnyAccent(item: SpanishTtsFields): boolean {
  const u = spanishAccentUrls(item);
  return Boolean(u.latam || u.es);
}
