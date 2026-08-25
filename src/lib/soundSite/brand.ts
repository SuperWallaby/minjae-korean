/** Sound · EigoPin — English pronunciation charts for English speakers. */

export const SOUND_SITE_NAME = "EigoSound";
export const SOUND_SITE_TAGLINE = "Hear English the way it’s spoken";
export const SOUND_SITE_DESCRIPTION =
  "English vocabulary charts with clear pronunciation audio — listen in a female or male voice, then practice with a tutor.";

export const SOUND_SITE_DEFAULT_ORIGIN = "https://sound.eigopin.com";

export function isSoundSiteDeployment(): boolean {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE?.trim();
  return mode === "sound" || mode === "eigosound";
}

export function soundSiteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_SOUND_SITE_ORIGIN?.trim();
  if (env) return env.replace(/\/+$/, "");
  return SOUND_SITE_DEFAULT_ORIGIN;
}

export function soundSiteHomeTitle(): string {
  return `${SOUND_SITE_NAME} · ${SOUND_SITE_TAGLINE}`;
}

export function soundSiteTitleTemplate(): string {
  return `%s · ${SOUND_SITE_NAME}`;
}
