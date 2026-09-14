import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Phone Call Korean Lesson" },
  description:
    "Learn Korean with Minjae over the phone. First lesson is a free trial.",
};

export default function FreeKoreanClassLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
