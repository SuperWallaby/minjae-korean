import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Recommendations",
    goal: "Ask for a recommendation, give one, and react naturally in a short back-and-forth.",
  },
  coreFrames: [
    {
      korean: "___ 추천해 주세요.",
      english: "Please recommend ___ to me.",
      examples: ["맛집 추천해 주세요.", "영화 추천해 주세요."],
      swapCategories: [
        {
          label: "추천 주제 (Topics)",
          items: [
            { korean: "맛집", english: "a good restaurant", result: "맛집" },
            { korean: "영화", english: "a movie", result: "영화" },
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "드라마", english: "a drama", result: "드라마" },
            { korean: "노래", english: "a song", result: "노래" },
          ],
        },
      ],
    },
    {
      korean: "___ 뭐가 좋아요?",
      english: "Any good ___? / What's good for ___?",
      examples: ["영화 뭐가 좋아요?", "카페 뭐가 좋아요?"],
      swapCategories: [
        {
          label: "카테고리 (Categories)",
          items: [
            { korean: "영화", english: "movies", result: "영화" },
            { korean: "카페", english: "cafes", result: "카페" },
            { korean: "음식", english: "food", result: "음식" },
            { korean: "노래", english: "songs", result: "노래" },
            { korean: "유튜브", english: "YouTube channels", result: "유튜브" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 추천해요.",
      english: "I recommend ___.",
      examples: ["저는 이 영화 추천해요.", "저는 그 카페 추천해요."],
      swapCategories: [
        {
          label: "추천 답변 (Recommendations)",
          items: [
            { korean: "이 영화", english: "this movie", result: "이 영화" },
            { korean: "이 카페", english: "this cafe", result: "이 카페" },
            { korean: "이 노래", english: "this song", result: "이 노래" },
            { korean: "그 식당", english: "that restaurant", result: "그 식당" },
            { korean: "이 드라마", english: "this drama", result: "이 드라마" },
          ],
        },
      ],
    },
    {
      korean: "이거 어때요?",
      english: "How about this? / What do you think?",
      examples: ["이거 어때요? 한번 가볼래요?", "이거 어때요? 괜찮아요?"],
      swapCategories: [
        {
          label: "붙임말 (Add-ons)",
          items: [
            { korean: "한번", english: "once / sometime", result: "한번" },
            { korean: "같이", english: "together", result: "같이" },
            { korean: "오늘", english: "today", result: "오늘" },
            { korean: "주말에", english: "on the weekend", result: "주말에" },
            { korean: "지금", english: "now", result: "지금" },
          ],
        },
      ],
    },
    {
      korean: "좋아요! / 괜찮아요! / 별로예요.",
      english: "Sounds good! / It's okay. / Not really.",
      examples: ["좋아요! 그거 해볼게요.", "음… 별로예요. 다른 거 있어요?"],
      swapCategories: [
        {
          label: "반응 (Reactions)",
          items: [
            { korean: "좋아요", english: "sounds good", result: "좋아요!" },
            { korean: "괜찮아요", english: "it's okay", result: "괜찮아요!" },
            { korean: "별로예요", english: "not really", result: "별로예요." },
            { korean: "좋은 것 같아요", english: "sounds nice", result: "좋은 것 같아요!" },
            { korean: "좀 애매해요", english: "kinda meh", result: "좀 애매해요." },
          ],
        },
      ],
    },
    {
      korean: "왜 추천해요? / 어떤 점이 좋아요?",
      english: "Why do you recommend it? / What's good about it?",
      examples: ["왜 추천해요?", "어떤 점이 좋아요?"],
      swapCategories: [
        {
          label: "이유 (Reasons)",
          items: [
            { korean: "재밌어요", english: "it's fun", result: "재밌어요" },
            { korean: "맛있어요", english: "it's delicious", result: "맛있어요" },
            { korean: "분위기가 좋아요", english: "the vibe is good", result: "분위기가 좋아요" },
            { korean: "편해요", english: "it's comfortable", result: "편해요" },
            { korean: "가성비가 좋아요", english: "good value", result: "가성비가 좋아요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "맛집 추천해 주세요!",
    "요즘 볼만한 영화 있어요?",
    "이거 어때요?",
    "왜 추천해요?",
    "다른 것도 추천해 주세요.",
  ],
  replyPack: [
    "___ 추천해 주세요.",
    "저는 ___ 추천해요.",
    "이거 어때요?",
    "좋아요! / 괜찮아요! / 별로예요.",
    "왜냐하면 ___(이)라서요.",
  ],
  challenge: {
    prompt: "Write 3 lines: ask for a recommendation, recommend one, and give a reason.",
    inputCount: 3,
  },
};

export default content;