import type { GrammarChapterList, GrammarChapterListItem } from "./grammarTypes";

/** 전체 챕터 플랫 목록 (상세 페이지·Top 추천 등에서 사용) */
export function getAllChapters(list: GrammarChapterList): GrammarChapterListItem[] {
  return list.sections.flatMap((s) => s.chapters);
}

/** slug로 챕터 찾기 */
export function getChapterBySlug(list: GrammarChapterList, slug: string): GrammarChapterListItem | null {
  for (const section of list.sections) {
    const ch = section.chapters.find((c) => c.slug === slug);
    if (ch) return ch;
  }
  return null;
}

/** 챕터가 속한 섹션 displayTitle (브레드크럼용) */
export function getSectionDisplayTitleForChapter(
  list: GrammarChapterList,
  chapterId: string,
): string {
  for (const section of list.sections) {
    if (section.chapters.some((c) => c.id === chapterId)) return section.displayTitle;
  }
  return "";
}

/** 챕터가 속한 섹션의 앵커 (목록 페이지 # 해시용) */
export function getSectionAnchorForChapter(
  list: GrammarChapterList,
  chapterId: string,
): string {
  for (const section of list.sections) {
    if (section.chapters.some((c) => c.id === chapterId))
      return section.anchor ?? section.filterKey ?? "";
  }
  return "";
}

/** 메타 한 줄 다양화: 예문 N · 퀴즈 N · N분 (카드마다 다르게) */
function meta(sentences: number, quizzes: number, minutes: number) {
  return { sentences, minutes, quizzes };
}

export const grammarChapterList: GrammarChapterList = {
  sections: [
    {
      title: "Introduction",
      displayTitle: "Introduction",
      anchor: "introduction",
      chapters: [
        { id: "0", slug: "introduction", number: 0, title: "Introduction", description: "How this grammar course works.", meta: meta(0, 3, 2) },
      ],
    },
    {
      title: "A. 문장 기초/조사",
      displayTitle: "Particles",
      anchor: "조사",
      filterKey: "조사",
      chapters: [
        { id: "1", slug: "eun-neun", number: 1, title: "은/는", description: "Use it to set the topic.", meta: meta(8, 4, 3) },
        { id: "2", slug: "i-ga", number: 2, title: "이/가", description: "Use it to mark the subject.", meta: meta(10, 5, 4) },
        { id: "3", slug: "eul-reul", number: 3, title: "을/를", description: "Use it to mark the object.", meta: meta(9, 4, 3) },
        { id: "4", slug: "eh-vs-ehseo", number: 4, title: "에 vs 에서", description: "Go to a place vs do it there.", meta: meta(12, 6, 5) },
        { id: "5", slug: "ehge-hante-kke", number: 5, title: "에게/한테/께", description: "To someone (casual vs polite).", meta: meta(7, 3, 3) },
        { id: "6", slug: "wa-gwa-hago-rang", number: 6, title: "와/과, 하고, (이)랑", description: "Say 'and' between nouns.", meta: meta(11, 5, 4) },
        { id: "7", slug: "do", number: 7, title: "도", description: "Say 'also / too'.", meta: meta(8, 4, 3) },
        { id: "8", slug: "man-bakke", number: 8, title: "만, 밖에", description: "Say 'only' (two patterns).", meta: meta(9, 5, 4) },
        { id: "9", slug: "buteo-kkaji", number: 9, title: "부터/까지", description: "From A to B (time or place).", meta: meta(10, 4, 4) },
        { id: "10", slug: "euro-ro", number: 10, title: "으로/로", description: "By / to / with (one particle).", meta: meta(11, 6, 5) },
        { id: "11", slug: "boda", number: 11, title: "보다", description: "Compare: A is more than B.", meta: meta(8, 4, 3) },
        { id: "12", slug: "i-na-irado", number: 12, title: "(이)나, (이)라도", description: "Say 'or' / 'at least'.", meta: meta(9, 5, 4) },
      ],
    },
    {
      title: "B. 연결/이유/대조",
      displayTitle: "Connectors",
      anchor: "연결",
      filterKey: "연결",
      chapters: [
        { id: "13", slug: "geurigo-geuraeseo-hajiman", number: 13, title: "그리고/그래서/하지만", description: "And / so / but (basic set).", meta: meta(12, 6, 5) },
        { id: "14", slug: "neunde-jiman", number: 14, title: "는데/지만", description: "Give background, then contrast.", meta: meta(10, 5, 4) },
        { id: "15", slug: "eumyeon", number: 15, title: "(으)면", description: "If: 'If I do this, then…'.", meta: meta(11, 5, 4) },
        { id: "16", slug: "a-eoseo", number: 16, title: "아/어서", description: "Because / so (simple reason).", meta: meta(9, 4, 3) },
        { id: "17", slug: "eunikka", number: 17, title: "(으)니까", description: "Because (your reason or opinion).", meta: meta(10, 5, 4) },
        { id: "18", slug: "geona-na", number: 18, title: "거나/나(=or)", description: "Choose: do A or do B.", meta: meta(8, 4, 3) },
      ],
    },
    {
      title: "C. 시제/상(기본)",
      displayTitle: "Tense & Aspect",
      anchor: "시제",
      filterKey: "시제",
      chapters: [
        { id: "19", slug: "itda-eopda", number: 19, title: "있다/없다", description: "Say 'have / exist' and 'not have'.", meta: meta(10, 5, 4) },
        { id: "20", slug: "present-tense", number: 20, title: "현재 (-(으)ㄴ/는)", description: "Present tense: facts and habits.", meta: meta(8, 4, 3) },
        { id: "21", slug: "past-tense", number: 21, title: "과거 (-았/었)", description: "Past tense: what happened.", meta: meta(8, 4, 3) },
        { id: "22", slug: "future-tense", number: 22, title: "미래 (-(으)ㄹ)", description: "Future: will / going to.", meta: meta(8, 4, 3) },
        { id: "23", slug: "go-itda", number: 23, title: "고 있다 (진행)", description: "Say 'I am doing it now'.", meta: meta(9, 4, 3) },
        { id: "24", slug: "a-eo-itda", number: 24, title: "아/어 있다 (상태)", description: "A state stays after an action.", meta: meta(8, 4, 3) },
        { id: "25", slug: "a-eo-bon-jeok-itda", number: 25, title: "아/어 본 적 있다 (경험)", description: "Say 'I tried it before'.", meta: meta(10, 5, 4) },
      ],
    },
    {
      title: "D. 문체/말투",
      displayTitle: "Speech Levels",
      anchor: "문체",
      filterKey: "문체",
      chapters: [
        { id: "26", slug: "jondaenmal-vs-banmal", number: 26, title: "존댓말 vs 반말 (말투의 기본)", description: "Polite vs casual speech basics.", meta: meta(12, 6, 5) },
        { id: "27", slug: "haeyoche", number: 27, title: "해요체 만들기: -아요/어요", description: "Make polite everyday sentences.", meta: meta(11, 5, 4) },
        { id: "28", slug: "hapnida-che", number: 28, title: "합니다(격식체): -습니다/ㅂ니다", description: "Formal style for work and news.", meta: meta(10, 5, 4) },
        { id: "29", slug: "haeche", number: 29, title: "해체(반말): -아/어", description: "Casual style with friends.", meta: meta(9, 4, 3) },
        { id: "30", slug: "seyo-ju-seyo", number: 30, title: "Please do: -(으)세요, -아/어 주세요", description: "Ask politely: 'Please do…'.", meta: meta(10, 5, 4) },
        { id: "31", slug: "psida-lkkayo", number: 31, title: "Let’s / Shall we?: -(으)ㅂ시다, -(으)ㄹ까요?", description: "Suggest: 'Let's… / Shall we?'.", meta: meta(9, 4, 3) },
        { id: "32", slug: "ji-maseyo-myeon-andwaeyo", number: 32, title: "Don't: -지 마세요, -면 안 돼요", description: "Say 'Don't do it' and 'must not'.", meta: meta(10, 5, 4) },
      ],
    },
    {
      title: "E. 능력/의무/추측",
      displayTitle: "Ability & Obligation",
      anchor: "능의추",
      filterKey: "능의추",
      chapters: [
        { id: "33", slug: "l-su-itda", number: 33, title: "Can — (으)ㄹ 수 있다/없다", description: "Can / cannot do something.", meta: meta(11, 5, 4) },
        { id: "34", slug: "a-eoya-hada", number: 34, title: "아/어야 하다 (must)", description: "Must / have to do something.", meta: meta(9, 4, 3) },
        { id: "35", slug: "l-geot-gata", number: 35, title: "(으)ㄹ 것 같다 (probably)", description: "Guess: 'I think it will…'.", meta: meta(10, 5, 4) },
        { id: "36", slug: "getda", number: 36, title: "겠어요", description: "Will / likely (polite tone).", meta: meta(8, 4, 3) },
      ],
    },
    {
      title: "F. 간접/인용",
      displayTitle: "Reported Speech",
      anchor: "인용",
      filterKey: "인용",
      chapters: [
        { id: "37", slug: "dago-hada", number: 37, title: "다고 하다 — They said", description: "Report what someone said.", meta: meta(12, 6, 5) },
        { id: "38", slug: "eurago-hada-jago-hada", number: 38, title: "(으)라고 하다 / 자고 하다", description: "Report orders and suggestions.", meta: meta(10, 5, 4) },
      ],
    },
    {
      title: "G. 높임",
      displayTitle: "Honorifics",
      anchor: "높임",
      filterKey: "높임",
      chapters: [
        { id: "39", slug: "juche-nopim", number: 39, title: "주체 높임: -(으)시-, 계시다", description: "Be polite about the subject.", meta: meta(11, 5, 4) },
        { id: "40", slug: "gaekche-nopim", number: 40, title: "객체 높임: 드리다, 여쭙다", description: "Be polite to the other person.", meta: meta(9, 4, 3) },
      ],
    },
  ],
};
