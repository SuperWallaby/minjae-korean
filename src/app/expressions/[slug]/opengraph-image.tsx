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
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            color: "#e2e8f0",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span style={{ fontSize: 48 }}>Korean Expressions</span>
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
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "rgba(226, 232, 240, 0.8)",
            marginBottom: 24,
          }}
        >
          {subtitle}
        </div>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.15,
            maxWidth: "90%",
          }}
        >
          {title}
        </h1>
        {chapter.description ? (
          <p
            style={{
              fontSize: 24,
              color: "rgba(226, 232, 240, 0.85)",
              marginTop: 32,
              textAlign: "center",
              maxWidth: 800,
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
