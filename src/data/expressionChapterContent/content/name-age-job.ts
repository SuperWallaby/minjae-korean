import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Name, Age, Job",
    goal: "Answer the three most common questions smoothly: name, age, and job.",
  },
  coreFrames: [
    {
      korean: "제 이름은 ___예요/이에요.",
      english: "My name is ___.",
      examples: ["제 이름은 민재예요.", "제 이름은 지연이에요."],
      swapCategories: [
        {
          label: "이름 (Names)",
          items: [
            { korean: "민재", english: "Minjae", result: "민재예요" },
            { korean: "지연", english: "Jiyeon", result: "지연이에요" },
            { korean: "서준", english: "Seojun", result: "서준이에요" },
            { korean: "수아", english: "Sua", result: "수아예요" },
            { korean: "현우", english: "Hyunwoo", result: "현우예요" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___예요/이에요.",
      english: "I'm ___. (job/role)",
      examples: ["저는 디자이너예요.", "저는 학생이에요."],
      swapCategories: [
        {
          label: "직업/역할 (Jobs/Roles)",
          items: [
            { korean: "학생", english: "student", result: "학생이에요" },
            { korean: "회사원", english: "office worker", result: "회사원이에요" },
            { korean: "디자이너", english: "designer", result: "디자이너예요" },
            { korean: "개발자", english: "developer", result: "개발자예요" },
            { korean: "의사", english: "doctor", result: "의사예요" },
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
            { korean: "스무", english: "20", result: "스무" },
            { korean: "스물다섯", english: "25", result: "스물다섯" },
            { korean: "서른", english: "30", result: "서른" },
            { korean: "서른다섯", english: "35", result: "서른다섯" },
            { korean: "마흔", english: "40", result: "마흔" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___년생이에요.",
      english: "I was born in ___. (birth year)",
      examples: ["저는 1998년생이에요.", "저는 2001년생이에요."],
      swapCategories: [
        {
          label: "출생년도 (Birth year)",
          items: [
            { korean: "1995", english: "1995", result: "1995" },
            { korean: "1998", english: "1998", result: "1998" },
            { korean: "2000", english: "2000", result: "2000" },
            { korean: "2001", english: "2001", result: "2001" },
            { korean: "2004", english: "2004", result: "2004" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___에서 일해요/공부해요.",
      english: "I work/study at ___.",
      examples: ["저는 병원에서 일해요.", "저는 학교에서 공부해요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "회사", english: "a company", result: "회사" },
            { korean: "병원", english: "a hospital", result: "병원" },
            { korean: "학교", english: "a school", result: "학교" },
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "집", english: "home", result: "집" },
          ],
        },
      ],
    },
    {
      korean: "잘 부탁드려요.",
      english: "Nice to meet you. (polite, common closing)",
      examples: [],
    },
  ],
  quickQuestions: ["이름이 뭐예요?", "몇 살이에요?", "뭐 하세요? (직업)", "어디에서 일해요?", "몇 년생이에요?"],
  replyPack: [
    "제 이름은 ___예요/이에요.",
    "저는 ___예요/이에요.",
    "저는 ___살이에요.",
    "저는 ___년생이에요.",
    "저는 ___에서 일해요/공부해요.",
  ],
  challenge: {
    prompt: "Make 3–4 lines: name + job + age (and one extra detail).",
    inputCount: 3,
  },
};

export default content;