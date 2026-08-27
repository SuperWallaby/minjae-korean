"use client";

import type { GlobalPinExample, GlobalPinWord } from "@/lib/globalSite/catalog";
import { GlobalPinWordList } from "@/components/global-site/GlobalPinWordList";
import { GlobalPinExampleList } from "@/components/global-site/GlobalPinExampleList";

type Props = {
  lang: string;
  langName: string;
  words: GlobalPinWord[];
  examples: GlobalPinExample[];
};

/** @deprecated Prefer GlobalPinWordList + GlobalPinExampleList for layout control. */
export function GlobalPinGlossarySection({
  lang,
  langName,
  words,
  examples,
}: Props) {
  return (
    <>
      <GlobalPinWordList lang={lang} langName={langName} words={words} />
      <GlobalPinExampleList
        lang={lang}
        langName={langName}
        examples={examples}
      />
    </>
  );
}
