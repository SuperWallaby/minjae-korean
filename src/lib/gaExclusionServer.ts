import { headers } from "next/headers";

/** Server-only: comma/semicolon/space separated IPs to skip GA (e.g. home office). */
export function parseGaExcludeIps(): string[] {
  const raw = process.env.GA_EXCLUDE_IPS?.trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function clientIpFromHeaders(headerList: Headers): string | null {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const vercelForwarded = headerList.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    const first = vercelForwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return headerList.get("x-real-ip")?.trim() || null;
}

export function isGaIpExcluded(
  ip: string | null,
  excludeIps: string[] = parseGaExcludeIps(),
): boolean {
  if (!ip || excludeIps.length === 0) return false;
  return excludeIps.includes(ip);
}

export async function shouldExcludeGaByRequestIp(): Promise<boolean> {
  const headerList = await headers();
  const ip = clientIpFromHeaders(headerList);
  return isGaIpExcluded(ip);
}
