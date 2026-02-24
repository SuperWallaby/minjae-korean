import { ImageResponse } from "next/og";
import {
  getChapterBySlug,
  grammarChapterList,
} from "@/data/grammarChapterList";

export const alt = "Korean Grammar chapter";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function GrammarOgImage({ params }: Props) {
  const { slug } = await params;
  const chapter = getChapterBySlug(grammarChapterList, slug);

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
          <span style={{ fontSize: 64, fontWeight: 700 }}>
            Korean Grammar
          </span>
        </div>
      ),
      { ...size }
    );
  }

  const title = chapter.title;
  const subtitle = "Korean Grammar";

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
