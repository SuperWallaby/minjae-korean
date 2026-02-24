"use client";

import * as React from "react";
import { Describe } from "@/components/article/Describe";

/**
 * 한글이 포함된 구간을 찾아 <Describe>로 감싼 React 노드 배열을 반환.
 * 문법 챕터 등에서 한국어 문장을 클릭 시 설명/번역을 보여주기 위함.
 */
function segmentByKorean(text: string): Array<{ type: "korean" | "other"; text: string }> {
  const parts: Array<{ type: "korean" | "other"; text: string }> = [];
  // 한글로 시작하는 구간(한글 + 이어지는 한글/공백/문장부호) 매칭
  const re = /[가-힣][가-힣\s.,?!]*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: "other", text: text.slice(last, match.index) });
    }
    parts.push({ type: "korean", text: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ type: "other", text: text.slice(last) });
  }
  return parts.length > 0 ? parts : [{ type: "other", text }];
}

type Props = { text: string; className?: string };

export function DescribeKorean({ text, className = "" }: Props) {
  const segments = React.useMemo(() => segmentByKorean(text), [text]);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "korean" ? (
          <Describe key={i}>{seg.text}</Describe>
        ) : (
          <React.Fragment key={i}>{seg.text}</React.Fragment>
        ),
      )}
    </span>
  );
}
