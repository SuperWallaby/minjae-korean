export const BOOK_TOC_SUBTITLE =
  "for Translated Korean vs. Real Korean / 100 Korean Words That Don’t Mean What You Think";

export type BookTocPart = {
  id: string;
  title: string;
  /** Short English gloss for the part (below the title). */
  intro: string;
  /** Korean lemmas in order (numbers shown in UI). */
  words: string[];
};

export const BOOK_TOC_PARTS: BookTocPart[] = [
  {
    id: "part-1",
    title: "Part 1. The Small Words That Change Everything",
    intro:
      "The essentials that should come first. Tiny words that look easy—which makes them even riskier.",
    words: [
      "좀",
      "하필",
      "그냥",
      "괜히",
      "혹시",
      "일단",
      "그러니까",
      "약간",
      "살짝",
      "별로",
      "딱히",
      "굳이",
      "은근",
      "되게",
      "차라리",
      "막상",
      "왠지",
      "도대체",
      "참",
      "하긴",
    ],
  },
  {
    id: "part-2",
    title: "Part 2. Politeness Traps",
    intro:
      "Requests, politeness, and tone traps that English-speaking learners often misread.",
    words: [
      "주세요",
      "부탁드려요",
      "혹시 괜찮으시면",
      "주실래요?",
      "불편하시면",
      "실례지만",
      "부탁 좀 드려도 될까요?",
      "가능하실까요?",
      "괜찮아요",
      "괜찮아요?",
    ],
  },
  {
    id: "part-3",
    title: "Part 3. Korean Words English Flattens Too Much",
    intro:
      "Words whose nuance collapses when you force them into a one-line English gloss.",
    words: [
      "갑갑하다",
      "답답하다",
      "애매하다",
      "부담스럽다",
      "민망하다",
      "서운하다",
      "아쉽다",
      "속상하다",
      "어색하다",
      "서먹하다",
      "시원하다",
      "아깝다",
      "귀찮다",
      "허전하다",
      "울컥하다",
      "편하다",
      "불편하다",
      "억울하다",
      "찝찝하다",
      "다행이다",
    ],
  },
  {
    id: "part-4",
    title: "Part 4. Social Korean",
    intro:
      "Relationship, vibe, 눈치, 정, and other social Korean that English-speaking learners often miss.",
    words: [
      "눈치",
      "정",
      "정들다",
      "티 나다",
      "챙기다",
      "참다",
      "버티다",
      "끼어들다",
      "빠지다",
      "말 걸다",
    ],
  },
  {
    id: "part-5",
    title: "Part 5. Reaction Korean",
    intro:
      "Short reactions that pack far more than a literal translation suggests.",
    words: [
      "그렇죠",
      "그러게요",
      "그렇구나",
      "그렇네요",
      "맞네요",
      "설마",
      "그랬구나",
      "맞죠?",
      "아닌 것 같아요",
      "그럴 수도 있죠",
    ],
  },
  {
    id: "part-6",
    title: "Part 6. Soft No, Delayed No, Korean No",
    intro:
      "Ways Korean declines or delays without saying “no” in so many words.",
    words: [
      "한번 볼게요",
      "생각해볼게요",
      "어려울 것 같아요",
      "다음에요",
      "나중에요",
      "아직이요",
      "지금은 좀",
      "좀 그렇네요",
      "아무래도",
      "거의 다 됐어요",
    ],
  },
  {
    id: "part-7",
    title: "Part 7. Everyday Korean, More Than It Looks Like",
    intro:
      "Everyday lines that look simple but carry timing, relationship, and social air.",
    words: [
      "밥 먹었어요?",
      "다녀오겠습니다",
      "다녀왔습니다",
      "들어가세요",
      "웬일이야?",
      "무슨",
      "왜 이렇게",
      "먼저 가볼게요",
      "수고하세요",
      "수고하셨습니다",
      "안 괜찮다",
      "아닌데",
      "많이 드세요",
      "드실래요?",
      "어디 가요?",
      "먼저 먹을게요",
      "별일 없어요?",
      "금방 갈게요",
      "다 왔어요",
      "가고 있어요",
    ],
  },
];

/** 1-based index offset before each part (Part 1 starts at 1). */
export function wordNumberForPart(partIndex: number, wordIndex: number): number {
  let base = 1;
  for (let i = 0; i < partIndex; i++) {
    base += BOOK_TOC_PARTS[i].words.length;
  }
  return base + wordIndex;
}

export const BOOK_SELECTION_CRITERIA_INTRO =
  "Here’s the standard we used.";

export const BOOK_SELECTION_CRITERIA = [
  "English-speaking learners often misunderstand these, and the best picks are words that look so easy you assume you already know them.",
  "A one-to-one English gloss does not hold the feeling; dictionary translation alone should not be enough.",
  "Tiny words that still change the air of a sentence—like 좀, 그냥, 괜히.",
  "The gap between translated Korean and real Korean should feel obvious.",
  "A short explanation should land as “oh, that’s what it was.”",
  "Likely to show up in real life for learners—not so rare that you will never hear them.",
  "Shows tone, relationship, and social air—not grammar labels only.",
  "No overlap: similar items merge; each of the 100 entries needs its own clear card.",
] as const;
