import { NextRequest } from "next/server";

import { getRecapById } from "@/lib/recapRepo";
import type { RecapLevel, RecapListItem } from "@/lib/recapRepo";

/** 공개용 리캡 — 이름/studentId 비공개, 누구나 조회 가능 */
export type RecapPublic = {
  id: string;
  bookingId?: string;
  level?: RecapLevel;
  expression: RecapListItem[];
  grammarPoint: RecapListItem[];
  vocabulary: RecapListItem[];
  mistake: RecapListItem[];
  pronounce: RecapListItem[];
  createdAt: string;
  updatedAt: string;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const recap = await getRecapById(id);
    if (!recap)
      return Response.json({ ok: false, error: "Not found" }, { status: 404 });

    const publicRecap: RecapPublic = {
      id: recap.id,
      bookingId: recap.bookingId,
      level: recap.level,
      expression: recap.expression,
      grammarPoint: recap.grammarPoint,
      vocabulary: recap.vocabulary,
      mistake: recap.mistake,
      pronounce: recap.pronounce,
      createdAt: recap.createdAt,
      updatedAt: recap.updatedAt,
    };
    return Response.json({ ok: true, data: publicRecap });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
