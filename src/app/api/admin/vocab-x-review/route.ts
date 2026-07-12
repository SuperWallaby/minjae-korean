import type { NextRequest } from "next/server";

import { requireAdminKey } from "@/lib/adminAuth";
import {
  approveVocabXReview,
  rejectVocabXReview,
  reopenVocabXReview,
} from "@/lib/vocabXReviewActions";
import {
  countVocabXReviewByStatus,
  listVocabXReview,
  type VocabXReviewStatus,
} from "@/lib/vocabXReviewRepo";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) {
    return Response.json(
      { ok: false, error: auth.error },
      { status: auth.error === "Unauthorized" ? 401 : 500 },
    );
  }

  try {
    const statusParam = req.nextUrl.searchParams.get("status")?.trim();
    const status =
      statusParam === "pending" || statusParam === "approved" || statusParam === "rejected"
        ? (statusParam as VocabXReviewStatus)
        : undefined;
    const [items, counts] = await Promise.all([
      listVocabXReview(status),
      countVocabXReviewByStatus(),
    ]);
    return Response.json({ ok: true, data: { items, counts } });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdminKey(req);
  if (!auth.ok) {
    return Response.json(
      { ok: false, error: auth.error },
      { status: auth.error === "Unauthorized" ? 401 : 500 },
    );
  }

  try {
    const body = (await req.json()) as {
      action?: string;
      bundleId?: string;
    };
    const action = body.action?.trim();
    const bundleId = body.bundleId?.trim();
    if (!bundleId) {
      return Response.json({ ok: false, error: "bundleId required" }, { status: 400 });
    }

    if (action === "approve") {
      const result = await approveVocabXReview(bundleId);
      return Response.json({ ok: true, data: result });
    }
    if (action === "reject") {
      const item = await rejectVocabXReview(bundleId);
      return Response.json({ ok: true, data: { item } });
    }
    if (action === "reopen") {
      const item = await reopenVocabXReview(bundleId);
      return Response.json({ ok: true, data: { item } });
    }

    return Response.json(
      { ok: false, error: "action must be approve | reject | reopen" },
      { status: 400 },
    );
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
