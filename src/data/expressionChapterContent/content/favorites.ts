import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Favorites",
    goal: "Share your favorites (food, music, places) and ask the same back in one smooth flow.",
  },
  coreFrames: [
    {
      korean: "제가 제일 좋아하는 건 ___예요/이에요.",
      english: "My favorite is ___.",
      examples: ["제가 제일 좋아하는 건 커피예요.", "제가 제일 좋아하는 건 영화예요."],
      swapCategories: [
        {
          label: "주제 (Topics)",
          items: [
            { korean: "커피", english: "coffee", result: "커피예요" },
            { korean: "영화", english: "movies", result: "영화예요" },
            { korean: "음악", english: "music", result: "음악이에요" },
            { korean: "여행", english: "travel", result: "여행이에요" },
            { korean: "운동", english: "working out", result: "운동이에요" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___을/를 제일 좋아해요.",
      english: "I like ___ the most.",
      examples: ["저는 라면을 제일 좋아해요.", "저는 고양이를 제일 좋아해요."],
      swapCategories: [
        {
          label: "대상 (Things)",
          items: [
            { korean: "라면", english: "ramen", result: "라면을" },
            { korean: "피자", english: "pizza", result: "피자를" },
            { korean: "고양이", english: "cats", result: "고양이를" },
            { korean: "바다", english: "the ocean", result: "바다를" },
            { korean: "산책", english: "walking", result: "산책을" },
          ],
        },
      ],
    },
    {
      korean: "___ 중에서 뭐가 제일 좋아요?",
      english: "Which one do you like the most (among ___)?",
      examples: ["음식 중에서 뭐가 제일 좋아요?", "영화 중에서 뭐가 제일 좋아요?"],
      swapCategories: [
        {
          label: "카테고리 (Categories)",
          items: [
            { korean: "음식", english: "food", result: "음식" },
            { korean: "영화", english: "movies", result: "영화" },
            { korean: "음악", english: "music", result: "음악" },
            { korean: "장소", english: "places", result: "장소" },
            { korean: "계절", english: "seasons", result: "계절" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___을/를 제일 많이 먹어요/봐요/들어요.",
      english: "I eat/watch/listen to ___ the most.",
      examples: ["저는 라면을 제일 많이 먹어요.", "저는 K-pop을 제일 많이 들어요."],
      swapCategories: [
        {
          label: "패턴 (Patterns)",
          items: [
            { korean: "라면 / 먹어요", english: "ramen / eat", result: "라면을 제일 많이 먹어요" },
            { korean: "영화 / 봐요", english: "movies / watch", result: "영화를 제일 많이 봐요" },
            { korean: "K-pop / 들어요", english: "K-pop / listen", result: "K-pop을 제일 많이 들어요" },
            { korean: "커피 / 마셔요", english: "coffee / drink", result: "커피를 제일 많이 마셔요" },
          ],
        },
      ],
    },
    {
      korean: "요즘은 ___에 제일 빠져 있어요.",
      english: "These days I'm most into ___.",
      examples: ["요즘은 러닝에 제일 빠져 있어요.", "요즘은 커피에 제일 빠져 있어요."],
      swapCategories: [
        {
          label: "요즘 (These days)",
          items: [
            { korean: "러닝", english: "running", result: "러닝" },
            { korean: "캠핑", english: "camping", result: "캠핑" },
            { korean: "헬스", english: "working out", result: "헬스" },
            { korean: "요리", english: "cooking", result: "요리" },
            { korean: "사진", english: "photography", result: "사진" },
          ],
        },
      ],
    },
    {
      korean: "왜요? 왜 ___ 좋아해요?",
      english: "Why? Why do you like ___?",
      examples: ["왜요? 왜 커피 좋아해요?", "왜요? 왜 그 영화 좋아해요?"],
      swapCategories: [
        {
          label: "질문 (Ask)",
          items: [
            { korean: "커피", english: "coffee", result: "커피" },
            { korean: "영화", english: "movies", result: "영화" },
            { korean: "음악", english: "music", result: "음악" },
            { korean: "여행", english: "travel", result: "여행" },
            { korean: "운동", english: "exercise", result: "운동" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "제일 좋아하는 음식이 뭐예요?",
    "요즘 제일 좋아하는 게 뭐예요?",
    "음악 중에서 뭐가 제일 좋아요?",
    "왜 그거 좋아해요?",
    "요즘 뭐에 빠져 있어요?",
  ],
  replyPack: [
    "제가 제일 좋아하는 건 ___예요/이에요.",
    "저는 ___을/를 제일 좋아해요.",
    "저는 ___을/를 제일 많이 먹어요/봐요/들어요.",
    "요즘은 ___에 제일 빠져 있어요.",
    "왜냐하면 ___(이)라서요.",
  ],
  challenge: {
    prompt: "Write 3 lines: your favorite + a reason + a question back.",
    inputCount: 3,
  },
};

export default content;