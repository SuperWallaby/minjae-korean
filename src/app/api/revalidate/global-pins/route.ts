import { timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { atlasLangPath, atlasPinPath } from "@/lib/atlasRoutes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function langFromPinId(id: string): string {
  const m = String(id || "")
    .trim()
    .match(/__([a-z]{2,8})$/i);
  return m ? m[1]!.toLowerCase() : "zh";
}

function secretOk(got: string, expected: string): boolean {
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  if (!a.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function nextPathsForPin(id: string, lang: string): string[] {
  const publicPath = atlasPinPath({ id, lang: lang || "zh" });
  const inner = `/pronounce-site${publicPath === "/" ? "" : publicPath}`;
  return [...new Set([publicPath, inner || "/pronounce-site"])];
}

function hubPaths(lang: string): string[] {
  const publicPath = atlasLangPath(lang);
  const inner =
    publicPath === "/"
      ? "/pronounce-site"
      : `/pronounce-site${publicPath.replace(/\/+$/, "")}`;
  return [...new Set([publicPath.replace(/\/+$/, "") || "/", inner])];
}

export async function POST(req: NextRequest) {
  const expected = process.env.KAJA_REVALIDATE_SECRET?.trim() || "";
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "unconfigured" },
      { status: 503 },
    );
  }
  const got =
    req.headers.get("x-revalidate-secret")?.trim() ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    "";
  if (!secretOk(got, expected)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: { ids?: unknown; langs?: unknown } = {};
  try {
    body = (await req.json()) as { ids?: unknown; langs?: unknown };
  } catch {
    body = {};
  }
  const ids = Array.isArray(body.ids)
    ? body.ids.map((s) => String(s).trim()).filter(Boolean).slice(0, 80)
    : [];
  const langs = [
    ...new Set(
      [
        ...(Array.isArray(body.langs)
          ? body.langs.map((s) => String(s).trim().toLowerCase())
          : []),
        ...ids.map((id) => langFromPinId(id)),
      ].filter(Boolean),
    ),
  ];

  revalidateTag("global-catalog");
  for (const lang of langs) {
    revalidateTag(`global-catalog-${lang}`);
  }

  const paths = new Set<string>();
  for (const id of ids) {
    for (const p of nextPathsForPin(id, langFromPinId(id))) paths.add(p);
  }
  for (const lang of langs) {
    for (const p of hubPaths(lang)) paths.add(p);
  }
  for (const p of paths) {
    revalidatePath(p);
  }

  return NextResponse.json({
    ok: true,
    tags: ["global-catalog", ...langs.map((l) => `global-catalog-${l}`)],
    paths: [...paths],
    pins: ids.length,
  });
}
