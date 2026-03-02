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
        {
          id: "t1",
          slug: "test-hangeul-01",
          number: 4,
          title: "Test: Hangeul (Reading)",
          description: "Letters and number reading quiz.",
          meta: meta(0, 4, 2),
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
          number: 5,
          title: "Must-Distinguish Sounds",
          description: "Key pairs: ㄹ/ㄴ, ㅓ/ㅗ, ㅜ/ㅡ, ㅐ/ㅔ.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f5",
          slug: "pronunciation-common-sound-changes",
          number: 6,
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
          number: 7,
          title: "0–10",
          description: "Native vs Sino-Korean basics (둘/이, 하나/일…).",
          meta: meta(0, 0, 3),
        },
        {
          id: "f7",
          slug: "numbers-eleven-to-ninety-nine",
          number: 8,
          title: "Building 11–99",
          description: "십/이십… plus Native forms like 스물하나, 서른….",
          meta: meta(0, 0, 4),
        },
        {
          id: "f8",
          slug: "numbers-big-numbers-core",
          number: 9,
          title: "Big Number Essentials",
          description: "백/천/만, plus phone numbers and addresses.",
          meta: meta(0, 0, 5),
        },
        {
          id: "t2",
          slug: "test-numbers-01",
          number: 10,
          title: "Test: Numbers",
          description: "0–10, Native/Sino number quiz.",
          meta: meta(0, 6, 2),
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
          number: 11,
          title: "Top 10 Counters",
          description: "개/명/살/번/시/분/원/잔/마리/권.",
          meta: meta(0, 0, 5),
        },
        {
          id: "f10",
          slug: "time-telling-time",
          number: 12,
          title: "Telling Time",
          description: "Hours & minutes, a.m./p.m. patterns.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f11",
          slug: "date-weekdays-today-tomorrow-yesterday",
          number: 13,
          title: "Weekdays + Today/Tomorrow/Yesterday",
          description: "Days of the week, plus 오늘/내일/어제.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f12",
          slug: "date-months-and-dates",
          number: 14,
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
          number: 15,
          title: "People & Relationships",
          description: "Core nouns: 나, 너, 친구, 선생님, 가족.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f14",
          slug: "words-places-core",
          number: 16,
          title: "Places",
          description: "집, 학교, 회사, 카페, 화장실, 여기/저기.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f15",
          slug: "words-directions-movement",
          number: 17,
          title: "Directions & Movement",
          description: "왼쪽/오른쪽, 앞/뒤, 위/아래, 쭉, 건너편.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f16",
          slug: "words-food-ordering",
          number: 18,
          title: "Food & Ordering",
          description: "물, 밥, 커피, 메뉴, 포장, 계산.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f17",
          slug: "words-daily-life",
          number: 19,
          title: "Daily Life",
          description: "핸드폰, 시간, 돈, 이름, 주소, 날짜.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f18",
          slug: "words-adjectives-mini-set",
          number: 20,
          title: "Mini Adjectives Set",
          description: "큰/작은, 좋은/나쁜, 빠른/느린, 뜨거운/차가운.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f19",
          slug: "words-with-numbers-reinforcement",
          number: 21,
          title: "With Numbers (Reinforcement)",
          description: "Reinforce: 사람/개/살/시/분/원, etc.",
          meta: meta(0, 0, 4),
        },
        {
          id: "t3",
          slug: "test-words-01",
          number: 22,
          title: "Test: Essential Words",
          description: "I, you, friend, house, water, today, etc.",
          meta: meta(0, 10, 3),
        },
      ],
    },
    {
      title: "Core Grammar",
      displayTitle: "Core Grammar",
      anchor: "core-grammar",
      chapters: [
        {
          id: "f26",
          slug: "verbs-01-why-verbs-change",
          number: 23,
          title: "Why Verbs Change",
          description:
            "Korean builds meaning with endings: stem + ending (먹- + 어요). Politeness, tense, mood live in endings.",
          meta: meta(0, 0, 6),
        },
        {
          id: "f27",
          slug: "particles-01-what-they-are",
          number: 24,
          title: "Particles (조사): What They Do",
          description:
            "Particles mark roles: 은/는, 이/가, 을/를, 에/에서. They help meaning stay clear even when word order shifts.",
          meta: meta(0, 0, 6),
        },
        {
          id: "f28",
          slug: "subject-dropping-01-context-first",
          number: 25,
          title: "Dropping the Subject",
          description:
            "Subjects are often omitted when obvious. Korean is context-driven: 말 안 해도 되면 보통 생략해요.",
          meta: meta(0, 0, 5),
        },
        {
          id: "t4",
          slug: "test-core-grammar-01",
          number: 26,
          title: "Test: Core Grammar",
          description: "Verbs, particles, subject dropping quiz.",
          meta: meta(0, 5, 2),
        },
      ],
    },
    {
      title: "Sentence Building",
      displayTitle: "Sentence Building",
      anchor: "sentence-building",
      chapters: [
        {
          id: "f29",
          slug: "verbs-02-starter-pack",
          number: 27,
          title: "Verbs Starter Pack",
          description: "Top everyday verbs: 하다/가다/오다/먹다/마시다/보다/있다…",
          meta: meta(0, 0, 5),
        },
        {
          id: "f30",
          slug: "sentences-01-basic-patterns",
          number: 28,
          title: "Basic Sentence Patterns",
          description: "Templates: 저는 N(을/를) V-아요/어요, N이/가 N이에요/예요.",
          meta: meta(0, 0, 6),
        },
        {
          id: "t5",
          slug: "test-sentence-building-01",
          number: 29,
          title: "Test: Sentence Building",
          description: "Basic patterns, particles, common verbs quiz.",
          meta: meta(0, 6, 2),
        },
      ],
    },
  ],
};
