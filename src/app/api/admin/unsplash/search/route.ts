export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

export async function GET(req: Request) {
  try {
    if (!devOnly()) {
      return new Response(JSON.stringify({ ok: false, error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) {
      return new Response(
        JSON.stringify({ ok: false, error: "UNSPLASH_ACCESS_KEY not set" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const u = new URL(req.url);
    const q = u.searchParams.get("q")?.trim() || "";
    if (!q) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing q" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=12`,
      {
        headers: {
          Authorization: `Client-ID ${key}`,
          "Accept-Version": "v1",
        },
      },
    );
    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ ok: false, error: text || "Unsplash API error" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const data = (await res.json()) as {
      results?: Array<{
        id: string;
        urls?: { raw?: string; full?: string; regular?: string; small?: string; thumb?: string };
      }>;
    };
    const results = (data.results ?? []).map((r) => ({
      id: r.id,
      url: r.urls?.small || r.urls?.thumb || r.urls?.regular || "",
      thumb: r.urls?.thumb || r.urls?.small || "",
    }));

    return new Response(
      JSON.stringify({ ok: true, results }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
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
