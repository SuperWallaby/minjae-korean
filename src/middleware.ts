import { NextRequest, NextResponse } from "next/server";
import { globalPathToPronounce } from "@/lib/atlasRoutes";
import vocabKoRedirect from "@/data/vocabInfographic/redirectToGetpronounce.json";

const PRONOUNCE_ORIGIN = "https://getpronounce.net";

/** vocab `{bundleId}/{slug}` → getpronounce pin id. Hub `/ko/` is never a fallback. */
const VOCAB_KO_PIN: Record<string, string> = Object.fromEntries(
  Object.entries(
    (vocabKoRedirect as { mappings?: Record<string, string> }).mappings || {},
  ).map(([path, id]) => [
    String(path).replace(/^\/+|\/+$/g, ""),
    String(id).trim(),
  ]),
);

const GLOBAL_HOSTS = new Set([
  "global.kajakorean.com",
  "global.localhost",
  "global.localhost:3000",
  "global.127.0.0.1",
  "global.127.0.0.1:3000",
]);

const SOUND_HOSTS = new Set([
  "sound.eigopin.com",
  "www.sound.eigopin.com",
  "sound.eigopin.localhost",
  "sound.eigopin.localhost:3000",
]);

const PRONOUNCE_HOSTS = new Set([
  "getpronounce.net",
  "www.getpronounce.net",
  "getpronounce.localhost",
  "getpronounce.localhost:3000",
]);

const WORKSHEET_HOSTS = new Set([
  "worksheet.kajakorean.com",
  "worksheet.localhost",
  "worksheet.localhost:3000",
  "worksheet.127.0.0.1",
  "worksheet.127.0.0.1:3000",
]);

const JA_HOSTS = new Set([
  "eigopin.com",
  "www.eigopin.com",
  "eigochart.com",
  "www.eigochart.com",
  "eigopin.vercel.app",
  "www.eigopin.vercel.app",
  "eigochart.localhost",
  "eigochart.localhost:3000",
  "eigopin.localhost",
  "eigopin.localhost:3000",
  "ja.localhost",
  "ja.localhost:3000",
  "ja.127.0.0.1",
  "ja.127.0.0.1:3000",
]);

type AtlasSite = "global" | "ja" | "sound" | "pronounce" | "worksheet";

/** Edge-cache HTML for public atlas + vocab SEO (browser can still revalidate). */
const PUBLIC_HTML_CACHE =
  "public, s-maxage=3600, stale-while-revalidate=86400";

/** @deprecated use PUBLIC_HTML_CACHE */
const ATLAS_HTML_CACHE = PUBLIC_HTML_CACHE;

function hostname(host: string): string {
  return host.split(":")[0]?.toLowerCase() || "";
}

function isWorksheetSiteMode(): boolean {
  return process.env.NEXT_PUBLIC_SITE_MODE?.trim() === "worksheet";
}

function isWorksheetHost(host: string): boolean {
  if (isWorksheetSiteMode()) return true;
  const h = hostname(host);
  if (WORKSHEET_HOSTS.has(host.toLowerCase()) || WORKSHEET_HOSTS.has(h))
    return true;
  return h.startsWith("worksheet.");
}

function isGlobalHost(host: string): boolean {
  const h = hostname(host);
  if (GLOBAL_HOSTS.has(host.toLowerCase()) || GLOBAL_HOSTS.has(h)) return true;
  return h.startsWith("global.");
}

function isSoundHost(host: string): boolean {
  const h = hostname(host);
  if (SOUND_HOSTS.has(host.toLowerCase()) || SOUND_HOSTS.has(h)) return true;
  return h === "sound.eigopin.com" || h.startsWith("sound.");
}

function isPronounceSiteMode(): boolean {
  return process.env.NEXT_PUBLIC_SITE_MODE?.trim() === "pronounce";
}

function isPronounceHost(host: string): boolean {
  if (isPronounceSiteMode()) return true;
  const h = hostname(host);
  if (PRONOUNCE_HOSTS.has(host.toLowerCase()) || PRONOUNCE_HOSTS.has(h))
    return true;
  return h === "getpronounce.net" || h.startsWith("getpronounce.");
}

function isJaSiteMode(): boolean {
  const mode = process.env.NEXT_PUBLIC_SITE_MODE?.trim();
  return mode === "eigochart" || mode === "eigopin";
}

function isJaHost(host: string): boolean {
  // Sound subdomain must never fall through to ja, even on eigopin deploy.
  if (isSoundHost(host)) return false;
  if (isJaSiteMode()) return true;
  const h = hostname(host);
  if (JA_HOSTS.has(host.toLowerCase()) || JA_HOSTS.has(h)) return true;
  return (
    h === "eigochart.com" ||
    h.endsWith(".eigochart.com") ||
    h === "eigopin.vercel.app" ||
    h.startsWith("eigopin.")
  );
}

function withPublicHtmlCache(res: NextResponse) {
  res.headers.set("CDN-Cache-Control", PUBLIC_HTML_CACHE);
  res.headers.set("Vercel-CDN-Cache-Control", PUBLIC_HTML_CACHE);
  return res;
}

function withAtlasCdnCache(res: NextResponse) {
  return withPublicHtmlCache(res);
}

function taggedNext(request: NextRequest, site: AtlasSite) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kaja-site", site);
  return withAtlasCdnCache(
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
  );
}

function taggedRewrite(request: NextRequest, url: URL, site: AtlasSite) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kaja-site", site);
  return withAtlasCdnCache(
    NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    }),
  );
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/global/") ||
    pathname.startsWith("/ja/") ||
    pathname.startsWith("/sound/") ||
    pathname.startsWith("/pronounce/") ||
    pathname.startsWith("/favicon") ||
    Boolean(
      pathname.match(
        /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|mp3|woff2?)$/i,
      ),
    )
  );
}

function pronouncePathRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (pathname === "/jp" || pathname.startsWith("/jp/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/jp(?=\/|$)/, "/ja");
    return NextResponse.redirect(url, 301);
  }

  if (pathname === "/lang/zh" || pathname === "/lang/zh/") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 301);
  }

  const langHub = pathname.match(/^\/lang\/([a-z]{2})\/?$/);
  if (langHub) {
    const code = langHub[1]!;
    const url = request.nextUrl.clone();
    url.pathname = code === "zh" ? "/" : `/${code}/`;
    return NextResponse.redirect(url, 301);
  }

  const langPin = pathname.match(/^\/lang\/([a-z]{2})\/pin\/(.+)$/);
  if (langPin) {
    const code = langPin[1]!;
    const id = langPin[2]!;
    const url = request.nextUrl.clone();
    url.pathname = code === "zh" ? `/pin/${id}` : `/${code}/pin/${id}`;
    return NextResponse.redirect(url, 301);
  }

  const apexPin = pathname.match(/^\/pin\/([^/]+)$/);
  if (apexPin) {
    const id = decodeURIComponent(apexPin[1]!);
    const lang = id.match(/__([a-z]{2})$/i)?.[1]?.toLowerCase();
    if (lang && lang !== "zh") {
      const url = request.nextUrl.clone();
      url.pathname = `/${lang === "jp" ? "ja" : lang}/pin/${encodeURIComponent(id)}`;
      return NextResponse.redirect(url, 301);
    }
  }

  return null;
}

function globalToPronounceRedirect(request: NextRequest): NextResponse {
  const target = new URL(PRONOUNCE_ORIGIN);
  target.pathname = globalPathToPronounce(request.nextUrl.pathname);
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 301);
}

function atlasMiddleware(
  request: NextRequest,
  site: AtlasSite,
  prefix:
    | "/global-site"
    | "/ja-site"
    | "/sound-site"
    | "/pronounce-site"
    | "/worksheet-site",
) {
  const { pathname } = request.nextUrl;
  const sitePath = pathname.startsWith(prefix);
  const host = request.headers.get("host") || "";
  const hostMatch =
    site === "global"
      ? isGlobalHost(host)
      : site === "sound"
        ? isSoundHost(host)
        : site === "pronounce"
          ? isPronounceHost(host)
          : site === "worksheet"
            ? isWorksheetHost(host)
            : isJaHost(host);

  if (isStaticAsset(pathname)) {
    return taggedNext(request, site);
  }

  const goPath =
    pathname.startsWith("/go/") || pathname.startsWith(`${prefix}/go/`);
  if (goPath) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-kaja-site", site);
    if (sitePath) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}${pathname}`;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  if (sitePath) {
    return taggedNext(request, site);
  }

  if (!hostMatch) {
    return taggedNext(request, site);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? prefix : `${prefix}${pathname}`;
  return taggedRewrite(request, url, site);
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const soundHost = isSoundHost(host);
  const soundPath = pathname.startsWith("/sound-site");
  const pronounceHost = isPronounceHost(host);
  const pronouncePath = pathname.startsWith("/pronounce-site");
  const jaHost = isJaHost(host);
  const jaPath = pathname.startsWith("/ja-site");
  const globalHost = isGlobalHost(host);
  const globalPath = pathname.startsWith("/global-site");
  const worksheetHost = isWorksheetHost(host);
  const worksheetPath = pathname.startsWith("/worksheet-site");

  // Worksheet subdomain / dedicated deploy — before ja/global.
  if (isWorksheetSiteMode() || worksheetHost || worksheetPath) {
    return atlasMiddleware(request, "worksheet", "/worksheet-site");
  }

  // Pronounce (getpronounce.net) — own domain.
  if (pronounceHost || pronouncePath) {
    if (pronounceHost) {
      const redirect = pronouncePathRedirect(request);
      if (redirect) return withAtlasCdnCache(redirect);
    }
    return atlasMiddleware(request, "pronounce", "/pronounce-site");
  }

  // Sound first — subdomain of eigopin must not inherit ja rewrite.
  if (soundHost || soundPath) {
    return atlasMiddleware(request, "sound", "/sound-site");
  }

  if (jaHost || jaPath) {
    return atlasMiddleware(request, "ja", "/ja-site");
  }

  if (globalHost || globalPath) {
    if (globalHost && !globalPath) {
      return withAtlasCdnCache(globalToPronounceRedirect(request));
    }
    return atlasMiddleware(request, "global", "/global-site");
  }

  // Pinterest vocab → matching getpronounce chart only (never the /ko/ hub).
  if (
    pathname.startsWith("/vocab/") &&
    !isStaticAsset(pathname) &&
    !pathname.startsWith("/api")
  ) {
    const parts = pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    const key = parts.length >= 3 ? `${parts[1]}/${parts[2]}` : "";
    const pinId = key ? VOCAB_KO_PIN[key] : "";
    if (pinId) {
      const target = new URL(
        `/ko/pin/${encodeURIComponent(pinId)}`,
        PRONOUNCE_ORIGIN,
      );
      request.nextUrl.searchParams.forEach((v, k) => {
        target.searchParams.set(k, v);
      });
      const res = NextResponse.redirect(target, 301);
      res.headers.set("X-Robots-Tag", "noindex, nofollow, noimageindex");
      return res;
    }
    const res = withPublicHtmlCache(NextResponse.next());
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noimageindex");
    return res;
  }

  const res = NextResponse.next();
  // Main kajakorean.com (not atlas hosts above) — stop search indexing.
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noimageindex");
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
