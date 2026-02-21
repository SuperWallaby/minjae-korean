"use client";

import { HelpCircle, MessageCircle } from "lucide-react";

import { Describe } from "@/components/article/Describe";

export type QuestionReplyPair = {
  question: string;
  reply: string;
};

type Props = {
  pairs: QuestionReplyPair[];
};

export function QuestionReplyBlock({ pairs }: Props) {
  if (pairs.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-5 py-8 space-y-8">
        {pairs.map((pair, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="flex mt-0.5  items-center justify-center w-6 h-6 bg-included-3 rounded-full">
                <HelpCircle
                  className="text-primary/90 h-4 w-4"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-base text-foreground leading-relaxed font-normal pt-0.5">
                <Describe>{pair.question}</Describe>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center mt-0.5 justify-center w-6 h-6 bg-included-2 rounded-full">
                <MessageCircle
                  className="text-primary/90  h-4 w-4"
                  strokeWidth={1.5}
                />
              </div>
              <span className="text-base text-foreground/90 leading-relaxed font-normal pt-0.5">
                <Describe>{pair.reply}</Describe>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
