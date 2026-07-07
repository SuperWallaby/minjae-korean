import {
  formatGrammarRomanizationParenthetical,
  romanizeGrammarSentence,
} from "@/lib/grammarRomanization";
import { cn } from "@/lib/utils";

type WordProps = {
  word: string;
  koreanClassName?: string;
  romanClassName?: string;
  block?: boolean;
};

/** Korean headword + (romanization) for grammar comparison pages. */
export function GrammarKoreanWithRomanization({
  word,
  koreanClassName,
  romanClassName,
  block = false,
}: WordProps) {
  const rom = formatGrammarRomanizationParenthetical(word);
  const Wrapper = block ? "div" : "span";

  return (
    <Wrapper className={block ? "space-y-1" : undefined}>
      <span className={koreanClassName}>{word}</span>
      {rom ? (
        <span
          className={cn(
            block ? "block" : "ml-1.5",
            romanClassName ??
              "text-[0.85em] font-normal not-italic text-[var(--quiz-text-muted)]",
          )}
        >
          ({rom})
        </span>
      ) : null}
    </Wrapper>
  );
}

type SentenceProps = {
  sentence: string;
  className?: string;
};

/** Korean example line + romanization underneath. */
export function GrammarSentenceWithRomanization({
  sentence,
  className,
}: SentenceProps) {
  const rom = romanizeGrammarSentence(sentence);
  if (!rom) {
    return <p className={className}>{sentence}</p>;
  }

  return (
    <div className="space-y-1">
      <p className={className}>{sentence}</p>
      <p className="text-xs leading-relaxed text-[var(--quiz-text-muted)]">{rom}</p>
    </div>
  );
}
