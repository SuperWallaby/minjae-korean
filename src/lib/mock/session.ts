export type MockUser = {
  id: string; // stable auth id (e.g. google sub)
  name: string;
  email: string;
  studentId?: string;
  imageUrl?: string;
};

export type SubscriptionPlan = "weekly1" | "weekly2";

export type Booking = {
  id: string;
  startISO: string;
  durationMin: number;
  createdAtISO: string;
};

export type MockSessionState = {
  user: MockUser | null;
  passRemaining: number;
  subscriptionPlan: SubscriptionPlan | null;
  bookings: Booking[];
};

export const MOCK_SESSION_STORAGE_KEY = "mj_mock_session_v1";

export const defaultMockSessionState: MockSessionState = {
  user: null,
  passRemaining: 0,
  subscriptionPlan: null,
  bookings: [],
};

export function canBook(state: MockSessionState) {
  return Boolean(state.user) && (state.passRemaining > 0 || Boolean(state.subscriptionPlan));
}

export function hasAnyEntitlement(state: MockSessionState) {
  return state.passRemaining > 0 || Boolean(state.subscriptionPlan);
}

