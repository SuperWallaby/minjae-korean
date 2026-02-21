import type { ExpressionChapterList, ExpressionChapterListItem } from "./expressionTypes";

export const expressionChapterList: ExpressionChapterList = {
  sections: [
    {
      title: "basics",
      displayTitle: "Basics",
      anchor: "basics",
      chapters: [
        {
          id: "exp-001",
          slug: "introductions",
          number: 1,
          title: "Introductions",
          description: "저는 ___예요/이에요, 저는 ___ 살이에요",
          meta: { frames: 6, minutes: 3 },
        },
        {
          id: "exp-002",
          slug: "where-from",
          number: 2,
          title: "Where I'm From",
          description: "저는 ___ 사람이에요, 저는 ___에서 왔어요",
          meta: { frames: 5, minutes: 3 },
        },
        {
          id: "exp-011",
          slug: "name-age-job",
          number: 3,
          title: "Name, Age, Job",
          description: "제 이름은 ___예요/이에요, 저는 ___예요/이에요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-012",
          slug: "where-live",
          number: 4,
          title: "Where I Live",
          description: "저는 ___에 살아요",
          meta: { frames: 5, minutes: 3 },
        },
        {
          id: "exp-013",
          slug: "nice-to-meet-you",
          number: 5,
          title: "Nice to Meet You",
          description: "만나서 반가워요, 잘 부탁드려요",
          meta: { frames: 5, minutes: 3 },
        },
      ],
    },
    {
      title: "preferences",
      displayTitle: "Preferences",
      anchor: "preferences",
      chapters: [
        {
          id: "exp-003",
          slug: "likes-dislikes",
          number: 1,
          title: "Likes & Dislikes",
          description: "저는 ___ 좋아해요, 별로 안 좋아해요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-004",
          slug: "hobbies-interests",
          number: 2,
          title: "Hobbies & Interests",
          description: "저는 ___에 관심 있어요, ___ 자주 해요",
          meta: { frames: 5, minutes: 3 },
        },
        {
          id: "exp-014",
          slug: "favorites",
          number: 3,
          title: "Favorites",
          description: "제가 제일 좋아하는 건 ___예요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-015",
          slug: "frequency",
          number: 4,
          title: "How Often",
          description: "자주요, 가끔요, 거의 안 해요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-016",
          slug: "recommendations",
          number: 5,
          title: "Recommendations",
          description: "추천해 주세요, 이거 어때요?",
          meta: { frames: 6, minutes: 4 },
        },
      ],
    },
    {
      title: "daily",
      displayTitle: "Daily Life",
      anchor: "daily",
      chapters: [
        {
          id: "exp-005",
          slug: "what-did-today",
          number: 1,
          title: "What I Did",
          description: "오늘 ___ 했어요, ___에 갔어요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-017",
          slug: "today-ate",
          number: 2,
          title: "What I Ate",
          description: "오늘 ___ 먹었어요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-018",
          slug: "where-went",
          number: 3,
          title: "Where I Went",
          description: "오늘 ___에 갔어요, 거기에서 ___ 했어요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-006",
          slug: "how-feeling",
          number: 4,
          title: "How I'm Feeling",
          description: "오늘 기분이 ___ 해요",
          meta: { frames: 5, minutes: 3 },
        },
        {
          id: "exp-019",
          slug: "weekend-plans",
          number: 5,
          title: "Weekend Plans",
          description: "주말에 ___ 할 거예요, 내일 ___ 할 거예요",
          meta: { frames: 6, minutes: 4 },
        },
      ],
    },
    {
      title: "now",
      displayTitle: "Right Now",
      anchor: "now",
      chapters: [
        {
          id: "exp-020",
          slug: "what-doing-now",
          number: 1,
          title: "What I'm Doing Now",
          description: "지금 ___ 하고 있어요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-021",
          slug: "where-am-now",
          number: 2,
          title: "Where I Am Now",
          description: "지금 ___에 있어요",
          meta: { frames: 5, minutes: 3 },
        },
        {
          id: "exp-022",
          slug: "free-time",
          number: 3,
          title: "Do You Have Time?",
          description: "지금 시간 있어요/없어요, 괜찮아요",
          meta: { frames: 6, minutes: 4 },
        },
      ],
    },
    {
      title: "needs",
      displayTitle: "Need & Want",
      anchor: "needs",
      chapters: [
        {
          id: "exp-023",
          slug: "need",
          number: 1,
          title: "I Need",
          description: "저는 ___ 필요해요",
          meta: { frames: 5, minutes: 3 },
        },
        {
          id: "exp-024",
          slug: "want",
          number: 2,
          title: "I Want",
          description: "저는 ___ 원해요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-025",
          slug: "want-to",
          number: 3,
          title: "I Want to",
          description: "저는 ___ 하고 싶어요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-026",
          slug: "want-to-learn",
          number: 4,
          title: "I Want to Learn",
          description: "저는 ___ 배우고 싶어요",
          meta: { frames: 6, minutes: 4 },
        },
      ],
    },
    {
      title: "questions",
      displayTitle: "Questions",
      anchor: "questions",
      chapters: [
        {
          id: "exp-007",
          slug: "basic-questions",
          number: 1,
          title: "Basic Questions",
          description: "당신은 ___예요/이에요?, ___ 좋아해요?",
          meta: { frames: 5, minutes: 3 },
        },
        {
          id: "exp-027",
          slug: "questions-about-today",
          number: 2,
          title: "Ask About Today",
          description: "오늘 ___ 했어요?, 오늘 ___ 먹었어요?",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-028",
          slug: "make-plans-questions",
          number: 3,
          title: "Make Plans",
          description: "내일 ___ 할 거예요?, 주말에 ___ 할 거예요?",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-008",
          slug: "follow-up-questions",
          number: 4,
          title: "Follow-ups",
          description: "왜요?, 어땠어요?, 어디에서 했어요?",
          meta: { frames: 6, minutes: 4 },
        },
      ],
    },
    {
      title: "connectors",
      displayTitle: "Connectors",
      anchor: "connectors",
      chapters: [
        {
          id: "exp-009",
          slug: "add-ons",
          number: 1,
          title: "Add-ons",
          description: "왜냐하면/그래서/하지만/그리고",
          meta: { frames: 4, minutes: 3 },
        },
        {
          id: "exp-029",
          slug: "because-so",
          number: 2,
          title: "Because & So",
          description: "왜냐하면 ___(이)라서요, 그래서 ___ 했어요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-030",
          slug: "but-and",
          number: 3,
          title: "But & And",
          description: "그런데/하지만 ___ 해요, 그리고 ___ 했어요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-031",
          slug: "time-place-addons",
          number: 4,
          title: "Time & Place Add-ons",
          description: "___시에요, ___에서요/___에요",
          meta: { frames: 6, minutes: 4 },
        },
      ],
    },
    {
      title: "survival",
      displayTitle: "Survival",
      anchor: "survival",
      chapters: [
        {
          id: "exp-010",
          slug: "when-stuck",
          number: 1,
          title: "When You're Stuck",
          description: "잘 모르겠어요, 한 번만 더요",
          meta: { frames: 5, minutes: 3 },
        },
        {
          id: "exp-032",
          slug: "please-repeat",
          number: 2,
          title: "Please Repeat",
          description: "다시 말해 주세요, 천천히 말해 주세요",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-033",
          slug: "forgot-the-word",
          number: 3,
          title: "I Forgot the Word",
          description: "단어가 생각이 안 나요, ___를 한국어로 뭐라고 해요?",
          meta: { frames: 6, minutes: 4 },
        },
        {
          id: "exp-034",
          slug: "Confirm Meaning",
          number: 4,
          title: "Confirm Meaning",
          description: "무슨 뜻이에요?, ___ 말이에요?",
          meta: { frames: 6, minutes: 4 },
        },
      ],
    },
  ],
};

export function getAllExpressionChapters(): ExpressionChapterListItem[] {
  return expressionChapterList.sections.flatMap((s) => s.chapters);
}

export function getExpressionChapterBySlug(
  slug: string,
): ExpressionChapterListItem | undefined {
  return getAllExpressionChapters().find((c) => c.slug === slug);
}

export function getExpressionSectionForChapter(slug: string): string | undefined {
  for (const section of expressionChapterList.sections) {
    if (section.chapters.some((c) => c.slug === slug)) {
      return section.displayTitle;
    }
  }
  return undefined;
}