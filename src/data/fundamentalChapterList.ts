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
          slug: "hangul-01",
          number: 1,
          title: "한글 01 — 자음/모음",
          description: "Consonants (ㄱㄴㄷ…) and vowels (ㅏㅓㅗㅜ…).",
          meta: meta(0, 0, 5),
        },
        {
          id: "f2",
          slug: "hangul-02",
          number: 2,
          title: "한글 02 — 글자 조합",
          description: "Building syllables (가/나/다), reading rhythm.",
          meta: meta(0, 0, 5),
        },
        {
          id: "f3",
          slug: "hangul-03",
          number: 3,
          title: "한글 03 — 받침 입문",
          description: "Final consonants (ㄱㄴㄷㄹㅁㅂㅅㅇ).",
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
          slug: "pronunciation-01",
          number: 4,
          title: "발음 01 — 필수 구분",
          description: "Must-distinguish: ㄹ/ㄴ, ㅓ/ㅗ, ㅜ/ㅡ, ㅐ/ㅔ.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f5",
          slug: "pronunciation-02",
          number: 5,
          title: "발음 02 — 대표 발음 변화 맛보기",
          description: "ㄴ/ㄹ, final consonant sounds — what you hear most.",
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
          slug: "numbers-01",
          number: 6,
          title: "숫자 01 — 0~10",
          description: "Native and Sino-Korean (둘/이, 하나/일…).",
          meta: meta(0, 0, 3),
        },
        {
          id: "f7",
          slug: "numbers-02",
          number: 7,
          title: "숫자 02 — 11~99 만들기",
          description: "십/이십… and 스물하나, 서른….",
          meta: meta(0, 0, 4),
        },
        {
          id: "f8",
          slug: "numbers-03",
          number: 8,
          title: "숫자 03 — 큰수 핵심",
          description: "백/천/만, phone numbers and addresses.",
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
          slug: "counters-01",
          number: 9,
          title: "세기 01 — 초핵심 단위 10개",
          description: "개/명/살/번/시/분/원/잔/마리/권.",
          meta: meta(0, 0, 5),
        },
        {
          id: "f10",
          slug: "time-01",
          number: 10,
          title: "시간 01 — 몇 시예요?",
          description: "Hours and minutes, a.m./p.m.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f11",
          slug: "date-01",
          number: 11,
          title: "날짜 01 — 요일/오늘·내일·어제",
          description: "Days of the week, today/tomorrow/yesterday.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f12",
          slug: "date-02",
          number: 12,
          title: "날짜 02 — 월/일, 생일·기간",
          description: "Months and days, reading 1월 3일, birthdays.",
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
          slug: "essential-01",
          number: 13,
          title: "초필수단어 01 — 사람/관계",
          description: "나, 너, 친구, 선생님, 가족.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f14",
          slug: "essential-02",
          number: 14,
          title: "초필수단어 02 — 장소",
          description: "집, 학교, 회사, 카페, 화장실, 여기/저기.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f15",
          slug: "essential-03",
          number: 15,
          title: "초필수단어 03 — 이동/방향",
          description: "왼쪽/오른쪽, 앞/뒤, 위/아래, 쭉, 건너편.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f16",
          slug: "essential-04",
          number: 16,
          title: "초필수단어 04 — 음식/주문",
          description: "물, 밥, 커피, 메뉴, 포장, 계산.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f17",
          slug: "essential-05",
          number: 17,
          title: "초필수단어 05 — 생활",
          description: "핸드폰, 시간, 돈, 이름, 주소, 날짜.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f18",
          slug: "essential-06",
          number: 18,
          title: "초필수단어 06 — 형용사 미니셋",
          description: "큰/작은, 좋은/나쁜, 빠른/느린, 뜨거운/차가운.",
          meta: meta(0, 0, 4),
        },
        {
          id: "f19",
          slug: "essential-07",
          number: 19,
          title: "초필수단어 07 — 숫자랑 같이 쓰는 단어",
          description: "사람/개/살/시/분/원 등 재노출.",
          meta: meta(0, 0, 4),
        },
      ],
    },
  ],
};
