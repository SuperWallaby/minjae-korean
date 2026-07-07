import { MOCK_SESSION_STORAGE_KEY } from "@/lib/mock/session";

export const GA_OPT_OUT_KEY = "kaja_ga_opt_out";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

function normalizeEmail(email: string | null | undefined): string {
  return String(email ?? "").trim().toLowerCase();
}

export function parseGaExcludeEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_GA_EXCLUDE_EMAILS?.trim();
  const fromEnv = raw
    ? raw.split(/[,;]/).map((e) => normalizeEmail(e)).filter(Boolean)
    : [];
  const defaults = ["minjae@kajakorean.com"];
  return [...new Set([...fromEnv, ...defaults])];
}

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

export function emailFromStoredSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MOCK_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { user?: { email?: string } };
    return normalizeEmail(parsed.user?.email) || null;
  } catch {
    return null;
  }
}

export function shouldExcludeFromGa(opts: {
  email?: string | null;
  hostname: string;
}): boolean {
  if (typeof window !== "undefined") {
    if (localStorage.getItem(GA_OPT_OUT_KEY) === "1") return true;
  }

  if (LOCAL_HOSTS.has(opts.hostname)) return true;

  const email = normalizeEmail(opts.email) || emailFromStoredSession();
  if (!email) return false;

  return parseGaExcludeEmails().includes(email);
}

export function disableGaMeasurement(gaId: string): void {
  if (typeof window === "undefined") return;
  (window as Window & Record<string, boolean>)[`ga-disable-${gaId}`] = true;
}
