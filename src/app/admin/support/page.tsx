"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ThreadListItem = {
  id: string;
  status: "open" | "closed";
  email: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  unread: boolean;
  lastMessage: null | {
    from: "member" | "support";
    text: string;
    createdAt: string;
  };
};

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
};

type TypingState = { member: boolean; support: boolean };

function formatWhen(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleString([], {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

async function getJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { res, json };
}

async function maybeSubscribe(
  threadId: string,
  onEvent: () => void,
): Promise<null | (() => void)> {
  try {
    const mod = await import("@/lib/supabaseClient");
    const supabase = (mod as any)?.supabase;
    if (!supabase) return null;

    const channelName = `support_thread_${threadId}`;
    const channel = supabase.channel(channelName);
    channel.on("broadcast", { event: "support" }, () => onEvent());
    channel.subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  } catch {
    return null;
  }
}

async function maybeSubscribeInbox(onEvent: () => void): Promise<null | (() => void)> {
  try {
    const mod = await import("@/lib/supabaseClient");
    const supabase = (mod as any)?.supabase;
    if (!supabase) return null;

    const channel = supabase.channel("support_inbox");
    channel.on("broadcast", { event: "support" }, () => onEvent());
    channel.subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore
      }
    };
  } catch {
    return null;
  }
}

export default function AdminSupportPage() {
  const [threads, setThreads] = React.useState<ThreadListItem[]>([]);
  const [threadsLoading, setThreadsLoading] = React.useState(false);
  const [threadsError, setThreadsError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string>("");

  const [thread, setThread] = React.useState<SupportThread | null>(null);
  const [messages, setMessages] = React.useState<SupportMessage[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [chatError, setChatError] = React.useState<string | null>(null);
  const [reply, setReply] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [typing, setTyping] = React.useState<TypingState>({
    member: false,
    support: false,
  });
  const typingStopRef = React.useRef<number | null>(null);

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const unsubscribeRef = React.useRef<null | (() => void)>(null);
  const unsubscribeInboxRef = React.useRef<null | (() => void)>(null);
  const [rtInboxActive, setRtInboxActive] = React.useState(false);

  const loadThreads = React.useCallback(async () => {
    setThreadsLoading(true);
    setThreadsError(null);
    try {
      const { res, json } = await getJson("/api/admin/support/threads");
      if (!res.ok || !json?.ok)
        throw new Error(json?.error ?? "Failed to load threads");
      const items = (json.threads as ThreadListItem[]) ?? [];
      setThreads(Array.isArray(items) ? items : []);

      if (!selectedId && items?.[0]?.id) setSelectedId(items[0].id);
    } catch (e) {
      setThreadsError(
        e instanceof Error ? e.message : "Failed to load threads",
      );
      setThreads([]);
    } finally {
      setThreadsLoading(false);
    }
  }, [selectedId]);

  const loadThread = React.useCallback(async (id: string) => {
    if (!id) return;
    setRefreshing(true);
    try {
      const { res, json } = await getJson(
        `/api/admin/support/threads/${encodeURIComponent(id)}`,
      );
      if (!res.ok || !json?.ok)
        throw new Error(json?.error ?? "Failed to load thread");
      const nextThread = json.thread as SupportThread;
      setThread((prev) =>
        prev?.updatedAt === nextThread.updatedAt &&
        prev?.email === nextThread.email &&
        prev?.name === nextThread.name
          ? prev
          : nextThread,
      );
      const msgs = (json.messages as SupportMessage[]) ?? [];
      const nextMsgs = Array.isArray(msgs) ? msgs : [];
      setMessages((prev) => {
        const prevLast = prev[prev.length - 1]?.id ?? "";
        const nextLast = nextMsgs[nextMsgs.length - 1]?.id ?? "";
        if (prev.length === nextMsgs.length && prevLast === nextLast)
          return prev;
        return nextMsgs;
      });
      const ty = (json.typing as TypingState) ?? {
        member: false,
        support: false,
      };
      if (typeof ty?.member === "boolean" && typeof ty?.support === "boolean")
        setTyping(ty);
      await postJson(
        `/api/admin/support/threads/${encodeURIComponent(id)}/read`,
      );
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Failed to load thread");
      setThread(null);
      setMessages([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    void loadThreads();
    const handle = window.setInterval(
      () => void loadThreads(),
      rtInboxActive ? 60000 : 15000,
    );
    return () => window.clearInterval(handle);
  }, [loadThreads, rtInboxActive]);

  React.useEffect(() => {
    if (!selectedId) return;
    void loadThread(selectedId);
    const handle = window.setInterval(() => void loadThread(selectedId), 60000);
    return () => window.clearInterval(handle);
  }, [loadThread, selectedId]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      unsubscribeInboxRef.current?.();
      unsubscribeInboxRef.current = null;
      const unsub = await maybeSubscribeInbox(() => void loadThreads());
      if (!alive) return;
      if (unsub) {
        unsubscribeInboxRef.current = unsub;
        setRtInboxActive(true);
      } else {
        setRtInboxActive(false);
      }
    })();
    return () => {
      alive = false;
      unsubscribeInboxRef.current?.();
      unsubscribeInboxRef.current = null;
      setRtInboxActive(false);
    };
  }, [loadThreads]);

  React.useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    (async () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
      const unsub = await maybeSubscribe(
        selectedId,
        () => void loadThread(selectedId),
      );
      if (!alive) return;
      if (unsub) unsubscribeRef.current = unsub;
    })();
    return () => {
      alive = false;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [loadThread, selectedId]);

  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const filtered = React.useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return threads;
    return threads.filter((t) =>
      `${t.email} ${t.name} ${t.lastMessage?.text ?? ""}`
        .toLowerCase()
        .includes(qq),
    );
  }, [q, threads]);

  const sendTyping = React.useCallback(
    async (isTyping: boolean) => {
      if (!selectedId) return;
      try {
        await fetch(
          `/api/admin/support/threads/${encodeURIComponent(selectedId)}/typing`,
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
    [selectedId],
  );

  const send = React.useCallback(async () => {
    if (!selectedId) return;
    const text = reply.trim();
    if (!text) return;
    if (sending) return;

    setSending(true);
    setChatError(null);
    try {
      void sendTyping(false);
      const { res, json } = await postJson(
        `/api/admin/support/threads/${encodeURIComponent(selectedId)}/messages`,
        { text },
      );
      if (!res.ok || !json?.ok)
        throw new Error(json?.error ?? "Failed to send");
      setReply("");
      await loadThread(selectedId);

      // Broadcast a lightweight realtime event (if supabase is configured).
      try {
        const mod = await import("@/lib/supabaseClient");
        const supabase = (mod as any)?.supabase;
        if (supabase) {
          const ch1 = supabase.channel(`support_thread_${selectedId}`);
          const ch2 = supabase.channel("support_inbox");
          await Promise.all([
            ch1.send({ type: "broadcast", event: "support", payload: { kind: "message", at: Date.now() } }),
            ch2.send({ type: "broadcast", event: "support", payload: { kind: "message", at: Date.now() } }),
          ]);
          try { supabase.removeChannel(ch1); } catch {}
          try { supabase.removeChannel(ch2); } catch {}
        }
      } catch {
        // ignore
      }
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }, [loadThread, reply, selectedId, sendTyping, sending]);

  const onReplyChange = React.useCallback(
    (v: string) => {
      setReply(v);
      if (!selectedId) return;
      void sendTyping(true);
      if (typingStopRef.current) window.clearTimeout(typingStopRef.current);
      typingStopRef.current = window.setTimeout(
        () => void sendTyping(false),
        1200,
      );
    },
    [selectedId, sendTyping],
  );

  React.useEffect(() => {
    if (!selectedId) return;
    return () => {
      try {
        if (typingStopRef.current) window.clearTimeout(typingStopRef.current);
      } catch {
        // ignore
      }
      void sendTyping(false);
    };
  }, [selectedId, sendTyping]);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold tracking-wide text-primary">
            Admin
          </div>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            Support inbox
          </h1>
          <div className="mt-2 text-sm text-muted-foreground">
            Reply to member messages from the site widget.
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search email, name, message…"
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Threads</div>
            <div className="text-xs text-muted-foreground">
              {threadsLoading ? "Loading…" : `${filtered.length}`}
            </div>
          </div>
          {threadsError ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {threadsError}
            </div>
          ) : null}
          <div className="max-h-[70vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No threads.
              </div>
            ) : (
              filtered.map((t) => {
                const active = t.id === selectedId;
                const title = t.name?.trim() || t.email?.trim() || "Guest";
                const preview = t.lastMessage?.text ?? "";
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      "w-full border-b border-border px-4 py-3 text-left transition",
                      active ? "bg-muted/40" : "hover:bg-muted/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-semibold">
                        {title}
                      </div>
                      {t.unread ? (
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          style={{
                            backgroundColor: "var(--included-2)",
                            color: "var(--foreground)",
                          }}
                        >
                          New
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {preview}
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {formatWhen(t.updatedAt)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Conversation</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {thread ? (
                <>
                  {thread.name?.trim() || thread.email?.trim() || "Guest"} ·{" "}
                  <span className="capitalize">{thread.status}</span>
                  {refreshing ? (
                    <span className="ml-2 opacity-70">Refreshing…</span>
                  ) : null}
                </>
              ) : (
                "Select a thread."
              )}
            </div>
          </div>

          <div
            ref={listRef}
            className="max-h-[60vh] space-y-3 overflow-y-auto px-4 py-3"
          >
            {chatError ? (
              <div className="text-sm text-muted-foreground">{chatError}</div>
            ) : null}
            {messages.map((m) => {
              const mine = m.from === "support";
              return (
                <div
                  key={m.id}
                  className={cn("flex", mine ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-3 py-2 text-sm animate-[supportMsgIn_180ms_ease-out_both]",
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-included-2 text-foreground",
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
                      {formatWhen(m.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border p-3">
            {typing.member ? (
              <div className="mb-2 text-xs text-muted-foreground">
                Member is typing…
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <textarea
                value={reply}
                onChange={(e) => onReplyChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!sending && reply.trim()) void send();
                  }
                }}
                rows={2}
                placeholder={selectedId ? "Reply…" : "Select a thread to reply"}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                disabled={!selectedId || sending}
              />
              <Button
                size="sm"
                className="h-11 rounded-xl"
                onClick={() => void send()}
                disabled={!selectedId || sending || !reply.trim()}
              >
                {sending ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
