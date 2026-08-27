/** Edge neural voices for global pin word/example TTS. */
import { spanishAccentById, type SpanishAccentId } from "./spanishAccents";

export const GLOBAL_EDGE_VOICE: Record<string, string> = {
  /** LatAm default — see spanishAccents for Spain variant. */
  es: "es-MX-DaliaNeural",
  fr: "fr-FR-DeniseNeural",
  de: "de-DE-KatjaNeural",
  it: "it-IT-ElsaNeural",
  ar: "ar-SA-ZariyahNeural",
  ja: "ja-JP-NanamiNeural",
  zh: "zh-CN-XiaoxiaoNeural",
};

export type EdgeVoiceOpts = {
  /** Spanish only: `latam` (default) | `es` */
  spanishAccent?: SpanishAccentId;
};

export function edgeVoiceForLang(
  lang: string,
  opts: EdgeVoiceOpts = {},
): string {
  const code = String(lang || "")
    .trim()
    .toLowerCase()
    .slice(0, 2);
  if (code === "es") {
    return spanishAccentById(opts.spanishAccent).edgeVoice;
  }
  return GLOBAL_EDGE_VOICE[code] || "en-US-JennyNeural";
}
