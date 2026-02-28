"use client";

import * as React from "react";
import { MessageCircleMore, Send, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useMockSession } from "@/lib/mock/MockSessionProvider";

type SupportThread = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: "open" | "closed";
  email?: string;
  name?: string;
  lastReadByMemberAt?: string;
  lastReadBySupportAt?: string;
};

type SupportMessage = {
  id: string;
  threadId: string;
  from: "member" | "support";
  text: string;
  createdAt: string;
  // client-only
  pending?: boolean;
};

type TypingState = { member: boolean; support: boolean };

const threadIdKey = "mj_support_thread_id_v1";
const emailKey = "mj_support_email_v1";
const nameKey = "mj_support_name_v1";
const emailPromptDismissedKey = "mj_support_email_prompt_dismissed_v1";

function isObjectIdLike(id: string) {
  return /^[a-f0-9]{24}$/i.test(String(id ?? "").trim());
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function formatTime(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

async function getJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

type RealtimeClient = {
  channelName: string;
  subscribe: (onEvent: () => void) => () => void;
};

type RealtimeChannelLike = {
  on: (...args: unknown[]) => RealtimeChannelLike;
  subscribe: (...args: unknown[]) => unknown;
  send: (...args: unknown[]) => Promise<unknown> | unknown;
};

type SupabaseLike = {
  channel: (name: string) => RealtimeChannelLike;
  removeChannel: (channel: RealtimeChannelLike) => unknown;
};

function getSupabaseFromModule(mod: unknown): SupabaseLike | null {
  if (!mod || typeof mod !== "object") return null;
  if (!("supabase" in mod)) return null;
  const sb = (mod as { supabase?: unknown }).supabase;
  if (!sb || typeof sb !== "object") return null;
  const sbo = sb as Partial<SupabaseLike>;
  if (typeof sbo.channel !== "function") return null;
  if (typeof sbo.removeChannel !== "function") return null;
  return sb as SupabaseLike;
}

async function maybeRealtime(threadId: string): Promise<RealtimeClient | null> {
  try {
    const mod = await import("@/lib/supabaseClient");
    const supabase = getSupabaseFromModule(mod);
    if (!supabase) return null;

    const channelName = `support_thread_${threadId}`;
    const channel = supabase.channel(channelName);

    return {
      channelName,
      subscribe: (onEvent: () => void) => {
        channel.on("broadcast", { event: "support" }, () => onEvent());
        channel.subscribe();
        return () => {
          try {
            supabase.removeChannel(channel);
          } catch {
            // ignore
          }
        };
      },
    };
  } catch {
    return null;
  }
}

async function broadcastRealtime(threadId: string, payload: unknown) {
  try {
    const mod = await import("@/lib/supabaseClient");
    const supabase = getSupabaseFromModule(mod);
    if (!supabase) return;
    const ch1 = supabase.channel(`support_thread_${threadId}`);
    const ch2 = supabase.channel("support_inbox");
    await Promise.all([
      ch1.send({ type: "broadcast", event: "support", payload }),
      ch2.send({ type: "broadcast", event: "support", payload }),
    ]);
    try {
      supabase.removeChannel(ch1);
    } catch {}
    try {
      supabase.removeChannel(ch2);
    } catch {}
  } catch {
    // ignore
  }
}

function isTmpId(id: string) {
  return id.startsWith("tmp_");
}

function stableKey(m: SupportMessage) {
  return `${m.from}:${m.text.trim()}:${m.createdAt}`;
}

export function SupportChatWidget() {
  const session = useMockSession();
  const pathname = usePathname();
  const hide = pathname.startsWith("/admin");

  const [open, setOpen] = React.useState(false);
  const [threadId, setThreadId] = React.useState<string>("");
  const [thread, setThread] = React.useState<SupportThread | null>(null);
  const [messages, setMessages] = React.useState<SupportMessage[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [draft, setDraft] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("");
  const [nameInput, setNameInput] = React.useState("");
  const [typing, setTypingState] = React.useState<TypingState>({
    member: false,
    support: false,
  });
  const typingStopRef = React.useRef<number | null>(null);

  const [unreadCount, setUnreadCount] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const realtimeCleanupRef = React.useRef<null | (() => void)>(null);
  const [rtActive, setRtActive] = React.useState(false);

  const [emailPromptDismissed, setEmailPromptDismissed] = React.useState(false);
  const optimisticIdRef = React.useRef(0);
  const sendInFlightRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const id = window.localStorage.getItem(threadIdKey) ?? "";
      if (id.trim()) {
        if (isObjectIdLike(id.trim())) setThreadId(id.trim());
        else window.localStorage.removeItem(threadIdKey);
      }
      const storedEmail = window.localStorage.getItem(emailKey) ?? "";
      const storedName = window.localStorage.getItem(nameKey) ?? "";
      if (storedEmail.trim()) setEmailInput(storedEmail.trim());
      if (storedName.trim()) setNameInput(storedName.trim());

      const dismissed =
        window.localStorage.getItem(emailPromptDismissedKey) ?? "";
      if (dismissed === "1") setEmailPromptDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  // Allow any page to open the support chat via:
  // window.dispatchEvent(new CustomEvent("mj_support_open", { detail: { text?: string } }))
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onOpen = (e: Event) => {
      setOpen(true);
      try {
        const ce = e as CustomEvent<{ text?: unknown }>;
        const text = typeof ce?.detail?.text === "string" ? ce.detail.text : "";
        if (text.trim()) setDraft((prev) => (prev.trim() ? prev : text.trim()));
      } catch {
        // ignore
      }
    };
    window.addEventListener("mj_support_open", onOpen as EventListener);
    return () => {
      window.removeEventListener("mj_support_open", onOpen as EventListener);
    };
  }, []);

  React.useEffect(() => {
    const u = session.state.user;
    if (!u) return;
    if (u.email && isEmail(u.email) && !emailInput.trim())
      setEmailInput(u.email.trim());
    if (u.name && !nameInput.trim()) setNameInput(u.name.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.state.user]);

  const fetchThread = React.useCallback(
    async (id: string, opts?: { silent?: boolean }) => {
      if (!id) return;
      if (!opts?.silent) setRefreshing(true);
      try {
        const { res, json } = await getJson(
          `/api/public/support/threads/${encodeURIComponent(id)}`,
        );
        if (!res.ok || !json?.ok)
          throw new Error(json?.error ?? "Failed to load chat");

        const t = json.thread as SupportThread;
        const msgs = (json.messages as SupportMessage[]) ?? [];
        const nextMsgsRaw = Array.isArray(msgs) ? msgs : [];

        setThread((prev) =>
          prev?.updatedAt === t.updatedAt &&
          prev?.email === t.email &&
          prev?.name === t.name
            ? prev
            : t,
        );

        // Merge server msgs + local tmp pending to avoid flicker.
        setMessages((prev) => {
          const pending = prev.filter(
            (m) => m.from === "member" && isTmpId(m.id),
          );
          if (pending.length === 0) {
            // #region agent log
            fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3494ff" },
              body: JSON.stringify({
                sessionId: "3494ff",
                location: "SupportChatWidget.tsx:fetchThread:merge",
                message: "merge no pending",
                data: { nextLen: nextMsgsRaw.length, prevLen: prev.length },
                timestamp: Date.now(),
                hypothesisId: "C",
              }),
            }).catch(() => {});
            // #endregion
            return nextMsgsRaw;
          }

          // 서버 메시지에 매칭되는 pending은 해당 pending의 id를 유지해 같은 노드로 갱신 (깜빡임/애니 리트리거 방지)
          const usedPendingIds = new Set<string>();
          const merged = nextMsgsRaw.map((m) => {
            if (m.from === "member") {
              const match = pending.find(
                (p) => p.text.trim() === m.text.trim() && !usedPendingIds.has(p.id),
              );
              if (match) {
                usedPendingIds.add(match.id);
                return { ...m, id: match.id };
              }
            }
            return m;
          });
          const keepPending = pending.filter((p) => !usedPendingIds.has(p.id));
          return [...merged, ...keepPending].sort((a, b) => {
            const ta = Date.parse(a.createdAt);
            const tb = Date.parse(b.createdAt);
            return ta - tb;
          });
        });

        const ty = (json.typing as TypingState) ?? {
          member: false,
          support: false,
        };
        if (typeof ty?.member === "boolean" && typeof ty?.support === "boolean")
          setTypingState(ty);

        const lastRead = Date.parse(t.lastReadByMemberAt ?? t.createdAt);
        const unread = nextMsgsRaw.filter(
          (m) => m.from === "support" && Date.parse(m.createdAt) > lastRead,
        ).length;
        setUnreadCount(unread);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load chat");
      } finally {
        if (!opts?.silent) setRefreshing(false);
      }
    },
    [],
  );

  const markRead = React.useCallback(async (id: string) => {
    if (!id) return;
    try {
      await fetch(
        `/api/public/support/threads/${encodeURIComponent(id)}/read`,
        { method: "POST" },
      );
    } catch {
      // ignore
    }
  }, []);

  // Polling fallback (Supabase realtime is primary in prod)
  React.useEffect(() => {
    if (hide) return;
    if (!threadId) return;

    let cancelled = false;
    const intervalMs = rtActive ? 60000 : open ? 3000 : 15000;

    const tick = async () => {
      if (cancelled) return;
      await fetchThread(threadId, { silent: true });
      if (open) await markRead(threadId);
    };

    void tick();
    const handle = window.setInterval(() => void tick(), intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(handle);
    };
  }, [fetchThread, hide, markRead, open, rtActive, threadId]);

  // Supabase realtime subscription (preferred)
  React.useEffect(() => {
    if (hide) return;
    if (!threadId) return;

    let alive = true;
    (async () => {
      const rt = await maybeRealtime(threadId);
      if (!alive || !rt) {
        setRtActive(false);
        return;
      }

      realtimeCleanupRef.current?.();
      setRtActive(true);
      realtimeCleanupRef.current = rt.subscribe(() => {
        void fetchThread(threadId, { silent: true });
        void markRead(threadId);
      });
    })();

    return () => {
      alive = false;
      realtimeCleanupRef.current?.();
      realtimeCleanupRef.current = null;
      setRtActive(false);
    };
  }, [fetchThread, hide, markRead, threadId]);

  React.useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length]);

  const ensureThread = React.useCallback(async (): Promise<string> => {
    if (threadId && isObjectIdLike(threadId)) return threadId;
    if (threadId && !isObjectIdLike(threadId)) {
      try {
        window.localStorage.removeItem(threadIdKey);
      } catch {}
      setThreadId("");
    }

    const name = nameInput.trim();
    const { res, json } = await postJson("/api/public/support/threads", {
      name: name || undefined,
    });
    if (!res.ok || !json?.ok || !json?.thread?.id) {
      throw new Error(json?.error ?? "Couldn’t start chat");
    }
    const id = String(json.thread.id);
    if (!isObjectIdLike(id)) throw new Error("Couldn’t start chat");
    setThreadId(id);
    try {
      window.localStorage.setItem(threadIdKey, id);
    } catch {
      // ignore
    }
    return id;
  }, [nameInput, threadId]);

  const sendTyping = React.useCallback(
    async (isTyping: boolean) => {
      if (!threadId || !isObjectIdLike(threadId)) return;
      try {
        await fetch(
          `/api/public/support/threads/${encodeURIComponent(threadId)}/typing`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isTyping }),
          },
        );
      } catch {
        // ignore
      }
    },
    [threadId],
  );

  const sendInvokeRef = React.useRef(0);
  const send = React.useCallback(async () => {
    const invokeId = ++sendInvokeRef.current;
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3494ff" },
      body: JSON.stringify({
        sessionId: "3494ff",
        location: "SupportChatWidget.tsx:send:entry",
        message: "send() invoked",
        data: { invokeId, sending, draftLen: draft.length, sendInFlight: sendInFlightRef.current },
        timestamp: Date.now(),
        hypothesisId: "A",
      }),
    }).catch(() => {});
    // #endregion
    if (sendInFlightRef.current) return;
    if (sending) return;
    const text = draft.trim();
    if (!text) return;

    sendInFlightRef.current = true;
    setError(null);
    setSending(true);

    const tmpId = `tmp_${++optimisticIdRef.current}`;
    const now = new Date().toISOString();
    setMessages((prev) => [
      ...prev,
      {
        id: tmpId,
        threadId: threadId || "tmp",
        from: "member",
        text,
        createdAt: now,
        pending: true,
      },
    ]);
    setDraft("");

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3494ff" },
      body: JSON.stringify({
        sessionId: "3494ff",
        location: "SupportChatWidget.tsx:send:beforeApi",
        message: "about to call postJson messages",
        data: { invokeId, tmpId, textLen: text.length },
        timestamp: Date.now(),
        hypothesisId: "B",
      }),
    }).catch(() => {});
    // #endregion
    try {
      const id = await ensureThread();
      const name = nameInput.trim();
      const email = emailInput.trim().toLowerCase();

      void sendTyping(false);

      const { res, json } = await postJson(
        `/api/public/support/threads/${encodeURIComponent(id)}/messages`,
        {
          text,
          email: isEmail(email) ? email : undefined,
          name: name || undefined,
        },
      );
      if (!res.ok || !json?.ok)
        throw new Error(json?.error ?? "Failed to send");

      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3494ff" },
        body: JSON.stringify({
          sessionId: "3494ff",
          location: "SupportChatWidget.tsx:send:postJsonOk",
          message: "postJson messages succeeded",
          data: { invokeId, id },
          timestamp: Date.now(),
          hypothesisId: "B",
        }),
      }).catch(() => {});
      // #endregion
      await fetchThread(id, { silent: true });
      await markRead(id);

      await broadcastRealtime(id, {
        kind: "message",
        threadId: id,
        at: Date.now(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
      setMessages((prev) => prev.filter((m) => m.id !== tmpId));
      setDraft(text);
    } finally {
      sendInFlightRef.current = false;
      setSending(false);
    }
  }, [
    sending,
    draft,
    threadId,
    ensureThread,
    nameInput,
    emailInput,
    sendTyping,
    fetchThread,
    markRead,
  ]);

  const onDraftChange = React.useCallback(
    (v: string) => {
      setDraft(v);
      if (!open || !threadId) return;
      void sendTyping(true);
      if (typingStopRef.current) window.clearTimeout(typingStopRef.current);
      typingStopRef.current = window.setTimeout(
        () => void sendTyping(false),
        1200,
      );
    },
    [open, sendTyping, threadId],
  );

  React.useEffect(() => {
    if (!open || !threadId) return;
    return () => {
      try {
        if (typingStopRef.current) window.clearTimeout(typingStopRef.current);
      } catch {
        // ignore
      }
      void sendTyping(false);
    };
  }, [open, sendTyping, threadId]);

  const dismissEmailPrompt = React.useCallback(() => {
    setEmailPromptDismissed(true);
    try {
      window.localStorage.setItem(emailPromptDismissedKey, "1");
    } catch {
      // ignore
    }
  }, []);

  // Always offer email (until saved or dismissed) once a thread exists.
  const canOfferEmail =
    Boolean(threadId) && !emailPromptDismissed && !thread?.email;

  if (hide) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close chat"
            className="fixed inset-0 z-39 bg-black/25 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "relative z-40 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-border bg-card",
              "shadow-[0_20px_70px_rgba(0,0,0,0.42)]",
            )}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <div className="font-serif text-base font-semibold leading-tight">
                  Chat
                </div>
                <div className="text-xs text-muted-foreground">
                  Minjae will reply soon.
                  {refreshing ? (
                    <span className="ml-2 opacity-70">Refreshing…</span>
                  ) : null}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-full p-0"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div
              ref={listRef}
              className="max-h-[50vh] space-y-3 overflow-y-auto px-4 py-3"
            >
              {!threadId ? (
                <div className="text-sm text-muted-foreground">
                  Send a message to start a conversation.
                </div>
              ) : null}

              {canOfferEmail ? (
                <div className="rounded-2xl border border-border bg-muted/30 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">Optional</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        일정 시간이 지나도 답변을 못받으면 민재가 바쁜것 같아요.
                        이메일을 남겨주시면 답변드릴게요 🙏😉
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full px-2"
                      onClick={dismissEmailPrompt}
                      aria-label="Dismiss"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="mt-3 grid gap-2">
                    <input
                      className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      inputMode="email"
                      autoComplete="email"
                    />
                    <input
                      className="h-10 rounded-xl border border-border bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Name (optional)"
                      autoComplete="name"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        className={cn(
                          "h-8 rounded-full px-3",
                          "bg-black text-white hover:bg-black/90 active:bg-black",
                        )}
                        onClick={() => {
                          try {
                            window.localStorage.setItem(
                              emailKey,
                              emailInput.trim().toLowerCase(),
                            );
                            window.localStorage.setItem(
                              nameKey,
                              nameInput.trim(),
                            );
                          } catch {
                            // ignore
                          }
                          void (async () => {
                            if (!threadId) return;
                            const email = emailInput.trim().toLowerCase();
                            const name = nameInput.trim();
                            await postJson(
                              `/api/public/support/threads/${encodeURIComponent(threadId)}/identity`,
                              {
                                email: isEmail(email) ? email : "",
                                name: name || "",
                              },
                            );
                            await fetchThread(threadId, { silent: true });
                          })();
                        }}
                        disabled={
                          Boolean(emailInput.trim()) &&
                          !isEmail(emailInput.trim().toLowerCase())
                        }
                      >
                        Save email
                      </Button>
                    </div>
                    {emailInput.trim() &&
                    !isEmail(emailInput.trim().toLowerCase()) ? (
                      <div className="text-xs text-muted-foreground">
                        Please enter a valid email.
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {messages.map((m) => {
                const mine = m.from === "member";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex",
                      mine ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[82%] rounded-2xl px-3 py-2 text-sm animate-[supportMsgIn_180ms_ease-out_both]",
                        mine
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/60 text-foreground",
                      )}
                    >
                      <div className="whitespace-pre-wrap leading-6">
                        {m.text}
                      </div>
                      <div
                        className={cn(
                          "mt-1 text-[11px] opacity-75 text-right",
                          mine
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {error ? (
                <div className="text-xs text-muted-foreground">{error}</div>
              ) : null}
            </div>

            <div className="border-t border-border p-3">
              {typing.support ? (
                <div className="mb-2 text-xs text-muted-foreground">
                  Minjae is typing…
                </div>
              ) : null}
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => onDraftChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      // #region agent log
                      fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3494ff" },
                        body: JSON.stringify({
                          sessionId: "3494ff",
                          location: "SupportChatWidget.tsx:onKeyDown:Enter",
                          message: "Enter key triggered send",
                          data: { sending, hasDraft: !!draft.trim() },
                          timestamp: Date.now(),
                          hypothesisId: "D",
                        }),
                      }).catch(() => {});
                      // #endregion
                      if (!sending && draft.trim()) void send();
                    }
                  }}
                  rows={2}
                  placeholder="Write a message…"
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-white px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                />
                <Button
                  size="sm"
                  className="h-11 w-11 rounded-xl p-0"
                  onClick={() => {
                    // #region agent log
                    fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3494ff" },
                      body: JSON.stringify({
                        sessionId: "3494ff",
                        location: "SupportChatWidget.tsx:SendButton:onClick",
                        message: "Send button clicked",
                        data: { sending, hasDraft: !!draft.trim() },
                        timestamp: Date.now(),
                        hypothesisId: "D",
                      }),
                    }).catch(() => {});
                    // #endregion
                    void send();
                  }}
                  disabled={sending || !draft.trim()}
                  aria-label="Send"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-(--shadow-chat) hover:brightness-95 active:brightness-90"
          aria-label="Open chat"
        >
          <MessageCircleMore className="size-6" />
          {unreadCount > 0 ? (
            <span
              className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
              style={{
                backgroundColor: "var(--included-2)",
                color: "var(--foreground)",
              }}
            >
              {unreadCount > 9 ? "9+" : String(unreadCount)}
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
