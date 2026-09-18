import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Lesson prices" },
  description:
    "1:1 Korean with Minjae. $8 per 30-minute session, less when you buy more. First trial is free.",
};

export default function KoreanLessonsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
