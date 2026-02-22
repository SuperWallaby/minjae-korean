import Image from "next/image";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/**
 * 인용/강조용 띠. 블로그 본문에서 문장을 감쌀 때 사용.
 */
export function Quoter({ children, className = "" }: Props) {
  return (
    <span
      className={`my-4  rounded-lg flex items-center gap-3 p-4 bg-included-2/30 text-included-2-foreground leading-relaxed  ${className}`}
    >
      <Image
        src="/pen-line.webp"
        width={40}
        height={40}
        alt=""
        className="w-10 opacity-80 -mt-0.5"
      />
      {children}
    </span>
  );
}
