"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type MeetingItem = {
  id: string;
  code: string;
  title: string;
  createdAt: string;
};

function meetingUrlFor(codeOrId: string) {
  const key = encodeURIComponent(codeOrId);
  if (typeof window === "undefined") return `/call/${key}`;
  return `${window.location.origin}/call/${key}`;
}

export default function AdminMeetingsView() {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<MeetingItem[]>([]);
  const [title, setTitle] = React.useState("");
  const [created, setCreated] = React.useState<MeetingItem | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/meetings", { cache: "no-store" });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) {
        setItems([]);
        return;
      }
      setItems((j.data?.items ?? []) as MeetingItem[]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load().catch(() => {});
  }, []);

  async function create() {
    setLoading(true);
    setCreated(null);
    try {
      const res = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) {
        alert(`Error: ${j?.error ?? `HTTP ${res.status}`}`);
        return;
      }
      const m = (j.data?.meeting ?? null) as MeetingItem | null;
      if (m) setCreated(m);
      setTitle("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded border p-4">
        <div className="font-medium mb-2">Open meeting link</div>
        <div className="text-sm text-muted-foreground">
          Anyone with the link can join (no booking required).
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional title (e.g. Demo call)"
          />
          <Button onClick={() => void create()} disabled={loading}>
            {loading ? "Creating…" : "Create link"}
          </Button>
        </div>

        {created ? (
          <div className="mt-3 rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="text-xs text-muted-foreground">New link</div>
            <div className="mt-1 font-mono break-all">
              {meetingUrlFor(created.code || created.id)}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className={copiedKey === created.id ? "bg-primary text-white" : ""}
                onClick={() =>
                  void copy(meetingUrlFor(created.code || created.id), created.id)
                }
              >
                {copiedKey === created.id ? "Copied" : "Copy"}
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href={`/call/${encodeURIComponent(created.code || created.id)}`}>
                  Open
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded border p-4">
        <div className="font-medium mb-2">Recent open meetings</div>
        {loading && items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No open meetings yet.</div>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 30).map((m) => {
              const key = m.code || m.id;
              const url = meetingUrlFor(key);
              return (
                <div key={m.id} className="rounded-md border border-border bg-card p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">
                        {m.title?.trim() ? m.title : "Open meeting"}
                      </div>
                      <div className="mt-1 font-mono text-xs break-all text-muted-foreground">
                        {url}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className={copiedKey === m.id ? "bg-primary text-white" : ""}
                        onClick={() => void copy(url, m.id)}
                      >
                        {copiedKey === m.id ? "Copied" : "Copy"}
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/call/${encodeURIComponent(key)}`}>Open</Link>
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Created {new Date(m.createdAt).toLocaleString("en-US")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

