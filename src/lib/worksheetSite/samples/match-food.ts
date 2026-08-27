import type { WorksheetRecord } from "@/lib/worksheetSite/types";

/** Approved korean-quiz `image_mcq` icons (app-reviewed). */
export const matchFoodSample: WorksheetRecord = {
  slug: "match-food",
  topic: "food",
  locale: "ko",
  filename: "match-food-v1",
  definition: {
    template: "match",
    title: "그림 보고 찾기",
    subtitle: "Match the picture to the Korean word.",
    border: "solid",
    borderColor: "#e11d48",
    items: [
      {
        id: "apple",
        label: "사과",
        quizItemId: "ff70a67d-a78a-4e3d-a3d2-44c1b265bedc",
        imageUrl:
          "https://quiz-media.kajakorean.com/system/quiz/ff70a67d-a78a-4e3d-a3d2-44c1b265bedc.webp",
      },
      {
        id: "dog",
        label: "개",
        quizItemId: "3a4a7369-9019-4f3c-9ae3-b46cd01a4515",
        imageUrl:
          "https://quiz-media.kajakorean.com/system/quiz/3a4a7369-9019-4f3c-9ae3-b46cd01a4515/1784529543949.webp",
      },
      {
        id: "hamburger",
        label: "햄버거",
        quizItemId: "a5911856-2bf8-41fd-856a-77a811c9467e",
        imageUrl:
          "https://quiz-media.kajakorean.com/system/quiz/a5911856-2bf8-41fd-856a-77a811c9467e.webp",
      },
      {
        id: "cat",
        label: "고양이",
        quizItemId: "7e480af0-5228-41b1-8193-27ee70a08293",
        imageUrl:
          "https://quiz-media.kajakorean.com/system/quiz/7e480af0-5228-41b1-8193-27ee70a08293/1782861842218.webp",
      },
      {
        id: "bread",
        label: "빵",
        quizItemId: "d2f0121f-895f-416c-8bde-a93f87dc4890",
        imageUrl:
          "https://quiz-media.kajakorean.com/system/quiz/d2f0121f-895f-416c-8bde-a93f87dc4890/1782652056085.webp",
      },
      {
        id: "egg",
        label: "달걀",
        quizItemId: "abc4e4d7-7bec-4ade-8d2c-ee82f842de68",
        imageUrl:
          "https://quiz-media.kajakorean.com/system/quiz/abc4e4d7-7bec-4ade-8d2c-ee82f842de68.webp",
      },
      {
        id: "orange",
        label: "오렌지",
        quizItemId: "c6dc2eae-5798-452d-909c-4f1fc1524a68",
        imageUrl:
          "https://quiz-media.kajakorean.com/system/quiz/c6dc2eae-5798-452d-909c-4f1fc1524a68.webp",
      },
    ],
    labels: ["오렌지", "달걀", "빵", "사과", "개", "햄버거", "고양이"],
    example: { itemId: "apple", label: "사과" },
  },
};
