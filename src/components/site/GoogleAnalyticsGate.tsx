import { shouldExcludeGaByRequestIp } from "@/lib/gaExclusionServer";

import { GoogleAnalytics } from "./GoogleAnalytics";

/** Skips GA entirely when the request IP matches GA_EXCLUDE_IPS. */
export async function GoogleAnalyticsGate() {
  if (await shouldExcludeGaByRequestIp()) return null;
  return <GoogleAnalytics />;
}
