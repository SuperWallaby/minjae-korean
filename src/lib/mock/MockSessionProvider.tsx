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
  requestMagicLink: (args: { email: string; next?: string }) => Promise<{ ok: true } | { ok: false; error: string }>;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  buyPass: (count: number) => void;
  startSubscription: (plan: SubscriptionPlan) => void;
  cancelSubscription: () => void;
  reserveSlot: (startISO: string, durationMin: number) => { ok: true } | { ok: false; reason: string };
  cancelBooking: (id: string) => void;
  resetDemo: () => void;
};

const MockSessionContext = React.createContext<MockSessionContextValue | null>(
  null
);

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random()}`;
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
  return safeParse(window.localStorage.getItem(MOCK_SESSION_STORAGE_KEY)) ?? defaultMockSessionState;
}

function persist(state: MockSessionState) {
  try {
    window.localStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function MockSessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [state, setState] = React.useState<MockSessionState>(defaultMockSessionState);
  const [accountOps, setAccountOps] = React.useState(0);
  const accountLoading = accountOps > 0;

  React.useEffect(() => {
    setState(loadInitialState());
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    persist(state);
  }, [ready, state]);

  const value = React.useMemo<MockSessionContextValue>(() => {
    const refreshSession = async () => {
      setAccountOps((n) => n + 1);
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        const user = json?.ok ? (json.user as MockSessionState["user"] | null) : null;
        setState((prev) => ({
          ...prev,
          user: user && typeof user === "object" ? user : null,
        }));
      } catch {
        setState((prev) => ({ ...prev, user: null }));
      } finally {
        setAccountOps((n) => Math.max(0, n - 1));
      }
    };

    const requestMagicLink = async (args: { email: string; next?: string }) => {
      const email = (args.email ?? "").trim().toLowerCase();
      const next = (args.next ?? "").trim();
      setAccountOps((n) => n + 1);
      try {
        const res = await fetch("/api/auth/magic-link/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, next }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.ok) return { ok: false as const, error: String(json?.error ?? "Failed to send email") };
        return { ok: true as const };
      } catch (e) {
        return { ok: false as const, error: e instanceof Error ? e.message : "Failed to send email" };
      } finally {
        setAccountOps((n) => Math.max(0, n - 1));
      }
    };

    const signOut = async () => {
      setAccountOps((n) => n + 1);
      try {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      } finally {
        setState((prev) => ({ ...prev, user: null }));
        setAccountOps((n) => Math.max(0, n - 1));
      }
    };

    const buyPass = (count: number) => {
      setState((prev) => ({
        ...prev,
        passRemaining: Math.max(0, prev.passRemaining) + Math.max(0, count),
      }));
    };

    const startSubscription = (plan: SubscriptionPlan) => {
      setState((prev) => ({
        ...prev,
        subscriptionPlan: plan,
      }));
    };

    const cancelSubscription = () => {
      setState((prev) => ({
        ...prev,
        subscriptionPlan: null,
      }));
    };

    const cancelBooking = (id: string) => {
      setState((prev) => ({
        ...prev,
        bookings: prev.bookings.filter((b) => b.id !== id),
      }));
    };

    const resetDemo = () => setState(defaultMockSessionState);

    return {
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
      reserveSlot: (startISO, durationMin) => {
        const snapshot = state;
        if (!snapshot.user) return { ok: false, reason: "Please sign in first." };
        if (!canBook(snapshot)) return { ok: false, reason: "You need a pass or a subscription to book." };
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
            passRemaining: usesPass ? Math.max(0, prev.passRemaining - 1) : prev.passRemaining,
            bookings: [booking, ...prev.bookings],
          };
        });
        return { ok: true };
      },
      cancelBooking,
      resetDemo,
    };
  }, [accountLoading, ready, state]);

  React.useEffect(() => {
    if (!ready) return;
    void value.refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <MockSessionContext.Provider value={value}>
      {children}
    </MockSessionContext.Provider>
  );
}

export function useMockSession() {
  const ctx = React.useContext(MockSessionContext);
  if (!ctx) throw new Error("useMockSession must be used within MockSessionProvider");
  return ctx;
}

