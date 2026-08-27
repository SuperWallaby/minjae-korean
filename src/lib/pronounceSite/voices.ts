/**
 * Pronunciation voice matrix: region (CN / TW / HK) × gender.
 * Populated by enrich-pronounce-pins (ElevenLabs bootstrap → SoVITS when ready).
 */

export const PRONOUNCE_GENDERS = [
  { id: "female" as const, label: "Female" },
  { id: "male" as const, label: "Male" },
] as const;

export type PronounceGenderId = (typeof PRONOUNCE_GENDERS)[number]["id"];

export const PRONOUNCE_REGIONS = [
  {
    id: "cn" as const,
    label: "CN",
    hint: "Mandarin (Mainland)",
    female: "cn-female",
    male: "cn-male",
  },
  {
    id: "tw" as const,
    label: "TW",
    hint: "Mandarin (Taiwan)",
    female: "tw-female",
    male: "tw-male",
  },
  {
    id: "hk" as const,
    label: "HK",
    hint: "Cantonese (Hong Kong)",
    female: "hk-female",
    male: "hk-male",
  },
] as const;

export type PronounceRegionId = (typeof PRONOUNCE_REGIONS)[number]["id"];

export type PronounceTtsFields = {
  ttsUrl?: string;
  ttsFemaleCn?: string;
  ttsMaleCn?: string;
  ttsFemaleTw?: string;
  ttsMaleTw?: string;
  ttsFemaleHk?: string;
  ttsMaleHk?: string;
  ttsProvider?: string;
};

export function ttsFieldName(
  gender: PronounceGenderId,
  region: PronounceRegionId,
): keyof PronounceTtsFields {
  const cap = region.charAt(0).toUpperCase() + region.slice(1);
  return gender === "female"
    ? (`ttsFemale${cap}` as keyof PronounceTtsFields)
    : (`ttsMale${cap}` as keyof PronounceTtsFields);
}

export const PRONOUNCE_VOICE_SLOTS = PRONOUNCE_REGIONS.flatMap((region) =>
  PRONOUNCE_GENDERS.map((gender) => ({
    gender: gender.id,
    region: region.id,
    slot: region[gender.id],
    label: `${gender.label} ${region.label}`,
    field: ttsFieldName(gender.id, region.id),
  })),
);

export function pronounceTtsUrl(
  item: PronounceTtsFields,
  gender: PronounceGenderId,
  region: PronounceRegionId = "cn",
): string {
  const field = ttsFieldName(gender, region);
  const direct = String(item[field] || "").trim();
  if (direct) return direct;
  if (region !== "cn") {
    const cn = pronounceTtsUrl(item, gender, "cn");
    if (cn) return cn;
  }
  if (gender === "female") return String(item.ttsUrl || "").trim();
  return "";
}

export function pronounceHasFullVoices(item: PronounceTtsFields): boolean {
  return PRONOUNCE_VOICE_SLOTS.every((s) =>
    Boolean(
      String(item[s.field] || "").trim() ||
        (s.field === "ttsFemaleCn" && item.ttsUrl),
    ),
  );
}
