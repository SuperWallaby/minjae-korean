import { normalizePublicMediaUrl } from "@/lib/mediaUrl";
import type { PronounceTtsFields } from "@/lib/pronounceSite/voices";
import type { GlobalPinExample, GlobalPinWord } from "@/lib/globalSite/catalog";

/** Resolve catalog TTS path (relative or CDN) for playback. */
export function resolveGlobalTtsSrc(src?: string | null): string {
  const raw = String(src || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return normalizePublicMediaUrl(raw);
  return raw.startsWith("/") ? raw : `/${raw}`;
}

export function globalWordToPronounceTts(word: GlobalPinWord): PronounceTtsFields {
  return {
    ttsUrl: word.ttsUrl,
    ttsFemaleCn: word.ttsFemaleCn,
    ttsMaleCn: word.ttsMaleCn,
    ttsFemaleTw: word.ttsFemaleTw,
    ttsMaleTw: word.ttsMaleTw,
    ttsFemaleHk: word.ttsFemaleHk,
    ttsMaleHk: word.ttsMaleHk,
    ttsProvider: word.ttsProvider,
  };
}

export function pinHasWordAudio(words: GlobalPinWord[]): boolean {
  return words.some(
    (w) =>
      Boolean(resolveGlobalTtsSrc(w.ttsUrl)) ||
      Boolean(resolveGlobalTtsSrc(w.ttsLatam)) ||
      Boolean(resolveGlobalTtsSrc(w.ttsEs)),
  );
}

export function pinHasExampleAudio(examples: GlobalPinExample[] = []): boolean {
  return examples.some(
    (ex) =>
      Boolean(resolveGlobalTtsSrc(ex.ttsUrl)) ||
      Boolean(resolveGlobalTtsSrc(ex.ttsLatam)) ||
      Boolean(resolveGlobalTtsSrc(ex.ttsEs)),
  );
}
