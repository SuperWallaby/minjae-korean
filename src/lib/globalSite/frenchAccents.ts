/** French accent branching for getpronounce / global charts (France vs Canada). */

export const FRENCH_ACCENTS = [
  {
    id: "fr" as const,
    /** Default — matches existing Edge clips (`fr-FR-DeniseNeural`). */
    default: true,
    label: "France",
    hint: "Metropolitan French (France)",
    edgeVoice: "fr-FR-DeniseNeural",
    locale: "fr-FR",
  },
  {
    id: "ca" as const,
    default: false,
    label: "Canada",
    hint: "Québec French (Canada)",
    edgeVoice: "fr-CA-SylvieNeural",
    locale: "fr-CA",
  },
] as const;

export type FrenchAccentId = (typeof FRENCH_ACCENTS)[number]["id"];

export type FrenchTtsFields = {
  /** Legacy / primary — France when both exist. */
  ttsUrl?: string;
  ttsFr?: string;
  ttsCa?: string;
  ttsProvider?: string;
};

export function frenchAccentById(
  id: string | null | undefined,
): (typeof FRENCH_ACCENTS)[number] {
  const hit = FRENCH_ACCENTS.find((a) => a.id === id);
  return hit || FRENCH_ACCENTS.find((a) => a.default)!;
}

function deriveCanadaUrl(franceOrPrimary: string): string {
  const u = franceOrPrimary.trim();
  if (!u) return "";
  if (/-fr(\.[a-z0-9]+)$/i.test(u)) {
    return u.replace(/-fr(\.[a-z0-9]+)$/i, "-ca$1");
  }
  return "";
}

export function frenchAccentUrls(
  item: FrenchTtsFields,
): Record<FrenchAccentId, string> {
  const fr = String(item.ttsFr || item.ttsUrl || "").trim();
  const ca = String(item.ttsCa || "").trim() || deriveCanadaUrl(fr);
  return { fr, ca };
}

export function frenchTtsUrl(
  item: FrenchTtsFields,
  accent: FrenchAccentId = "fr",
): string {
  const urls = frenchAccentUrls(item);
  if (accent === "ca") return urls.ca || urls.fr;
  return urls.fr || urls.ca;
}

export function frenchHasBothAccents(item: FrenchTtsFields): boolean {
  const u = frenchAccentUrls(item);
  return Boolean(u.fr && u.ca);
}

export function frenchHasAnyAccent(item: FrenchTtsFields): boolean {
  const u = frenchAccentUrls(item);
  return Boolean(u.fr || u.ca);
}
