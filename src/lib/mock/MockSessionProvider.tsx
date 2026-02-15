"use client";

import * as React from "react";

import {
  canBook,
  defaultMockSessionState,
  type Booking,
  type MockSessionState,
  MOCK_SESSION_STORAGE_KEY,
  type SubscriptionPlan,
} from "@/lib/mock/session";

type MockSessionContextValue = {
  ready: boolean;
  accountLoading: boolean;
  state: MockSessionState;
  canBook: boolean;
  requestMagicLink: (args: {
    email: string;
    next?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  buyPass: (count: number) => void;
  startSubscription: (plan: SubscriptionPlan) => void;
  cancelSubscription: () => void;
  reserveSlot: (
    startISO: string,
    durationMin: number,
  ) => { ok: true } | { ok: false; reason: string };
  cancelBooking: (id: string) => void;
  resetDemo: () => void;
};

const MockSessionContext = React.createContext<MockSessionContextValue | null>(
  null,
);

function newId() {
  return (
    globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random()}`
  );
}

function safeParse(value: string | null): MockSessionState | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as MockSessionState;
  } catch {
    return null;
  }
}

function loadInitialState(): MockSessionState {
  if (typeof window === "undefined") return defaultMockSessionState;
  const parsed = safeParse(window.localStorage.getItem(MOCK_SESSION_STORAGE_KEY));
  if (!parsed) return defaultMockSessionState;
  // Don't hydrate `student` from localStorage; it is fetched with the session.
  return { ...defaultMockSessionState, ...parsed, student: null };
}

function persist(state: MockSessionState) {
  try {
    // Don't persist `student` (can be large and can go stale).
    const toPersist: MockSessionState = { ...state, student: null };
    window.localStorage.setItem(
      MOCK_SESSION_STORAGE_KEY,
      JSON.stringify(toPersist),
    );
  } catch {
    // ignore
  }
}

export function MockSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = React.useState(false);
  const [sessionChecked, setSessionChecked] = React.useState(false);
  const [state, setState] = React.useState<MockSessionState>(
    defaultMockSessionState,
  );
  const [sessionOps, setSessionOps] = React.useState(0);
  const [, setAuthOps] = React.useState(0);

  // "Account" UI should only consider session readiness + session refresh.
  // (e.g. magic-link request shouldn't block account/profile UI)
  const accountLoading = !ready || !sessionChecked || sessionOps > 0;

  React.useEffect(() => {
    setState(loadInitialState());
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    persist(state);
  }, [ready, state]);

  const refreshSession = React.useCallback(async () => {
    setSessionOps((n) => n + 1);
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      const user = json?.ok ? (json.user as MockSessionState["user"] | null) : null;
      const student = json?.ok
        ? ((json.student ?? null) as MockSessionState["student"] | null)
        : null;
      setState((prev) => ({
        ...prev,
        user: user && typeof user === "object" ? user : null,
        student: student && typeof student === "object" ? student : null,
      }));
    } catch {
      setState((prev) => ({ ...prev, user: null, student: null }));
    } finally {
      setSessionOps((n) => Math.max(0, n - 1));
      setSessionChecked(true);
    }
  }, []);

  const requestMagicLink = React.useCallback(
    async (args: { email: string; next?: string }) => {
      const email = (args.email ?? "").trim().toLowerCase();
      const next = (args.next ?? "").trim();
      setAuthOps((n) => n + 1);
      try {
        const res = await fetch("/api/auth/magic-link/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, next }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok)
          return {
            ok: false as const,
            error: String(json?.error ?? "Failed to send email"),
          };
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: e instanceof Error ? e.message : "Failed to send email",
        };
      } finally {
        setAuthOps((n) => Math.max(0, n - 1));
      }
    },
    [],
  );

  const signOut = React.useCallback(async () => {
    setSessionOps((n) => n + 1);
    try {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      setState((prev) => ({ ...prev, user: null, student: null }));
      setSessionOps((n) => Math.max(0, n - 1));
      setSessionChecked(true);
    }
  }, []);

  const buyPass = React.useCallback((count: number) => {
    setState((prev) => ({
      ...prev,
      passRemaining: Math.max(0, prev.passRemaining) + Math.max(0, count),
    }));
  }, []);

  const startSubscription = React.useCallback((plan: SubscriptionPlan) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlan: plan,
    }));
  }, []);

  const cancelSubscription = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      subscriptionPlan: null,
    }));
  }, []);

  const cancelBooking = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.filter((b) => b.id !== id),
    }));
  }, []);

  const resetDemo = React.useCallback(
    () => setState(defaultMockSessionState),
    [],
  );

  const reserveSlot: MockSessionContextValue["reserveSlot"] = React.useCallback(
    (startISO: string, durationMin: number) => {
      const snapshot = state;
      if (!snapshot.user)
        return { ok: false as const, reason: "Please sign in first." };
      if (!canBook(snapshot))
        return {
          ok: false as const,
          reason: "You need a pass or a subscription to book.",
        };
      setState((prev) => {
        const booking: Booking = {
          id: newId(),
          startISO,
          durationMin,
          createdAtISO: new Date().toISOString(),
        };
        const usesPass = prev.passRemaining > 0;
        return {
          ...prev,
          passRemaining: usesPass
            ? Math.max(0, prev.passRemaining - 1)
            : prev.passRemaining,
          bookings: [booking, ...prev.bookings],
        };
      });
      return { ok: true as const };
    },
    [state],
  );

  const value = React.useMemo<MockSessionContextValue>(
    () => ({
      ready,
      accountLoading,
      state,
      canBook: canBook(state),
      requestMagicLink,
      refreshSession,
      signOut,
      buyPass,
      startSubscription,
      cancelSubscription,
      reserveSlot,
      cancelBooking,
      resetDemo,
    }),
    [
      accountLoading,
      buyPass,
      cancelBooking,
      cancelSubscription,
      ready,
      refreshSession,
      requestMagicLink,
      reserveSlot,
      resetDemo,
      signOut,
      startSubscription,
      state,
    ],
  );

  React.useEffect(() => {
    if (!ready) return;
    if (sessionChecked) return;
    void refreshSession();
  }, [ready, refreshSession, sessionChecked]);

  return (
    <MockSessionContext.Provider value={value}>
      {children}
    </MockSessionContext.Provider>
  );
}

export function useMockSession() {
  const ctx = React.useContext(MockSessionContext);
  if (!ctx)
    throw new Error("useMockSession must be used within MockSessionProvider");
  return ctx;
}
