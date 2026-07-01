import type { AnswerTtsVariant } from "./ttsUrls";

const DEFAULT_VOICE_ID = "v1jVu1Ky28piIPEJqRrm";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

const VARIANT_SETTINGS: Record<
  AnswerTtsVariant,
  { stability: number; style: number; speed?: number }
> = {
  normal: { stability: 0.66, style: 0.48 },
  slow: { stability: 0.7, style: 0.4, speed: 0.8 },
};

export function resolveElevenLabsVoiceId(
  itemVoiceId?: string | null,
): string {
  const fromItem = itemVoiceId?.trim();
  if (fromItem) return fromItem;
  const fromEnv = process.env.KOREAN_QUIZ_ELEVENLABS_VOICE_ID?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_VOICE_ID;
}

export async function synthesizeAnswerTtsMp3(params: {
  text: string;
  variant: AnswerTtsVariant;
  voiceId?: string;
}): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is required.");
  }

  const voiceId = resolveElevenLabsVoiceId(params.voiceId);
  const preset = VARIANT_SETTINGS[params.variant];
  const modelId =
    process.env.KOREAN_QUIZ_ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL_ID;

  const body: Record<string, unknown> = {
    text: params.text,
    model_id: modelId,
    voice_settings: {
      stability: preset.stability,
      similarity_boost: 0.78,
      style: preset.style,
      use_speaker_boost: true,
    },
  };
  if (preset.speed != null) {
    body.voice_settings = {
      ...(body.voice_settings as object),
      speed: preset.speed,
    };
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `ElevenLabs TTS failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}
