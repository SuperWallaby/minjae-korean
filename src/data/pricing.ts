/**
 * Flexible Monthly Rhythm: 유저가 주당 횟수를 선택한 뒤 한 달 단위로 결제.
 * Stripe Price ID는 .env에서 읽고, 여기서는 표시용 라벨/금액만 정의.
 */

export type MonthlyRhythmId = "1x" | "2x" | "3x";

/** 카드에 보여줄 회당 대표 가격 (예: ~$12/session) */
export const RHYTHM_PER_SESSION_DISPLAY = "~$12";

export const MONTHLY_RHYTHM_OPTIONS: Array<{
  id: MonthlyRhythmId;
  sessionsPerWeek: number;
  label: string;
  /** 표시용 (실제 청구는 Stripe Price 기준) */
  amountDisplay: string;
  description: string;
}> = [
  {
    id: "1x",
    sessionsPerWeek: 1,
    label: "Gentle Pace",
    amountDisplay: "$49",
    description: "About 4 sessions per month. Best for a steady, light pace.",
  },
  {
    id: "2x",
    sessionsPerWeek: 2,
    label: "Balanced Pace",
    amountDisplay: "$89",
    description: "About 8 sessions per month. Good balance of practice and flexibility.",
  },
  {
    id: "3x",
    sessionsPerWeek: 3,
    label: "Level Up Fast",
    amountDisplay: "$129",
    description: "About 12 sessions per month. For faster progress.",
  },
];
