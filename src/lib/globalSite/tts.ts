import { FILE_CDN, normalizePublicMediaUrl, pinCdnUrl } from "@/lib/mediaUrl";
import type { PronounceTtsFields } from "@/lib/pronounceSite/voices";
import type { GlobalPinExample, GlobalPinWord } from "@/lib/globalSite/catalog";

/** Resolve catalog TTS path (relative or CDN) for playback. */
export function resolveGlobalTtsSrc(src?: string | null): string {
  const raw = String(src || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return normalizePublicMediaUrl(raw);
  // Old catalog paths were `/global/audio/{id}/w0.mp3`; objects live under grammar-x/.
  if (raw.startsWith("/global/audio/")) {
    return `${FILE_CDN}/grammar-x/global-pin-tts/${raw.slice("/global/audio/".length)}`;
  }
  return pinCdnUrl(raw);
}

export function globalWordToPronounceTts(word: GlobalPinWord): PronounceTtsFields {
  const female = String(word.ttsUrl || word.ttsFemaleCn || "").trim();
  const male = String(word.ttsMaleUrl || word.ttsMaleCn || "").trim();
  return {
    ttsUrl: word.ttsUrl,
    // Map Korean (and any) male/female pair onto CN slots so PronounceTtsButton works.
    ttsFemaleCn: word.ttsFemaleCn || female || undefined,
    ttsMaleCn: word.ttsMaleCn || male || undefined,
    ttsFemaleTw: word.ttsFemaleTw,
    ttsMaleTw: word.ttsMaleTw,
    ttsFemaleHk: word.ttsFemaleHk,
    ttsMaleHk: word.ttsMaleHk,
    ttsProvider: word.ttsProvider,
  };
}

export function globalExampleToPronounceTts(
  example: GlobalPinExample,
): PronounceTtsFields {
  const female = String(example.ttsUrl || "").trim();
  const male = String(example.ttsMaleUrl || "").trim();
  return {
    ttsUrl: example.ttsUrl,
    ttsFemaleCn: female || undefined,
    ttsMaleCn: male || undefined,
    ttsProvider: example.ttsProvider,
  };
}

export function pinHasWordAudio(words: GlobalPinWord[]): boolean {
  return words.some(
    (w) =>
      Boolean(resolveGlobalTtsSrc(w.ttsUrl)) ||
      Boolean(resolveGlobalTtsSrc(w.ttsMaleUrl)) ||
      Boolean(resolveGlobalTtsSrc(w.ttsLatam)) ||
      Boolean(resolveGlobalTtsSrc(w.ttsEs)) ||
      Boolean(resolveGlobalTtsSrc(w.ttsFemaleCn)),
  );
}

export function pinHasExampleAudio(examples: GlobalPinExample[] = []): boolean {
  return examples.some(
    (ex) =>
      Boolean(resolveGlobalTtsSrc(ex.ttsUrl)) ||
      Boolean(resolveGlobalTtsSrc(ex.ttsMaleUrl)) ||
      Boolean(resolveGlobalTtsSrc(ex.ttsLatam)) ||
      Boolean(resolveGlobalTtsSrc(ex.ttsEs)),
  );
}
