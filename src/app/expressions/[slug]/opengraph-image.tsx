import { ImageResponse } from "next/og";
import { getExpressionChapterBySlug } from "@/data/expressionChapterList";

export const alt = "Korean Expressions chapter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ExpressionOgImage({ params }: Props) {
  const { slug } = await params;
  const chapter = getExpressionChapterBySlug(slug);

  // Kaja 톤: 따뜻한 베이지/샌드 (globals.css 토큰과 맞춤)
  const bgCanvas = "#f6f1e9";
  const bgCard = "#f0e9de";
  const textPrimary = "#2c2a25";
  const textMuted = "rgba(44, 42, 37, 0.7)";
  const accentSage = "#c3dad0";

  if (!chapter) {
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
            background: `linear-gradient(145deg, ${bgCanvas} 0%, ${bgCard} 50%, ${accentSage} 100%)`,
            color: textPrimary,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span style={{ fontSize: 64, fontWeight: 700 }}>Korean Expressions</span>
        </div>
      ),
      { ...size }
    );
  }

  const title = chapter.title;
  const subtitle = "Korean Expressions";

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
          background: `linear-gradient(145deg, ${bgCanvas} 0%, ${bgCard} 45%, ${accentSage} 100%)`,
          color: textPrimary,
          fontFamily: "system-ui, sans-serif",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 38,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: textMuted,
            marginBottom: 28,
          }}
        >
          {subtitle}
        </div>
        <h1
          style={{
            fontSize: 100,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.12,
            maxWidth: "92%",
            color: textPrimary,
          }}
        >
          {title}
        </h1>
        {chapter.description ? (
          <p
            style={{
              fontSize: 32,
              color: textMuted,
              marginTop: 36,
              textAlign: "center",
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            {chapter.description}
          </p>
        ) : null}
      </div>
    ),
    { ...size }
  );
}
