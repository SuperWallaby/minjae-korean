import type {
  FundamentalChapterList,
  FundamentalChapterListItem,
} from "./fundamentalTypes";

export function getAllChapters(
  list: FundamentalChapterList,
): FundamentalChapterListItem[] {
  return list.sections.flatMap((s) => s.chapters);
}

export function getChapterBySlug(
  list: FundamentalChapterList,
  slug: string,
): FundamentalChapterListItem | null {
  for (const section of list.sections) {
    const ch = section.chapters.find((c) => c.slug === slug);
    if (ch) return ch;
  }
  return null;
}

export function getSectionDisplayTitleForChapter(
  list: FundamentalChapterList,
  chapterId: string,
): string {
  for (const section of list.sections) {
    if (section.chapters.some((c) => c.id === chapterId))
      return section.displayTitle;
  }
  return "";
}

export function getSectionAnchorForChapter(
  list: FundamentalChapterList,
  chapterId: string,
): string {
  for (const section of list.sections) {
    if (section.chapters.some((c) => c.id === chapterId))
      return section.anchor ?? section.filterKey ?? "";
  }
  return "";
}

function meta(sentences: number, quizzes: number, minutes: number) {
  return { sentences, minutes, quizzes };
}

export const fundamentalChapterList: FundamentalChapterList = {
  sections: [
    {
      title: "Hangeul",
      displayTitle: "Hangeul",
      anchor: "hangeul",
      chapters: [
        {
          id: "f1",
          slug: "hangeul-consonants-vowels",
          number: 1,
          title: "Consonants & Vowels",
          description: "Core consonants (ㄱㄴㄷ…) and vowels (ㅏㅓㅗㅜ…).",
          meta: meta(0, 0, 5),
        },
        {
          id: "f2",
          slug: "hangeul-syllable-building",
          number: 2,
          title: "Syllable Building",
          description: "Combining letters into blocks (가/나/다), reading rhythm.",
          meta: meta(0, 0, 5),
        },
        {
          id: "f3",
          slug: "hangeul-batchim-basics",
          number: 3,
          title: "Batchim Basics",
          description: "Final consonants (받침): ㄱㄴㄷㄹㅁㅂㅅㅇ.",
          meta: meta(0, 0, 5),
        },
      ],
    },
    {
      title: "Pronunciation",
      displayTitle: "Pronunciation",
      anchor: "pronunciation",
      chapters: [
        {
          id: "f4",
          slug: "pronunciation-minimal-pairs",
          number: 4,
          title: "Must-Distinguish Sounds",
          description: "Key pairs: ㄹ/ㄴ, ㅓ/ㅗ, ㅜ/ㅡ, ㅐ/ㅔ.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f5",
          slug: "pronunciation-common-sound-changes",
          number: 5,
          title: "Common Sound Changes",
          description: "Frequent changes: ㄴ/ㄹ interactions, batchim sound outcomes.",
          meta: meta(0, 0, 4),
        },
      ],
    },
    {
      title: "Numbers",
      displayTitle: "Numbers",
      anchor: "numbers",
      chapters: [
        {
          id: "f6",
          slug: "numbers-zero-to-ten",
          number: 6,
          title: "0–10",
          description: "Native vs Sino-Korean basics (둘/이, 하나/일…).",
          meta: meta(0, 0, 3),
        },
        {
          id: "f7",
          slug: "numbers-eleven-to-ninety-nine",
          number: 7,
          title: "Building 11–99",
          description: "십/이십… plus Native forms like 스물하나, 서른….",
          meta: meta(0, 0, 4),
        },
        {
          id: "f8",
          slug: "numbers-big-numbers-core",
          number: 8,
          title: "Big Number Essentials",
          description: "백/천/만, plus phone numbers and addresses.",
          meta: meta(0, 0, 5),
        },
      ],
    },
    {
      title: "Counters & Time",
      displayTitle: "Counters & Time",
      anchor: "counters-time",
      chapters: [
        {
          id: "f9",
          slug: "counters-top-ten",
          number: 9,
          title: "Top 10 Counters",
          description: "개/명/살/번/시/분/원/잔/마리/권.",
          meta: meta(0, 0, 5),
        },
        {
          id: "f10",
          slug: "time-telling-time",
          number: 10,
          title: "Telling Time",
          description: "Hours & minutes, a.m./p.m. patterns.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f11",
          slug: "date-weekdays-today-tomorrow-yesterday",
          number: 11,
          title: "Weekdays + Today/Tomorrow/Yesterday",
          description: "Days of the week, plus 오늘/내일/어제.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f12",
          slug: "date-months-and-dates",
          number: 12,
          title: "Months & Dates",
          description: "Reading 1월 3일, birthdays, date ranges.",
          meta: meta(0, 0, 5),
        },
      ],
    },
    {
      title: "Essential Words",
      displayTitle: "Essential Words",
      anchor: "essential-words",
      chapters: [
        {
          id: "f13",
          slug: "words-people-relationships",
          number: 13,
          title: "People & Relationships",
          description: "Core nouns: 나, 너, 친구, 선생님, 가족.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f14",
          slug: "words-places-core",
          number: 14,
          title: "Places",
          description: "집, 학교, 회사, 카페, 화장실, 여기/저기.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f15",
          slug: "words-directions-movement",
          number: 15,
          title: "Directions & Movement",
          description: "왼쪽/오른쪽, 앞/뒤, 위/아래, 쭉, 건너편.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f16",
          slug: "words-food-ordering",
          number: 16,
          title: "Food & Ordering",
          description: "물, 밥, 커피, 메뉴, 포장, 계산.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f17",
          slug: "words-daily-life",
          number: 17,
          title: "Daily Life",
          description: "핸드폰, 시간, 돈, 이름, 주소, 날짜.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f18",
          slug: "words-adjectives-mini-set",
          number: 18,
          title: "Mini Adjectives Set",
          description: "큰/작은, 좋은/나쁜, 빠른/느린, 뜨거운/차가운.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f19",
          slug: "words-with-numbers-reinforcement",
          number: 19,
          title: "With Numbers (Reinforcement)",
          description: "Reinforce: 사람/개/살/시/분/원, etc.",
          meta: meta(0, 0, 4),
        },
      ],
    },
    {
      title: "Reading",
      displayTitle: "Reading",
      anchor: "reading",
      chapters: [
        {
          id: "f20",
          slug: "reading-01-spacing-basics",
          number: 20,
          title: "Spacing Basics",
          description: "Common spacing patterns you’ll see: ~어요, ~입니다, ~주세요.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f21",
          slug: "reading-02-signs-menus",
          number: 21,
          title: "Signs & Menus",
          description: "Exit, restroom, open/closed, takeout, checkout: 출구/화장실/영업중/포장/계산.",
          meta: meta(0, 0, 5),
        },
        {
          id: "f22",
          slug: "reading-03-romanization-map",
          number: 22,
          title: "Romanization & Maps",
          description: "Matching Hangul ↔ romanized names on maps and stations.",
          meta: meta(0, 0, 4),
        },
      ],
    },
    {
      title: "Listening",
      displayTitle: "Listening",
      anchor: "listening",
      chapters: [
        {
          id: "f23",
          slug: "listening-01-number-hearing",
          number: 23,
          title: "Hearing Numbers",
          description: "Catch fast numbers in prices, times, phone digits.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f24",
          slug: "listening-02-restaurant-phrases",
          number: 24,
          title: "Restaurant Ear Training",
          description: "What you’ll hear: 주문, 포장, 여기서 드세요?, 계산 도와드릴까요?",
          meta: meta(0, 0, 4),
        },
        {
          id: "f25",
          slug: "listening-03-directions-phrases",
          number: 25,
          title: "Directions Ear Training",
          description: "What you’ll hear: 쭉 가세요, 오른쪽이에요, 건너편이에요.",
          meta: meta(0, 0, 4),
        },
      ],
    },
  ],
};
