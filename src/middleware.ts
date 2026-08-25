import { NextRequest, NextResponse } from "next/server";

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

type AtlasSite = "global" | "ja" | "sound";

/** Edge-cache HTML for the public atlas (browser can still revalidate). */
const ATLAS_HTML_CACHE =
  "public, s-maxage=3600, stale-while-revalidate=86400";

function hostname(host: string): string {
  return host.split(":")[0]?.toLowerCase() || "";
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

function withAtlasCdnCache(res: NextResponse) {
  res.headers.set("CDN-Cache-Control", ATLAS_HTML_CACHE);
  res.headers.set("Vercel-CDN-Cache-Control", ATLAS_HTML_CACHE);
  return res;
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
    pathname.startsWith("/favicon") ||
    Boolean(
      pathname.match(
        /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|mp3|woff2?)$/i,
      ),
    )
  );
}

function atlasMiddleware(
  request: NextRequest,
  site: AtlasSite,
  prefix: "/global-site" | "/ja-site" | "/sound-site",
) {
  const { pathname } = request.nextUrl;
  const sitePath = pathname.startsWith(prefix);
  const host = request.headers.get("host") || "";
  const hostMatch =
    site === "global"
      ? isGlobalHost(host)
      : site === "sound"
        ? isSoundHost(host)
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
  const jaHost = isJaHost(host);
  const jaPath = pathname.startsWith("/ja-site");
  const globalHost = isGlobalHost(host);
  const globalPath = pathname.startsWith("/global-site");

  // Sound first — subdomain of eigopin must not inherit ja rewrite.
  if (soundHost || soundPath) {
    return atlasMiddleware(request, "sound", "/sound-site");
  }

  if (jaHost || jaPath) {
    return atlasMiddleware(request, "ja", "/ja-site");
  }

  if (globalHost || globalPath) {
    return atlasMiddleware(request, "global", "/global-site");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
