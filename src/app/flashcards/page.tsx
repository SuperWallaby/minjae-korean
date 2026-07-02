import { FlashcardsClient } from "@/components/flashcards/FlashcardsClient";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { sampleKoreanQuizHomeCards } from "@/lib/koreanQuiz/store";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  count?: string;
  cols?: string;
  title?: string;
}>;

function parseCount(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 12;
  return Math.min(30, Math.max(4, Math.round(n)));
}

function parseCols(raw: string | undefined): 3 | 4 | 5 {
  const n = Number(raw);
  if (n === 3 || n === 5) return n;
  return 4;
}

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const count = parseCount(params.count);
  const columns = parseCols(params.cols);
  const title = params.title?.trim() || undefined;

  let cards: Awaited<ReturnType<typeof sampleKoreanQuizHomeCards>> = [];
  try {
    cards = await sampleKoreanQuizHomeCards(count);
  } catch {
    cards = [];
  }

  return (
    <MarketingPage containerClassName="max-w-6xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Library"
            title="Flashcards"
            lead="Picture vocabulary cards from the Kaja quiz pool. Tap to reveal Korean."
          />
          <div className="mt-8">
            <FlashcardsClient cards={cards} columns={columns} title={title} />
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
