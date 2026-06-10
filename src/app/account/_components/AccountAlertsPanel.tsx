"use client";

import * as React from "react";
import { Bell, BellOff } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

type NotifItem = {
  id: string;
  broadcastId: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export function AccountAlertsPanel() {
  const [items, setItems] = React.useState<NotifItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [pushBusy, setPushBusy] = React.useState(false);
  const [pushLabel, setPushLabel] = React.useState<string>("브라우저 알림 받기");

  const load = React.useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/public/notifications?unreadOnly=0", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setItems([]);
        setMsg(String(json?.error ?? "알림을 불러오지 못했습니다."));
        return;
      }
      setItems(Array.isArray(json.data?.items) ? json.data.items : []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushLabel("이 브라우저는 푸시를 지원하지 않습니다");
      return;
    }
    navigator.serviceWorker.getRegistration("/sw-member-push.js").then((reg) => {
      if (!reg?.active) {
        setPushLabel("브라우저 알림 받기");
        return;
      }
      reg.pushManager.getSubscription().then((sub) => {
        setPushLabel(sub ? "브라우저 알림 사용 중" : "브라우저 알림 받기");
      });
    });
  }, []);

  async function enablePush() {
    setPushBusy(true);
    setMsg(null);
    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
      if (Notification.permission === "default" || Notification.permission === "denied") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          setMsg("알림 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.");
          return;
        }
      }
      const vapidRes = await fetch("/api/public/push/vapid");
      const vapidJson = await vapidRes.json().catch(() => ({}));
      const publicKey = vapidJson?.publicKey;
      if (!publicKey || typeof publicKey !== "string") {
        setMsg("푸시 설정(VAPID)이 없습니다.");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw-member-push.js", { scope: "/" });
      await navigator.serviceWorker.ready;
      const keyU8 = (() => {
        const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
        const base64 = (publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
        const raw = atob(base64);
        const out = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
        return out;
      })();
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyU8 });
      const subJson = sub.toJSON();
      const res = await fetch("/api/public/push/member-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setMsg(String(json?.error ?? "구독 저장 실패"));
        return;
      }
      setPushLabel("브라우저 알림 사용 중");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "푸시 등록 실패");
    } finally {
      setPushBusy(false);
    }
  }

  async function markAllRead() {
    const res = await fetch("/api/public/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ all: true }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) {
      setMsg(String(json?.error ?? "처리 실패"));
      return;
    }
    await load();
  }

  async function markOne(broadcastId: string) {
    const res = await fetch("/api/public/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ broadcastIds: [broadcastId] }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) return;
    await load();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>알림</CardTitle>
        <CardDescription>관리자가 보낸 공지와 브라우저 푸시(선택)를 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            새로고침
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void markAllRead()} disabled={loading}>
            모두 읽음
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => void enablePush()}
            disabled={pushBusy || pushLabel.includes("지원하지")}
          >
            {pushLabel.includes("사용 중") ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            {pushBusy ? "…" : pushLabel}
          </Button>
        </div>
        {msg ? <p className="text-sm text-rose-600">{msg}</p> : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">로딩 중…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">표시할 알림이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id} className="rounded-lg border border-border bg-muted/10 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="font-medium text-sm">{n.title}</div>
                  {!n.readAt ? (
                    <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0" onClick={() => void markOne(n.broadcastId)}>
                      읽음
                    </Button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground shrink-0">읽음</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{n.body}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
