import { getMongoClient } from "@/lib/mongo";

export async function getKoreanQuizDb() {
  const client = await getMongoClient();
  return client.db(process.env.KOREAN_QUIZ_DB?.trim() || "korean_quiz");
}
