import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function getOverridesPath(): string {
  return join(process.cwd(), "src", "data", "examsItemAudioOverrides.json");
}

export async function GET() {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const path = getOverridesPath();
    const raw = await readFile(path, "utf-8");
    const data = JSON.parse(raw) as Record<string, string>;
    return new Response(JSON.stringify({ ok: true, overrides: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const body = await req.json().catch(() => null);
    const overrides = body?.overrides;
    if (!overrides || typeof overrides !== "object") {
      return new Response(
        JSON.stringify({ ok: false, error: "overrides object required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(overrides)) {
      if (typeof k === "string" && (typeof v === "string" || v == null)) {
        normalized[k] = v == null ? "" : String(v).trim();
      }
    }
    const path = getOverridesPath();
    await writeFile(path, JSON.stringify(normalized, null, 2) + "\n", "utf-8");
    return new Response(JSON.stringify({ ok: true, overrides: normalized }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
