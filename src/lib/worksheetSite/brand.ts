/** worksheet.kajakorean.com — printable worksheets + pronunciation. */

export const WORKSHEET_SITE_NAME = "Kaja Worksheets";
export const WORKSHEET_SITE_TAGLINE = "Printable Korean worksheets with audio";
export const WORKSHEET_SITE_DESCRIPTION =
  "Free printable Korean worksheets — match, fill-in, and writing practice with pronunciation from Kaja Korean.";

export const WORKSHEET_SITE_DEFAULT_ORIGIN =
  "https://worksheet.kajakorean.com";

export function isWorksheetSiteDeployment(): boolean {
  return process.env.NEXT_PUBLIC_SITE_MODE?.trim() === "worksheet";
}

export function worksheetSiteOrigin(): string {
  const env = process.env.NEXT_PUBLIC_WORKSHEET_SITE_ORIGIN?.trim();
  if (env) return env.replace(/\/+$/, "");
  return WORKSHEET_SITE_DEFAULT_ORIGIN;
}

export function worksheetSiteHomeTitle(): string {
  return `${WORKSHEET_SITE_NAME} · ${WORKSHEET_SITE_TAGLINE}`;
}

export function worksheetSiteTitleTemplate(): string {
  return `%s · ${WORKSHEET_SITE_NAME}`;
}

export function worksheetSiteFooter(): string {
  return `${worksheetSiteOrigin().replace(/^https?:\/\//, "")} · Listen & practice on Kaja Korean`;
}
