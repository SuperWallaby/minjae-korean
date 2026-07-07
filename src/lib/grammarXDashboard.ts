import {
  countComparisonsPendingXPost,
  listComparisonsPendingXPost,
} from "@/lib/grammarXPostsRepo";
import {
  countQueuedGrammarXItems,
  listGrammarXQueueHistory,
  listGrammarXQueueItems,
} from "@/lib/grammarXQueueRepo";
import { listUpcomingGrammarXSlots } from "@/lib/grammarXSchedule";
import { getMongoDb } from "@/lib/mongo";

export async function getGrammarXDashboard() {
  const db = await getMongoDb();
  const xPosts = db.collection("grammar_x_posts");

  const [queue, history, pendingAuto, pendingAutoCount, queuedCount, recentPosts, schedule] =
    await Promise.all([
      listGrammarXQueueItems(40),
      listGrammarXQueueHistory(20),
      listComparisonsPendingXPost(12),
      countComparisonsPendingXPost(),
      countQueuedGrammarXItems(),
      xPosts.find({}).sort({ postedAt: -1 }).limit(20).toArray(),
      Promise.resolve(listUpcomingGrammarXSlots(6)),
    ]);

  return {
    schedule,
    cronNote: "lab-worker cron — 09:00 / 15:00 / 21:00 KST (1 post each)",
    queuedCount,
    pendingAutoCount,
    queue,
    pendingAuto: pendingAuto.map((row) => ({
      id: row.id,
      slug: row.slug,
      titleEn: row.titleEn,
      titleKo: row.titleKo,
      imageUrl: row.imageUrl,
      words: row.items.map((item) => item.wordName),
    })),
    history: history.map((row) => ({
      id: row.id,
      kind: row.kind,
      status: row.status,
      comparisonId: row.comparisonId,
      note: row.note,
      tweetText: row.tweetText,
      imageUrl: row.imageUrl,
      tweetUrl: row.tweetUrl,
      error: row.error,
      postedAt: row.postedAt,
      updatedAt: row.updatedAt,
    })),
    recentPosts: recentPosts.map((row) => ({
      comparisonId: row.comparisonId,
      tweetId: row.tweetId,
      tweetUrl: row.tweetUrl,
      postedAt: row.postedAt,
    })),
  };
}
