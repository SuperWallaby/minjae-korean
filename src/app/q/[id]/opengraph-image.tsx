import { ImageResponse } from "next/og";

import { findKoreanQuizById } from "@/lib/koreanQuiz/store";

export const alt = "Shared Korean quiz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SharedQuizOgImage({ params }: Props) {
  const { id } = await params;
  const item = await findKoreanQuizById(id);
  const approved = item?.status === "approved" ? item : null;
  const gloss =
    approved?.illustrationEnglish?.trim() ||
    approved?.choices.find((choice) => choice.id === approved.correctChoiceId)
      ?.english?.trim() ||
    "Korean quiz";
  const imageUrl = approved?.imageUrl?.trim();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          background: "linear-gradient(145deg, #f5f7fb 0%, #e8eef8 55%, #d7e6f7 100%)",
          color: "#1d1d1f",
          fontFamily: "system-ui, sans-serif",
          padding: 64,
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            width={360}
            height={360}
            style={{
              width: 360,
              height: 360,
              objectFit: "cover",
              borderRadius: 32,
              border: "4px solid #fff",
              boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 520,
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#0066cc",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Kaja Korean
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.15 }}>
            What is this?
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#6e6e73" }}>
            {gloss}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
