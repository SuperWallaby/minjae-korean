export const GA_OPT_OUT_KEY = "kaja_ga_opt_out";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export function applyGaOptOutFromUrl(search: string): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(search);
  if (params.get("ga_opt_out") === "1") {
    localStorage.setItem(GA_OPT_OUT_KEY, "1");
  }
  if (params.get("ga_opt_out") === "0") {
    localStorage.removeItem(GA_OPT_OUT_KEY);
  }
}

export function shouldExcludeFromGaClient(hostname: string): boolean {
  if (typeof window !== "undefined") {
    if (localStorage.getItem(GA_OPT_OUT_KEY) === "1") return true;
  }
  return LOCAL_HOSTS.has(hostname);
}

export function disableGaMeasurement(gaId: string): void {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = true;
}
