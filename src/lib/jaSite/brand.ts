/** EigoChart — English vocab charts for Japanese speakers. Not a Kaja product. */

export const EIGOCHART_NAME = "EigoChart";
export const EIGOCHART_NAME_JA = "エイゴチャート";
export const EIGOCHART_TAGLINE = "米・英・豪の発音を聞き比べ";
export const EIGOCHART_DESCRIPTION =
  "日本人向けの英語発音チャート。アメリカ・イギリス・オーストラリアの発音を聞き比べ。";

export const EIGOCHART_DEFAULT_ORIGIN = "https://eigopin.com";

const JA_SITE_MODES = new Set(["eigochart", "eigopin"]);

export function isJaSiteDeployment(): boolean {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE?.trim();
  return mode ? JA_SITE_MODES.has(mode) : false;
}

/** @deprecated use isJaSiteDeployment */
export const isEigopinDeployment = isJaSiteDeployment;

export function eigoChartOrigin(): string {
  const env = process.env.NEXT_PUBLIC_JA_SITE_ORIGIN?.trim();
  if (env) return env.replace(/\/+$/, "");
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (isJaSiteDeployment() && prod) {
    return `https://${prod.replace(/^https?:\/\//, "")}`;
  }
  return EIGOCHART_DEFAULT_ORIGIN;
}

/** @deprecated use eigoChartOrigin */
export const eigopinOrigin = eigoChartOrigin;

export function eigoChartHomeTitle(): string {
  return `${EIGOCHART_NAME} · ${EIGOCHART_TAGLINE}`;
}

/** @deprecated use eigoChartHomeTitle */
export const eigopinHomeTitle = eigoChartHomeTitle;

export function eigoChartTitleTemplate(): string {
  return `%s · ${EIGOCHART_NAME}`;
}

/** @deprecated use eigoChartTitleTemplate */
export const eigopinTitleTemplate = eigoChartTitleTemplate;

/** @deprecated use EIGOCHART_NAME */
export const EIGOPIN_NAME = EIGOCHART_NAME;
/** @deprecated use EIGOCHART_NAME_JA */
export const EIGOPIN_NAME_JA = EIGOCHART_NAME_JA;
/** @deprecated use EIGOCHART_TAGLINE */
export const EIGOPIN_TAGLINE = EIGOCHART_TAGLINE;
/** @deprecated use EIGOCHART_DESCRIPTION */
export const EIGOPIN_DESCRIPTION = EIGOCHART_DESCRIPTION;
/** @deprecated use EIGOCHART_DEFAULT_ORIGIN */
export const EIGOPIN_DEFAULT_ORIGIN = EIGOCHART_DEFAULT_ORIGIN;
