import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Introductions",
    goal: "Memorize these 6 sentences and you're 80% done with self-introductions.",
  },
  coreFrames: [
    {
      korean: "저는 ___. (이에요/예요)",
      english: "I am ___.",
      examples: ["저는 디자이너예요.", "저는 학생이에요."],
      swapCategories: [
        {
          label: "직업 (Jobs)",
          items: [
            { korean: "디자이너", english: "designer", result: "디자이너예요" },
            { korean: "선생님", english: "teacher", result: "선생님이에요" },
            { korean: "학생", english: "student", result: "학생이에요" },
            { korean: "회사원", english: "office worker", result: "회사원이에요" },
            { korean: "의사", english: "doctor", result: "의사예요" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___에서 왔어요.",
      english: "I'm from ___.",
      examples: ["저는 서울에서 왔어요.", "저는 미국에서 왔어요."],
      swapCategories: [
        {
          label: "도시 (Cities)",
          items: [
            { korean: "서울", english: "Seoul", result: "서울" },
            { korean: "부산", english: "Busan", result: "부산" },
            { korean: "도쿄", english: "Tokyo", result: "도쿄" },
            { korean: "뉴욕", english: "New York", result: "뉴욕" },
            { korean: "런던", english: "London", result: "런던" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___에 살아요.",
      english: "I live in ___.",
      examples: ["저는 서울에 살아요.", "저는 부산에 살아요."],
      swapCategories: [
        {
          label: "도시 (Cities)",
          items: [
            { korean: "서울", english: "Seoul", result: "서울" },
            { korean: "부산", english: "Busan", result: "부산" },
            { korean: "도쿄", english: "Tokyo", result: "도쿄" },
            { korean: "뉴욕", english: "New York", result: "뉴욕" },
            { korean: "런던", english: "London", result: "런던" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___살이에요.",
      english: "I'm ___ years old.",
      examples: ["저는 스물다섯 살이에요.", "저는 서른 살이에요."],
      swapCategories: [
        {
          label: "나이 (Age)",
          items: [
            { korean: "스물다섯", english: "25", result: "스물다섯" },
            { korean: "서른", english: "30", result: "서른" },
            { korean: "스무", english: "20", result: "스무" },
          ],
        },
      ],
    },
    {
      korean: "제 이름은 ___.",
      english: "My name is ___.",
      examples: ["제 이름은 민수예요.", "제 이름은 지연이에요."],
      swapCategories: [
        {
          label: "이름 (Names)",
          items: [
            { korean: "민수", english: "Minsu", result: "민수예요" },
            { korean: "지연", english: "Jiyeon", result: "지연이에요" },
          ],
        },
      ],
    },
    {
      korean: "만나서 반가워요.",
      english: "Nice to meet you.",
      examples: [],
    },
  ],
  quickQuestions: [
    "이름이 뭐예요?",
    "어디에서 왔어요?",
    "어디에 살아요?",
    "뭐 하세요? (직업)",
    "몇 살이에요?",
  ],
  replyPack: [
    "제 이름은 ___예요.",
    "저는 ___에서 왔어요.",
    "저는 ___에 살아요.",
    "저는 ___예요.",
    "저는 ___살이에요.",
  ],
  challenge: {
    prompt: "Try making 3 self-introduction sentences using the frames above.",
    inputCount: 3,
  },
};

export default content;
