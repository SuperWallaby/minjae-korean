/**
 * Edge Neural voices for EN→EN sound charts.
 * Axes: gender (female / male) × accent (US / UK / AU).
 */

export const SOUND_GENDERS = [
  { id: "female" as const, label: "Female" },
  { id: "male" as const, label: "Male" },
] as const;

export type SoundGenderId = (typeof SOUND_GENDERS)[number]["id"];

/** @deprecated use SoundGenderId */
export type SoundVoiceId = SoundGenderId;

export const SOUND_ACCENTS = [
  {
    id: "us" as const,
    label: "US",
    hint: "American English",
    female: "en-US-JennyNeural",
    male: "en-US-GuyNeural",
  },
  {
    id: "uk" as const,
    label: "UK",
    hint: "British English",
    female: "en-GB-SoniaNeural",
    male: "en-GB-RyanNeural",
  },
  {
    id: "au" as const,
    label: "AU",
    hint: "Australian English",
    female: "en-AU-NatashaNeural",
    male: "en-AU-WilliamNeural",
  },
] as const;

export type SoundAccentId = (typeof SOUND_ACCENTS)[number]["id"];

export type SoundTtsFields = {
  ttsUrl?: string;
  /** US female (canonical + legacy) */
  ttsFemale?: string;
  /** US male (canonical + legacy) */
  ttsMale?: string;
  ttsFemaleUk?: string;
  ttsMaleUk?: string;
  ttsFemaleAu?: string;
  ttsMaleAu?: string;
  ttsProvider?: string;
};

export function ttsFieldName(
  gender: SoundGenderId,
  accent: SoundAccentId,
): keyof SoundTtsFields {
  if (accent === "us") return gender === "female" ? "ttsFemale" : "ttsMale";
  if (accent === "uk")
    return gender === "female" ? "ttsFemaleUk" : "ttsMaleUk";
  return gender === "female" ? "ttsFemaleAu" : "ttsMaleAu";
}

export const SOUND_VOICE_SLOTS = SOUND_ACCENTS.flatMap((accent) =>
  SOUND_GENDERS.map((gender) => ({
    gender: gender.id,
    accent: accent.id,
    voice: accent[gender.id],
    label: `${gender.label} ${accent.label}`,
    field: ttsFieldName(gender.id, accent.id),
  })),
);

export function soundEdgeVoice(
  gender: SoundGenderId,
  accent: SoundAccentId,
): string {
  const row = SOUND_ACCENTS.find((a) => a.id === accent)!;
  return row[gender];
}

/** Resolve playable URL for gender + accent (falls back to US of same gender). */
export function soundTtsUrl(
  item: SoundTtsFields,
  gender: SoundGenderId,
  accent: SoundAccentId = "us",
): string {
  const field = ttsFieldName(gender, accent);
  const direct = String(item[field] || "").trim();
  if (direct) return direct;
  if (accent !== "us") {
    const us = soundTtsUrl(item, gender, "us");
    if (us) return us;
  }
  if (gender === "female") return String(item.ttsUrl || "").trim();
  return "";
}

/** Legacy helper: female/male US only. */
export function soundVoiceUrls(
  item: SoundTtsFields,
): Record<SoundGenderId, string> {
  return {
    female: soundTtsUrl(item, "female", "us"),
    male: soundTtsUrl(item, "male", "us"),
  };
}

export function soundHasAnyVoice(item: SoundTtsFields): boolean {
  return SOUND_VOICE_SLOTS.some((s) =>
    Boolean(soundTtsUrl(item, s.gender, s.accent)),
  );
}

export function soundHasFullVoices(item: SoundTtsFields): boolean {
  return SOUND_VOICE_SLOTS.every((s) =>
    Boolean(
      String(item[s.field] || "").trim() ||
        (s.field === "ttsFemale" && item.ttsUrl),
    ),
  );
}

/** @deprecated alias */
export const SOUND_VOICES = SOUND_GENDERS.map((g) => ({
  id: g.id,
  voice: soundEdgeVoice(g.id, "us"),
  label: g.label,
  hint: "Clear US English",
}));
