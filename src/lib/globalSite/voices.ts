/** Edge neural voices for global pin word/example TTS. */
export const GLOBAL_EDGE_VOICE: Record<string, string> = {
  es: "es-ES-ElviraNeural",
  fr: "fr-FR-DeniseNeural",
  de: "de-DE-KatjaNeural",
  it: "it-IT-ElsaNeural",
  ar: "ar-SA-ZariyahNeural",
  ja: "ja-JP-NanamiNeural",
};

export function edgeVoiceForLang(lang: string): string {
  const code = String(lang || "")
    .trim()
    .toLowerCase()
    .slice(0, 2);
  return GLOBAL_EDGE_VOICE[code] || "en-US-JennyNeural";
}
