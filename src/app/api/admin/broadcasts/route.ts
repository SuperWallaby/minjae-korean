import { NextRequest } from "next/server";

import { createBroadcastWithReceipts } from "@/lib/broadcastsRepo";
import {
  listMemberPushSubscriptionsForAuthUserIds,
  sendMemberPushPayload,
} from "@/lib/memberPushRepo";
import {
  listAuthUserIdsForStudentIds,
  listStudentIdsByBroadcastFilter,
  type BroadcastAccountFilter,
} from "@/lib/studentsRepo";

export const runtime = "nodejs";

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isFilter(v: unknown): v is BroadcastAccountFilter {
  return v === "all" || v === "linked" || v === "unlinked" || v === "active_credits";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json(400, { ok: false, error: "Invalid body" });

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const text = typeof body.body === "string" ? body.body.trim() : "";
    const accountFilter = body.accountFilter;
    const sendSite = Boolean(body.sendSite);
    const sendPush = Boolean(body.sendPush);

    if (!title || !text) return json(400, { ok: false, error: "title and body required" });
    if (!isFilter(accountFilter)) return json(400, { ok: false, error: "Invalid accountFilter" });
    if (!sendSite && !sendPush) return json(400, { ok: false, error: "Choose at least one channel" });

    const studentIds = await listStudentIdsByBroadcastFilter(accountFilter, 10_000);
    if (studentIds.length === 0) {
      return json(200, {
        ok: true,
        data: {
          recipientCount: 0,
          siteReceiptCount: 0,
          pushDelivered: 0,
          broadcastId: null,
          message: "No recipients for this filter.",
        },
      });
    }

    let pushDelivered = 0;
    if (sendPush) {
      const authIds = await listAuthUserIdsForStudentIds(studentIds);
      const subs = await listMemberPushSubscriptionsForAuthUserIds(authIds);
      const openUrl = "/account#alerts";
      pushDelivered = await sendMemberPushPayload(subs, {
        title,
        body: text.length > 140 ? `${text.slice(0, 137)}…` : text,
        url: openUrl,
      });
    }

    const { broadcastId, receiptCount } = await createBroadcastWithReceipts({
      title,
      body: text,
      accountFilter,
      channels: { site: sendSite, push: sendPush },
      studentIds,
      pushDelivered,
    });

    return json(200, {
      ok: true,
      data: {
        broadcastId,
        recipientCount: studentIds.length,
        siteReceiptCount: receiptCount,
        pushDelivered,
      },
    });
  } catch (e) {
    return json(500, { ok: false, error: e instanceof Error ? e.message : String(e) });
  }
}
