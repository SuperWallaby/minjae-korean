import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "1:1 Korean Lesson" },
  description: "Free trial Korean lesson with Minjae.",
};

export default function FreeKoreanClassLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
