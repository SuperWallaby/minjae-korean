import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Test: Core Grammar" },
    {
      type: "paragraph",
      text: "Choose the correct answer for each question.",
    },
    {
      type: "test",
      title: "Core Grammar quiz",
      questions: [
        {
          prompt: "In Korean, where does politeness and tense usually go?",
          choices: ["In the verb stem", "In the endings attached to the stem", "In the subject", "In particles only"],
          answer: "In the endings attached to the stem",
        },
        {
          prompt: "What is the role of particles (조사) like 은/는, 이/가?",
          choices: ["They conjugate the verb", "They mark the role of words (topic, subject, object)", "They show tense", "They are optional filler"],
          answer: "They mark the role of words (topic, subject, object)",
        },
        {
          prompt: "은/는 often marks the ___ of the sentence.",
          choices: ["verb", "object", "topic/theme", "time"],
          answer: "topic/theme",
        },
        {
          prompt: "을/를 marks the ___ of the verb.",
          choices: ["subject", "topic", "object", "place"],
          answer: "object",
        },
        {
          prompt: "Why can Koreans often drop the subject (I, you)?",
          choices: ["It is grammatically wrong to say it", "Context makes it clear who is meant", "Only objects can be dropped", "Particles replace the subject"],
          answer: "Context makes it clear who is meant",
        },
      ],
    },
  ],
};
