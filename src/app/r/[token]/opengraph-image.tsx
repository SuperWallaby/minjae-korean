import { ImageResponse } from "next/og";

import {
  decodeShareResultToken,
  shareResultSupportiveLine,
} from "@/lib/koreanQuiz/shareResultToken";

export const alt = "Kaja Korean set result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function SharedResultOgImage({ params }: Props) {
  const { token } = await params;
  const payload = decodeShareResultToken(token);
  const correct = payload?.c ?? 0;
  const total = payload?.t ?? 7;
  const line = payload
    ? shareResultSupportiveLine(correct, total)
    : "Set complete";
  const perfect = correct >= total && total > 0;
  const scoreColor = perfect ? "#248a3d" : "#0066cc";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: perfect
            ? "linear-gradient(145deg, #f3fbf5 0%, #e8f8ed 50%, #d7f0e0 100%)"
            : "linear-gradient(145deg, #f5f7fb 0%, #e8eef8 55%, #d7e6f7 100%)",
          color: "#1d1d1f",
          fontFamily: "system-ui, sans-serif",
          padding: 64,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: scoreColor,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          Kaja Korean · Set complete
        </div>
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            lineHeight: 1,
            color: scoreColor,
            letterSpacing: "-0.04em",
          }}
        >
          {correct}/{total}
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 44,
            fontWeight: 700,
            color: "#3a3a3c",
          }}
        >
          {line}
        </div>
        {payload?.d != null && payload.d > 0 ? (
          <div
            style={{
              marginTop: 18,
              fontSize: 28,
              fontWeight: 600,
              color: "#6e6e73",
            }}
          >
            Day streak {payload.d}
          </div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
