/**
 * Blog post shape — paragraphs only (no vocabulary / questions / discussion).
 * You edit content via JSON/TS/TSX files in content/.
 * content는 ReactNode라서 <strong>, <br /> 등 JSX 사용 가능.
 */

import type { ReactNode } from "react";

export type ReadingLevel = 1 | 2 | 3 | 4 | 5;

export type BlogParagraphBlock = {
  image?: string;
  subtitle: string;
  content: ReactNode;
};

export type BlogPost = {
  slug: string;
  title: string;
  level?: ReadingLevel;
  imageThumb?: string;
  imageLarge?: string;
  audio?: string;
  paragraphs: BlogParagraphBlock[];
  noImageIndex?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogPostCard = Pick<
  BlogPost,
  "slug" | "title" | "imageThumb" | "imageLarge" | "level" | "createdAt"
>;

/** 개발 모드에서 업로드한 이미지 오버라이드 (썸네일·문단 이미지) */
export type BlogImageOverrides = {
  imageThumb?: string;
  imageLarge?: string;
  /** 문단별 이미지 URL (인덱스 = paragraph index) */
  paragraphImages?: (string | null)[];
};
