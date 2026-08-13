import { NextRequest, NextResponse } from "next/server";

const GLOBAL_HOSTS = new Set([
  "global.kajakorean.com",
  "global.localhost",
  "global.localhost:3000",
  "global.127.0.0.1",
  "global.127.0.0.1:3000",
]);

/** Edge-cache HTML for the public atlas (browser can still revalidate). */
const GLOBAL_HTML_CACHE =
  "public, s-maxage=3600, stale-while-revalidate=86400";

function isGlobalHost(host: string): boolean {
  const h = host.split(":")[0]?.toLowerCase() || "";
  if (GLOBAL_HOSTS.has(host.toLowerCase()) || GLOBAL_HOSTS.has(h)) return true;
  if (h.startsWith("global.")) return true;
  return false;
}

function withGlobalCdnCache(res: NextResponse) {
  res.headers.set("CDN-Cache-Control", GLOBAL_HTML_CACHE);
  res.headers.set("Vercel-CDN-Cache-Control", GLOBAL_HTML_CACHE);
  return res;
}

function nextAsGlobal(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kaja-site", "global");
  return withGlobalCdnCache(
    NextResponse.next({
      request: { headers: requestHeaders },
    }),
  );
}

function rewriteAsGlobal(request: NextRequest, url: URL) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kaja-site", "global");
  return withGlobalCdnCache(
    NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    }),
  );
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;
  const globalHost = isGlobalHost(host);
  const globalPath = pathname.startsWith("/global-site");

  if (!globalHost && !globalPath) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/global/") ||
    pathname.startsWith("/favicon") ||
    pathname.match(
      /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|mp3|woff2?)$/i,
    )
  ) {
    return globalHost || globalPath ? nextAsGlobal(request) : NextResponse.next();
  }

  // Affiliate hops must not be CDN-cached.
  if (pathname.startsWith("/go/") || pathname.startsWith("/global-site/go/")) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-kaja-site", "global");
    if (globalPath) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    const url = request.nextUrl.clone();
    url.pathname = `/global-site${pathname}`;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  if (globalPath) {
    return nextAsGlobal(request);
  }

  // Host rewrite: global.kajakorean.com/* → /global-site/*
  // Includes /sitemap.xml and /robots.txt for SEO.
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/global-site" : `/global-site${pathname}`;
  return rewriteAsGlobal(request, url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
