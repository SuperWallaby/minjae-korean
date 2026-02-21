import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

/** DB 문서: 한 줄 격려 문구 (Recap 헤더 등) */
type EncourageDoc = {
  _id: string;
  text: string;
};

const FALLBACK_ENCOURAGES: string[] = [
  "Here are today's key phrases — let’s review them once more.",
  "Nice work today 👏 You stayed focused and kept the conversation flowing.",
  "You did it! Let’s lock in what you learned while it’s still fresh.",
  "Small steps, big progress ✨ Every repeat makes your Korean smoother.",
  "Keep going! A little practice today adds up faster than you think.",
];

let colPromise: Promise<Collection<EncourageDoc>> | null = null;

async function getCol(): Promise<Collection<EncourageDoc>> {
  if (!colPromise) {
    colPromise = getMongoDb().then((db) => db.collection<EncourageDoc>("encourages"));
  }
  return colPromise;
}

/** seed 문자열로 0 이상 max 미만의 고정 인덱스 반환 */
function seededIndex(seed: string, max: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % max;
}

/** recap id를 시드로 격려 문구 1개 고정 반환. DB에 없으면 fallback 목록에서 시드로 선택 */
export async function getEncourageForRecap(recapId: string): Promise<string> {
  try {
    const col = await getCol();
    const docs = await col.find({}).sort({ _id: 1 }).toArray();
    if (docs.length > 0) {
      const valid = docs.filter((d) => d.text?.trim()).map((d) => d.text!.trim());
      if (valid.length > 0) {
        const idx = seededIndex(recapId, valid.length);
        return valid[idx];
      }
    }
  } catch {
    // ignore
  }
  const idx = seededIndex(recapId, FALLBACK_ENCOURAGES.length);
  return FALLBACK_ENCOURAGES[idx] ?? FALLBACK_ENCOURAGES[0];
}

/** DB 문서: 마무리 칭찬 문구 */
type RecapClosingDoc = {
  _id: string;
  text: string;
};

const FALLBACK_CLOSINGS: string[] = [
  "오늘 잘 수고했어요. 다음 수업에서 만나요!",
  "오늘도 수고 많았어요. 다음에 또 만나요!",
  "오늘 수고했어요. 다음 수업에서 만나요!",
];

let closingsColPromise: Promise<Collection<RecapClosingDoc>> | null = null;

async function getClosingsCol(): Promise<Collection<RecapClosingDoc>> {
  if (!closingsColPromise) {
    closingsColPromise = getMongoDb().then((db) =>
      db.collection<RecapClosingDoc>("recapClosings"),
    );
  }
  return closingsColPromise;
}

/** recap id를 시드로 마무리 문구 1개 고정 반환 */
export async function getClosingForRecap(recapId: string): Promise<string> {
  try {
    const col = await getClosingsCol();
    const docs = await col.find({}).sort({ _id: 1 }).toArray();
    if (docs.length > 0) {
      const valid = docs.filter((d) => d.text?.trim()).map((d) => d.text!.trim());
      if (valid.length > 0) {
        const idx = seededIndex(recapId + "_closing", valid.length);
        return valid[idx];
      }
    }
  } catch {
    // ignore
  }
  const idx = seededIndex(recapId + "_closing", FALLBACK_CLOSINGS.length);
  return FALLBACK_CLOSINGS[idx] ?? FALLBACK_CLOSINGS[0];
}
