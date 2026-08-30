import { NextResponse } from "next/server";

const BODY =
  "Impact-Site-Verification: cc2b504d-54d4-4877-ab51-01edce141c1b";

export function GET() {
  return new NextResponse(BODY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
