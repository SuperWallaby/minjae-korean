/** Client-safe TTS URL helper (no Node imports). */
export function grammarGuidePronunciationApiUrl(id: number): string {
  return `/api/grammar-guide/tts/${id}`;
}
