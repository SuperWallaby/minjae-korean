import type { NextRequest } from "next/server";

import { requireAdminKey } from "@/lib/adminAuth";
import {
  bumpGrammarXQueueItem,
  cancelGrammarXQueueItem,
  enqueueGrammarXComparison,
  enqueueGrammarXManual,
} from "@/lib/grammarXQueueRepo";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.error }, { status: auth.error === "Unauthorized" ? 401 : 500 });
  }

  try {
    const json = (await req.json()) as Record<string, unknown>;
    const kind = String(json.kind ?? "").trim();

    if (kind === "comparison") {
      const comparisonId = Number(json.comparisonId);
      if (!Number.isFinite(comparisonId) || comparisonId <= 0) {
        return Response.json({ ok: false, error: "Invalid comparisonId" }, { status: 400 });
      }
      const item = await enqueueGrammarXComparison({
        comparisonId,
        note: typeof json.note === "string" ? json.note : undefined,
      });
      return Response.json({ ok: true, item });
    }

    if (kind === "manual") {
      const tweetText = String(json.tweetText ?? "").trim();
      const imageUrl = String(json.imageUrl ?? "").trim();
      const imageAlt = String(json.imageAlt ?? "").trim();
      if (!tweetText || tweetText.length > 280) {
        return Response.json({ ok: false, error: "tweetText required (max 280)" }, { status: 400 });
      }
      if (!imageUrl) {
        return Response.json({ ok: false, error: "imageUrl required" }, { status: 400 });
      }
      if (!imageAlt) {
        return Response.json({ ok: false, error: "imageAlt required" }, { status: 400 });
      }
      const item = await enqueueGrammarXManual({
        tweetText,
        imageUrl,
        imageAlt,
        note: typeof json.note === "string" ? json.note : undefined,
      });
      return Response.json({ ok: true, item });
    }

    return Response.json({ ok: false, error: "kind must be comparison or manual" }, { status: 400 });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) {
    return Response.json({ ok: false, error: auth.error }, { status: auth.error === "Unauthorized" ? 401 : 500 });
  }

  try {
    const json = (await req.json()) as { id?: string; action?: string };
    const id = json.id?.trim();
    if (!id) return Response.json({ ok: false, error: "Missing id" }, { status: 400 });

    if (json.action === "bump") {
      const item = await bumpGrammarXQueueItem(id);
      if (!item) return Response.json({ ok: false, error: "Queue item not found" }, { status: 404 });
      return Response.json({ ok: true, item });
    }

    if (json.action === "cancel") {
      const ok = await cancelGrammarXQueueItem(id);
      if (!ok) return Response.json({ ok: false, error: "Queue item not found" }, { status: 404 });
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 400 },
    );
  }
}
