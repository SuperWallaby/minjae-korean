import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Basic Questions",
    goal: "Start a conversation with 5 simple questions: who, what, where, and likes.",
  },
  coreFrames: [
    {
      korean: "이름이 뭐예요?",
      english: "What's your name?",
      examples: ["이름이 뭐예요?", "성함이 어떻게 되세요?"],
      swapCategories: [
        {
          label: "톤 (Tone)",
          items: [
            { korean: "성함이 어떻게 되세요?", english: "What's your name? (polite)", result: "성함이 어떻게 되세요?" },
            { korean: "이름이 뭐예요?", english: "What's your name? (casual)", result: "이름이 뭐예요?" },
          ],
        },
      ],
    },
    {
      korean: "어디에서 왔어요?",
      english: "Where are you from?",
      examples: ["어디에서 왔어요?", "어느 나라에서 왔어요?"],
      swapCategories: [
        {
          label: "확장 (More specific)",
          items: [
            { korean: "어느 나라에서 왔어요?", english: "Which country are you from?", result: "어느 나라에서 왔어요?" },
            { korean: "어느 도시에서 왔어요?", english: "Which city are you from?", result: "어느 도시에서 왔어요?" },
            { korean: "고향이 어디예요?", english: "Where is your hometown?", result: "고향이 어디예요?" },
          ],
        },
      ],
    },
    {
      korean: "어디에 살아요?",
      english: "Where do you live?",
      examples: ["어디에 살아요?", "지금 어디에 살아요?"],
      swapCategories: [
        {
          label: "시간 (Now)",
          items: [
            { korean: "지금 어디에 살아요?", english: "Where do you live now?", result: "지금 어디에 살아요?" },
            { korean: "어디에 살아요?", english: "Where do you live?", result: "어디에 살아요?" },
          ],
        },
      ],
    },
    {
      korean: "뭐 하세요?",
      english: "What do you do? (job)",
      examples: ["뭐 하세요?", "직업이 뭐예요?"],
      swapCategories: [
        {
          label: "직업 (Job)",
          items: [
            { korean: "직업이 뭐예요?", english: "What's your job?", result: "직업이 뭐예요?" },
            { korean: "뭐 하세요?", english: "What do you do?", result: "뭐 하세요?" },
          ],
        },
      ],
    },
    {
      korean: "___ 좋아해요?",
      english: "Do you like ___?",
      examples: ["커피 좋아해요?", "음악 좋아해요?"],
      swapCategories: [
        {
          label: "주제 (Topics)",
          items: [
            { korean: "커피", english: "coffee", result: "커피" },
            { korean: "영화", english: "movies", result: "영화" },
            { korean: "음악", english: "music", result: "음악" },
            { korean: "운동", english: "working out", result: "운동" },
            { korean: "여행", english: "travel", result: "여행" },
          ],
        },
      ],
    },
    {
      korean: "당신은 ___예요/이에요?",
      english: "Are you ___? / Are you a ___?",
      examples: ["당신은 학생이에요?", "당신은 한국 사람이에요?"],
      swapCategories: [
        {
          label: "역할/정체성 (Roles)",
          items: [
            { korean: "학생", english: "a student", result: "학생이에요" },
            { korean: "회사원", english: "an office worker", result: "회사원이에요" },
            { korean: "한국 사람", english: "Korean", result: "한국 사람이에요" },
            { korean: "의사", english: "a doctor", result: "의사예요" },
            { korean: "선생님", english: "a teacher", result: "선생님이에요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "이름이 뭐예요?",
    "어디에서 왔어요?",
    "어디에 살아요?",
    "뭐 하세요?",
    "뭐 좋아해요?",
  ],
  replyPack: [
    "제 이름은 ___예요/이에요.",
    "저는 ___에서 왔어요.",
    "저는 ___에 살아요.",
    "저는 ___예요/이에요.",
    "저는 ___ 좋아해요.",
  ],
  challenge: {
    prompt: "Write 3 questions: one about name, one about where, and one about likes.",
    inputCount: 3,
  },
};

export default content;