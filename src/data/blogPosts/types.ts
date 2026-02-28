/**
 * Blog post shape — paragraphs only (no vocabulary / questions / discussion).
 * You edit content via JSON/TS/TSX files in content/.
 * content는 ReactNode라서 <strong>, <br /> 등 JSX 사용 가능.
 *
 * content/ 에서 쓰는 컴포넌트:
 * - Gap — @/components/article/Gap — 문단 사이 여백 (더블 <br /> 대신)
 * - ContentLink — @/components/article/ContentLink — 본문용 링크 (밑줄·색상으로 링크처럼 보임)
 * - <strong>, <br /> — 그냥 JSX
 */

import type { ReactNode } from "react";

export type ReadingLevel = 1 | 2 | 3 | 4 | 5;

export type BlogParagraphBlock = {
  image?: string;
  subtitle: string;
  content: ReactNode;
  /** YouTube URL or video ID — rendered as embed between paragraphs */
  youtube?: string;
  /** Optional audio URL for this paragraph (e.g. phrase pronunciation) */
  audio?: string;
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
> & {
  /** 목록 상단 고정 (overrides에서 설정) */
  pinned?: boolean;
};

/** 개발 모드에서 업로드한 이미지 오버라이드 (썸네일·문단 이미지) + 핀 */
export type BlogImageOverrides = {
  imageThumb?: string;
  imageLarge?: string;
  /** 문단별 이미지 URL (인덱스 = paragraph index) */
  paragraphImages?: (string | null)[];
  /** 목록 상단 고정 (풀기 전까지 맨 위 노출) */
  pinned?: boolean;
};
