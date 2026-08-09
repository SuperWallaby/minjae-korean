import { NextRequest, NextResponse } from "next/server";
import { buildAffiliateDestination } from "@/lib/globalSite/affiliate";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lang = searchParams.get("lang") || undefined;
  const pin = searchParams.get("pin") || undefined;
  const url = buildAffiliateDestination({
    partner: "italki",
    lang,
    pinId: pin || undefined,
    campaign: "global-go-italki",
  });
  return NextResponse.redirect(url, 302);
}
