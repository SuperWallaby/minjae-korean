import * as fs from "fs/promises";
import * as path from "path";

import type { BlogImageOverrides } from "@/data/blogPosts/types";

export const runtime = "nodejs";
const OVERRIDES_PATH = path.join(process.cwd(), "blog-overrides.json");

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

export async function GET() {
  if (!devOnly()) {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf-8");
    const data = JSON.parse(raw) as Record<string, BlogImageOverrides>;
    return new Response(
      JSON.stringify({ ok: true, data: data && typeof data === "object" ? data : {} }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch {
    return new Response(JSON.stringify({ ok: true, data: {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req: Request) {
  if (!devOnly()) {
    return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const body = (await req.json().catch(() => null)) as {
      slug?: string;
      overrides?: BlogImageOverrides;
    };
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    const overrides = body?.overrides;
    if (!slug) {
      return new Response(JSON.stringify({ ok: false, error: "Missing slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    let all: Record<string, BlogImageOverrides> = {};
    try {
      const raw = await fs.readFile(OVERRIDES_PATH, "utf-8");
      all = (JSON.parse(raw) as Record<string, BlogImageOverrides>) ?? {};
    } catch {
      // file not found or invalid
    }
    if (overrides && typeof overrides === "object") {
      all[slug] = overrides;
    } else {
      delete all[slug];
    }
    await fs.writeFile(OVERRIDES_PATH, JSON.stringify(all, null, 2), "utf-8");
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
