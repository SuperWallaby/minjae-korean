/**
 * Grammar section content. Replace the placeholder with your full JSON (same shape).
 */

export type GrammarChapter = {
  number: number;
  title: string;
  content: string;
};

export type GrammarData = {
  chapters: GrammarChapter[];
};

export const grammarChapters: GrammarData = {
  chapters: [
    {
      number: 1,
      title: "Placeholder",
      content: "Replace this with your grammar content. Add more chapters in the same shape.",
    },
  ],
};
