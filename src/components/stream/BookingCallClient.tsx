"use client";

import Link from "next/link";
import * as React from "react";

import {
  Video,
  Mic,
  Volume2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DateTime } from "luxon";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useMockSession } from "@/lib/mock/MockSessionProvider";
import { supabase } from "@/lib/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Role = "student" | "teacher";

type Props = {
  bookingId: string;
  role: Role;
  teacherKeyRequired?: boolean;
  openMeeting?: boolean;
  allowGuests?: boolean;
};

type SessionResponse =
  | {
      ok: true;
      roomId: string;
      channelName: string;
      signalingToken: string;
      iceServers: RTCIceServer[];
    }
  | { ok: false; error: string; data?: unknown };

type TurnResponse =
  | { ok: true; iceServers: RTCIceServer[] }
  | { ok: false; error: string };

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function extractErrorMessage(v: unknown): string | null {
  const r = asRecord(v);
  if (!r) return null;
  const e = r.error;
  if (typeof e === "string") return e;
  if (e != null) return String(e);
  return null;
}

async function fetchSession(args: {
  bookingId: string;
  role: Role;
  email?: string;
  studentId?: string;
  teacherKey?: string;
  displayName?: string;
}): Promise<SessionResponse> {
  const res = await fetch("/api/stream/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(args.teacherKey ? { "x-teacher-key": args.teacherKey } : {}),
    },
    body: JSON.stringify({
      bookingId: args.bookingId,
      role: args.role,
      email: args.email,
      studentId: args.studentId,
      ...(args.displayName ? { displayName: args.displayName } : {}),
    }),
  });
  const json = (await res.json().catch(() => null)) as SessionResponse | null;
  if (!res.ok || !json)
    return {
      ok: false,
      error: extractErrorMessage(json) ?? `HTTP ${res.status}`,
    };
  return json;
}

async function fetchTurn(args: {
  bookingId: string;
  role: Role;
  email?: string;
  studentId?: string;
  teacherKey?: string;
}): Promise<TurnResponse> {
  const res = await fetch("/api/stream/turn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(args.teacherKey ? { "x-teacher-key": args.teacherKey } : {}),
    },
    body: JSON.stringify({
      bookingId: args.bookingId,
      role: args.role,
      email: args.email,
      studentId: args.studentId,
    }),
  });
  const json = (await res.json().catch(() => null)) as TurnResponse | null;
  if (!res.ok || !json)
    return {
      ok: false,
      error: extractErrorMessage(json) ?? `HTTP ${res.status}`,
    };
  return json;
}

// NOTE: We intentionally use `any` here to preserve arbitrary function signatures.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

function useEvent<T extends AnyFn>(fn: T): T {
  const ref = React.useRef(fn);
  React.useEffect(() => {
    ref.current = fn;
  }, [fn]);
  return React.useCallback(
    (...args: Parameters<T>) => ref.current(...args),
    [],
  ) as unknown as T;
}

function stopStream(s: MediaStream | null) {
  if (!s) return;
  for (const t of s.getTracks()) t.stop();
}

export function BookingCallClient({
  bookingId,
  role,
  teacherKeyRequired,
  openMeeting,
  allowGuests,
}: Props) {
  const session = useMockSession();
  const isOpenMeeting = Boolean(openMeeting);
  const guestsAllowed = Boolean(allowGuests);

  const localStudentId = React.useMemo(() => {
    try {
      if (typeof window === "undefined") return "";
      const authUserId =
        (session.state.user as { id?: string } | null)?.id ?? "";
      const email = (session.state.user?.email ?? "").trim().toLowerCase();
      const key = authUserId.trim()
        ? `mj_student_id_${authUserId.trim()}`
        : email
          ? `mj_student_id_${email}`
          : "mj_student_id";
      return (window.localStorage.getItem(key) ?? "").trim();
    } catch {
      return "";
    }
  }, [session.state.user]);

  const [teacherKey, setTeacherKey] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Lobby state
  const [camOn, setCamOn] = React.useState(true);
  const [micOn, setMicOn] = React.useState(true);
  const [devices, setDevices] = React.useState<{
    cams: MediaDeviceInfo[];
    mics: MediaDeviceInfo[];
  } | null>(null);
  const [camId, setCamId] = React.useState<string>("");
  const [micId, setMicId] = React.useState<string>("");
  const [preview, setPreview] = React.useState<MediaStream | null>(null);
  const previewRef = React.useRef<HTMLVideoElement | null>(null);

  // In-call state
  const [phase, setPhase] = React.useState<
    "lobby" | "connecting" | "in_call" | "ended"
  >("lobby");
  const [remoteStream, setRemoteStream] = React.useState<MediaStream | null>(
    null,
  );
  const remoteRef = React.useRef<HTMLVideoElement | null>(null);
  const localInCallRef = React.useRef<HTMLVideoElement | null>(null);

  const [messages, setMessages] = React.useState<
    Array<{ from: Role; text: string; at: number }>
  >([]);
  const [chatText, setChatText] = React.useState("");

  const channelRef = React.useRef<RealtimeChannel | null>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);
  const signalingTokenRef = React.useRef<string>("");
  const turnFallbackAttemptedRef = React.useRef(false);
  const iceFailureTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const title = isOpenMeeting
    ? "Open meeting"
    : role === "teacher"
      ? "Waiting Room (Partner)"
      : "Waiting Room";
  const canProceedStudent =
    role !== "student" || guestsAllowed || Boolean(session.state.user?.email);
  const studentEmail = session.state.user?.email ?? "";
  const [guestName, setGuestName] = React.useState("");

  React.useEffect(() => {
    if (!guestsAllowed) return;
    try {
      const saved =
        window.localStorage.getItem("mj_open_meeting_guest_name") ?? "";
      if (saved.trim()) setGuestName(saved.trim());
    } catch {
      // ignore
    }
  }, [guestsAllowed]);

  React.useEffect(() => {
    if (!guestsAllowed) return;
    try {
      const v = guestName.trim();
      if (v) window.localStorage.setItem("mj_open_meeting_guest_name", v);
    } catch {
      // ignore
    }
  }, [guestName, guestsAllowed]);

  const displayNameForSession = React.useMemo(() => {
    const signedInName = session.state.user?.name?.trim() ?? "";
    if (signedInName) return signedInName;
    const gn = guestName.trim();
    if (gn) return gn;
    return role === "teacher" ? "Partner" : "Guest";
  }, [guestName, role, session.state.user?.name]);

  function relativeTimeAgo(ts: number) {
    const diffMs = Date.now() - ts;
    if (!Number.isFinite(diffMs)) return "";
    if (diffMs < 20_000) return "just now";
    const min = Math.floor(diffMs / 60_000);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.floor(hr / 24);
    return `${d}d ago`;
  }

  const chatStorageKey = React.useMemo(
    () => `mj_call_last_chat_${bookingId}`,
    [bookingId],
  );
  const [lastChat, setLastChat] = React.useState<
    Array<{ from: Role; text: string; at: number }>
  >([]);
  const [lastChatSavedAt, setLastChatSavedAt] = React.useState<number | null>(
    null,
  );

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(chatStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      const obj =
        parsed && typeof parsed === "object"
          ? (parsed as Record<string, unknown>)
          : null;
      const items = Array.isArray(obj?.items) ? (obj!.items as any[]) : [];
      const savedAt =
        typeof obj?.savedAt === "number" ? (obj.savedAt as number) : null;
      const normalized = items
        .map((m) => {
          const r =
            m && typeof m === "object" ? (m as Record<string, unknown>) : {};
          const from =
            r.from === "teacher" || r.from === "student"
              ? (r.from as Role)
              : null;
          const text = typeof r.text === "string" ? r.text : "";
          const at = typeof r.at === "number" ? r.at : 0;
          if (!from || !text || !Number.isFinite(at)) return null;
          return { from, text, at };
        })
        .filter(Boolean) as Array<{ from: Role; text: string; at: number }>;
      setLastChat(normalized.slice(-12));
      setLastChatSavedAt(savedAt);
    } catch {
      // ignore
    }
  }, [chatStorageKey]);

  React.useEffect(() => {
    try {
      const payload = { savedAt: Date.now(), items: messages.slice(-30) };
      window.localStorage.setItem(chatStorageKey, JSON.stringify(payload));
      setLastChat(payload.items.slice(-12));
      setLastChatSavedAt(payload.savedAt);
    } catch {
      // ignore
    }
  }, [chatStorageKey, messages]);

  // Booking slot time (start/end) for display
  const [slotInfo, setSlotInfo] = React.useState<{
    startTimeLabel: string;
    endTimeLabel: string;
  } | null>(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch(`/api/public/booking/${encodeURIComponent(bookingId)}`)
      .then((r) => r.json().catch(() => null))
      .then((j) => {
        if (cancelled || !j?.ok || !j.startTimeLabel) return;
        setSlotInfo({
          startTimeLabel: j.startTimeLabel,
          endTimeLabel: j.endTimeLabel ?? "",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  // Mic level for test UI (0–100)
  const [micLevel, setMicLevel] = React.useState(0);
  const micLevelRef = React.useRef<number>(0);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    const stream = preview;
    if (!stream || stream.getAudioTracks().length === 0) {
      setMicLevel(0);
      return;
    }
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    audioContextRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    src.connect(analyser);
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const tick = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      const avg = bufferLength > 0 ? sum / bufferLength : 0;
      const level = Math.min(100, Math.round((avg / 255) * 100 * 2));
      micLevelRef.current = level;
      setMicLevel(level);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      try {
        ctx.close();
      } catch {}
      audioContextRef.current = null;
      analyserRef.current = null;
      setMicLevel(0);
    };
  }, [preview]);

  // Persist teacher key locally for convenience.
  React.useEffect(() => {
    if (role !== "teacher") return;
    try {
      const saved = window.localStorage.getItem("mj_stream_teacher_key") ?? "";
      setTeacherKey(saved);
    } catch {
      // ignore
    }
  }, [role]);

  React.useEffect(() => {
    if (role !== "teacher") return;
    try {
      window.localStorage.setItem("mj_stream_teacher_key", teacherKey);
    } catch {
      // ignore
    }
  }, [role, teacherKey]);

  const refreshDevices = useEvent(async () => {
    const list = await navigator.mediaDevices.enumerateDevices();
    const cams = list.filter((d) => d.kind === "videoinput");
    const mics = list.filter((d) => d.kind === "audioinput");
    setDevices({ cams, mics });
    if (!camId && cams[0]?.deviceId) setCamId(cams[0].deviceId);
    if (!micId && mics[0]?.deviceId) setMicId(mics[0].deviceId);
  });

  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [micError, setMicError] = React.useState<string | null>(null);

  const [logs, setLogs] = React.useState<string[]>([]);
  const addLog = React.useCallback((msg: string) => {
    const t = new Date().toISOString().slice(11, 23);
    const line = `[${t}] ${msg}`;
    setLogs((prev) => [...prev.slice(-49), line]);
    console.log("[BookingCall]", msg);
  }, []);

  function mergePreviewWithStream(
    nextStream: MediaStream,
    kind: "video" | "audio",
  ) {
    const tracks = nextStream.getTracks();
    setPreview((prev) => {
      const out = new MediaStream();
      if (prev) {
        for (const t of prev.getTracks()) if (t.kind !== kind) out.addTrack(t);
        for (const t of prev.getTracks()) if (t.kind === kind) t.stop();
      }
      for (const t of tracks) out.addTrack(t);
      return out;
    });
  }

  const requestCamera = useEvent(async () => {
    setCameraError(null);
    const constraints = {
      video: camOn ? (camId ? { deviceId: { exact: camId } } : true) : false,
      audio: false,
    };
    addLog(`Request camera: video=${String(constraints.video)}`);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      addLog(`Camera granted: streamId=${stream.id}`);
      mergePreviewWithStream(stream, "video");
      await refreshDevices();
    } catch (e) {
      const err = e as DOMException & { name?: string; message?: string };
      addLog(
        `Camera denied: name=${err?.name ?? "?"} message=${err?.message ?? String(e)}`,
      );
      console.error("[BookingCall] camera error", e);
      setCameraError(err?.message ?? "Camera permission denied.");
    }
  });

  const requestMic = useEvent(async () => {
    setMicError(null);
    const constraints = {
      video: false,
      audio: micOn ? (micId ? { deviceId: { exact: micId } } : true) : false,
    };
    addLog(`Request microphone: audio=${String(constraints.audio)}`);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      addLog(`Microphone granted: streamId=${stream.id}`);
      mergePreviewWithStream(stream, "audio");
      await refreshDevices();
    } catch (e) {
      const err = e as DOMException & { name?: string; message?: string };
      addLog(
        `Microphone denied: name=${err?.name ?? "?"} message=${err?.message ?? String(e)}`,
      );
      console.error("[BookingCall] mic error", e);
      setMicError(err?.message ?? "Microphone permission denied.");
    }
  });

  const startPreview = useEvent(async () => {
    setCameraError(null);
    setMicError(null);
    const constraints = {
      video: camOn ? (camId ? { deviceId: { exact: camId } } : true) : false,
      audio: micOn ? (micId ? { deviceId: { exact: micId } } : true) : false,
    };
    addLog(
      `Request media (combined): video=${String(constraints.video)} audio=${String(constraints.audio)}`,
    );
    stopStream(preview);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      addLog(
        `Media granted: videoTracks=${stream.getVideoTracks().length} audioTracks=${stream.getAudioTracks().length}`,
      );
      setPreview(stream);
      await refreshDevices();
    } catch (e) {
      const err = e as DOMException & { name?: string; message?: string };
      addLog(
        `Media denied: name=${err?.name ?? "?"} message=${err?.message ?? String(e)}`,
      );
      console.error("[BookingCall] getUserMedia error", e);
      setCameraError(err?.message ?? "Permission denied.");
      setMicError(err?.message ?? "Permission denied.");
    }
  });

  const hasCamera = Boolean(preview?.getVideoTracks().length);
  const hasMic = Boolean(preview?.getAudioTracks().length);
  const hasBlocked = Boolean(cameraError || micError);

  // Speaker test (simple beep)
  const speakerQuotes = React.useMemo(
    () => [
      "Small steps, every day.",
      "You’re closer than you think.",
      "Slow is smooth. Smooth is fast.",
      "Be kind to yourself.",
      "One more try. You’ve got this.",
      "Progress, not perfection.",
      "Breathe. Then begin again.",
      "Make it simple. Make it work.",
      "A calm mind is a superpower.",
      "Show up. That’s the win.",
    ],
    [],
  );
  const [speakerLine, setSpeakerLine] = React.useState("Test speaker");

  const playSpeakerTest = React.useCallback(() => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440;
      gain.gain.value = 0.06;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
          ctx.close();
        } catch {}
      }, 250);
      const quote =
        speakerQuotes[Math.floor(Math.random() * speakerQuotes.length)] ??
        "Test speaker";
      setSpeakerLine(quote);
      addLog(`Speaker test: played beep · "${quote}"`);
    } catch (e) {
      addLog(
        `Speaker test failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }, [addLog, speakerQuotes]);

  // Teacher waiting presence (teacher toggles; student polls every 5s)
  const [teacherWaiting, setTeacherWaiting] = React.useState(false);
  const [teacherLastSeenISO, setTeacherLastSeenISO] = React.useState<
    string | null
  >(null);
  const [waitingEnabled, setWaitingEnabled] = React.useState(
    () => role === "teacher" && !isOpenMeeting,
  );

  const postWaitingOnce = React.useCallback(async () => {
    const key = teacherKey.trim();
    if (!key) {
      addLog("Waiting keepalive skipped: missing teacher key");
      return false;
    }
    const res = await fetch("/api/stream/waiting", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-teacher-key": key },
      body: JSON.stringify({ bookingId }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok || !j?.ok) {
      addLog(`Waiting keepalive failed: ${j?.error ?? `HTTP ${res.status}`}`);
      return false;
    }
    addLog("Waiting keepalive: ok");
    return true;
  }, [addLog, bookingId, teacherKey]);

  React.useEffect(() => {
    if (isOpenMeeting) return;
    if (role !== "teacher") return;
    const shouldKeepalive =
      waitingEnabled || phase === "connecting" || phase === "in_call";
    if (!shouldKeepalive) return;
    let alive = true;
    postWaitingOnce().catch(() => {});
    const id = window.setInterval(() => {
      if (!alive) return;
      postWaitingOnce().catch(() => {});
    }, 5000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [isOpenMeeting, phase, postWaitingOnce, role, waitingEnabled]);

  React.useEffect(() => {
    if (isOpenMeeting) return;
    if (role !== "student") return;
    let cancelled = false;
    async function poll() {
      const res = await fetch(
        `/api/stream/waiting?bookingId=${encodeURIComponent(bookingId)}`,
        { cache: "no-store" },
      );
      const j = await res.json().catch(() => null);
      if (cancelled) return;
      if (res.ok && j?.ok) {
        setTeacherWaiting(Boolean(j.data?.waiting));
        setTeacherLastSeenISO(
          typeof j.data?.lastSeenISO === "string" ? j.data.lastSeenISO : null,
        );
      } else {
        setTeacherWaiting(false);
        setTeacherLastSeenISO(null);
      }
    }
    poll().catch(() => {});
    const id = window.setInterval(() => poll().catch(() => {}), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [bookingId, role]);

  const joinBlockedByTeacher =
    !isOpenMeeting && role === "student" && !teacherWaiting;
  const joinBlockedByMedia = !hasCamera || !hasMic;
  const joinDisabled = loading || joinBlockedByTeacher || joinBlockedByMedia;

  const joinButtonLabel = React.useMemo(() => {
    if (loading) return "Connecting…";
    if (joinBlockedByTeacher) return "Partner isn’t here yet";
    if (!hasCamera) return "Camera is not ready";
    if (!hasMic) return "Mic is not ready";
    return "Enter room";
  }, [hasCamera, hasMic, joinBlockedByTeacher, loading]);

  // Ask for permissions immediately on entry (best-effort; some browsers require a click)
  const [autoPermissionAttempted, setAutoPermissionAttempted] =
    React.useState(false);
  React.useEffect(() => {
    if (phase !== "lobby") return;
    if (autoPermissionAttempted) return;
    setAutoPermissionAttempted(true);
    addLog("Auto permission request (lobby entry)");
    startPreview().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  React.useEffect(() => {
    if (previewRef.current) previewRef.current.srcObject = preview;
  }, [preview]);

  React.useEffect(() => {
    if (phase !== "in_call") return;
    if (localInCallRef.current) localInCallRef.current.srcObject = preview;
  }, [phase, preview]);

  React.useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const cleanup = useEvent(() => {
    setPhase("ended");
    try {
      channelRef.current?.unsubscribe();
    } catch {}
    channelRef.current = null;

    if (iceFailureTimeoutRef.current) {
      clearTimeout(iceFailureTimeoutRef.current);
      iceFailureTimeoutRef.current = null;
    }

    try {
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;

    stopStream(preview);
    setPreview(null);
    stopStream(remoteStream);
    setRemoteStream(null);
  });

  React.useEffect(() => cleanup, [cleanup]);

  const sendSignal = useEvent((data: { [k: string]: unknown }) => {
    const channel = channelRef.current;
    if (!channel) return;
    channel.send({
      type: "broadcast",
      event: "signal",
      payload: { ...data, token: signalingTokenRef.current },
    });
  });

  const sendChat = useEvent((text: string) => {
    const channel = channelRef.current;
    if (!channel) return;
    channel.send({
      type: "broadcast",
      event: "chat",
      payload: { text, from: role, token: signalingTokenRef.current },
    });
  });

  const makePeerConnection = useEvent((iceServers: RTCIceServer[]) => {
    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;

    pc.onicecandidate = (ev) => {
      if (ev.candidate)
        sendSignal({ kind: "candidate", candidate: ev.candidate });
    };

    pc.ontrack = (ev) => {
      setRemoteStream((prev) => {
        const next = prev ?? new MediaStream();
        next.addTrack(ev.track);
        return next;
      });
    };

    // Monitor ICE connection state for fallback
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      if (state === "connected" || state === "completed") {
        if (iceFailureTimeoutRef.current) {
          clearTimeout(iceFailureTimeoutRef.current);
          iceFailureTimeoutRef.current = null;
        }
        turnFallbackAttemptedRef.current = false;
        return;
      }

      if (
        (state === "failed" || state === "disconnected") &&
        !turnFallbackAttemptedRef.current
      ) {
        // Wait a bit to see if it recovers, then trigger fallback
        if (iceFailureTimeoutRef.current)
          clearTimeout(iceFailureTimeoutRef.current);
        iceFailureTimeoutRef.current = setTimeout(() => {
          if (
            pc.iceConnectionState === "failed" ||
            pc.iceConnectionState === "disconnected"
          ) {
            triggerTurnFallback();
          }
        }, 3000);
      }
    };

    return pc;
  });

  const triggerTurnFallback = useEvent(async () => {
    if (turnFallbackAttemptedRef.current) return;
    turnFallbackAttemptedRef.current = true;

    const pc = pcRef.current;
    if (!pc) return;

    // Notify peer via Supabase
    const channel = channelRef.current;
    if (channel) {
      channel.send({
        type: "broadcast",
        event: "need_turn",
        payload: { token: signalingTokenRef.current },
      });
    }

    // Fetch TURN servers
    const turnResp = await fetchTurn({
      bookingId,
      role,
      email: role === "student" ? studentEmail || undefined : undefined,
      studentId: role === "student" ? localStudentId || undefined : undefined,
      teacherKey: role === "teacher" ? teacherKey.trim() : undefined,
    });

    if (!turnResp.ok) {
      setError("Failed to get TURN servers for fallback");
      return;
    }

    // Combine STUN + TURN
    const stunServers =
      pc.getConfiguration().iceServers?.filter((s) => {
        const urls = s.urls;
        const list =
          typeof urls === "string" ? [urls] : Array.isArray(urls) ? urls : [];
        return list.some((u) => typeof u === "string" && u.startsWith("stun:"));
      }) ?? [];
    const combinedServers = [...stunServers, ...turnResp.iceServers];

    // Update ICE configuration
    pc.setConfiguration({ iceServers: combinedServers });

    // Teacher initiates ICE restart
    if (role === "teacher") {
      try {
        const offer = await pc.createOffer({ iceRestart: true });
        await pc.setLocalDescription(offer);
        sendSignal({ kind: "sdp", description: pc.localDescription });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to restart ICE");
      }
    }
  });

  const join = async () => {
    setError(null);
    setLoading(true);
    setPhase("connecting");
    turnFallbackAttemptedRef.current = false;
    addLog("Join clicked");

    try {
      if (role === "teacher" && teacherKeyRequired && !teacherKey.trim()) {
        addLog("Join blocked: missing partner key");
        setError("Partner key is required.");
        setPhase("lobby");
        return;
      }

      addLog("Requesting session…");
      const resp = await fetchSession({
        bookingId,
        role,
        email: role === "student" ? studentEmail || undefined : undefined,
        studentId: role === "student" ? localStudentId || undefined : undefined,
        teacherKey: role === "teacher" ? teacherKey.trim() : undefined,
        displayName: isOpenMeeting ? displayNameForSession : undefined,
      });
      if (!resp.ok) {
        addLog(`Session failed: ${resp.error}`);
        setError(resp.error);
        setPhase("lobby");
        return;
      }
      addLog("Session OK");

      const { channelName, signalingToken, iceServers } = resp;
      signalingTokenRef.current = signalingToken;

      // Create STUN-only peer connection
      const pc = makePeerConnection(iceServers);

      // Local media (if not granted earlier, Join may trigger getUserMedia → Permission denied)
      let local: MediaStream;
      if (preview) {
        local = preview;
      } else {
        addLog("Requesting local media (Join)…");
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: camOn,
            audio: micOn,
          });
          addLog(`Local media OK: streamId=${stream.id}`);
          setPreview(stream);
          local = stream;
        } catch (e) {
          const err = e as DOMException & { name?: string; message?: string };
          addLog(
            `Local media failed: ${err?.name ?? "?"} ${err?.message ?? String(e)}`,
          );
          console.error("[BookingCall] join getUserMedia error", e);
          setError(err?.message ?? "Permission denied");
          setPhase("lobby");
          return;
        }
      }
      for (const t of local.getTracks()) pc.addTrack(t, local);

      // Subscribe to Supabase Realtime channel
      const channel = supabase.channel(channelName);
      channelRef.current = channel;

      let peerJoined = false;

      channel
        .on("broadcast", { event: "hello" }, (payload) => {
          const token = asRecord(payload.payload)?.token;
          if (token !== signalingToken) return; // Ignore messages without valid token

          if (!peerJoined) {
            peerJoined = true;
            // Teacher initiates offer when peer joins
            if (role === "teacher") {
              pc.createOffer()
                .then((offer) => pc.setLocalDescription(offer))
                .then(() =>
                  sendSignal({ kind: "sdp", description: pc.localDescription }),
                )
                .catch((e) =>
                  setError(
                    e instanceof Error ? e.message : "Failed to create offer",
                  ),
                );
            }
          }
        })
        .on("broadcast", { event: "signal" }, async (payload) => {
          const data = asRecord(payload.payload);
          if (!data || data.token !== signalingToken) return;

          if (data.kind === "sdp" && data.description) {
            const desc = data.description as RTCSessionDescriptionInit;
            try {
              await pc.setRemoteDescription(desc);
              if (desc.type === "offer") {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                sendSignal({ kind: "sdp", description: pc.localDescription });
              }
            } catch (err) {
              setError(
                err instanceof Error ? err.message : "Failed to handle SDP",
              );
            }
            return;
          }

          if (data.kind === "candidate" && data.candidate) {
            try {
              await pc.addIceCandidate(data.candidate);
            } catch {
              // ignore
            }
            return;
          }
        })
        .on("broadcast", { event: "need_turn" }, async (payload) => {
          const data = asRecord(payload.payload);
          if (!data || data.token !== signalingToken) return;

          // Peer requested TURN fallback, fetch and apply
          const turnResp = await fetchTurn({
            bookingId,
            role,
            email: role === "student" ? studentEmail || undefined : undefined,
            studentId:
              role === "student" ? localStudentId || undefined : undefined,
            teacherKey: role === "teacher" ? teacherKey.trim() : undefined,
          });

          if (turnResp.ok) {
            const stunServers =
              pc.getConfiguration().iceServers?.filter((s) => {
                const urls = s.urls;
                const list =
                  typeof urls === "string"
                    ? [urls]
                    : Array.isArray(urls)
                      ? urls
                      : [];
                return list.some(
                  (u) => typeof u === "string" && u.startsWith("stun:"),
                );
              }) ?? [];
            const combinedServers = [...stunServers, ...turnResp.iceServers];
            pc.setConfiguration({ iceServers: combinedServers });

            if (role === "student") {
              // Student waits for teacher's ICE restart offer
            } else {
              // Teacher should have already initiated, but ensure it happens
              try {
                const offer = await pc.createOffer({ iceRestart: true });
                await pc.setLocalDescription(offer);
                sendSignal({ kind: "sdp", description: pc.localDescription });
              } catch {
                // ignore
              }
            }
          }
        })
        .on("broadcast", { event: "chat" }, (payload) => {
          const data = asRecord(payload.payload);
          if (!data || data.token !== signalingToken) return;
          if (data.from === role) return; // Don't echo own messages

          const from = data.from;
          if (from === "teacher" || from === "student") {
            setMessages((prev) => [
              ...prev,
              {
                from,
                text: String(data.text ?? ""),
                at: Date.now(),
              },
            ]);
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            // Send hello to announce presence
            channel.send({
              type: "broadcast",
              event: "hello",
              payload: { token: signalingToken },
            });
          }
        });

      setPhase("in_call");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("lobby");
    } finally {
      setLoading(false);
    }
  };

  if (role === "student" && !canProceedStudent) {
    return (
      <div className="py-10 sm:py-14">
        <div className="mx-auto max-w-xl px-4">
          <Card>
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>
                We need your email to verify this booking.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="w-full">
                <Link
                  href={`/login?next=${encodeURIComponent(`/call/${bookingId}`)}`}
                >
                  Sign in
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/account">Back to account</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] py-6 sm:py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xl font-semibold">{title}</div>
            {slotInfo
              ? (() => {
                  try {
                    const zone = "Asia/Seoul";
                    const start = DateTime.fromFormat(
                      slotInfo.startTimeLabel,
                      "yyyy-MM-dd HH:mm",
                      { zone },
                    );
                    const end = DateTime.fromFormat(
                      `${slotInfo.startTimeLabel.slice(0, 10)} ${slotInfo.endTimeLabel}`,
                      "yyyy-MM-dd HH:mm",
                      { zone },
                    );
                    const now = DateTime.now().setZone(zone);
                    let startLabel = "";
                    if (start.hasSame(now, "day"))
                      startLabel = `Today at ${start.toFormat("h:mm a")}`;
                    else if (start.hasSame(now.plus({ days: 1 }), "day"))
                      startLabel = `Tomorrow at ${start.toFormat("h:mm a")}`;
                    else if (start.diff(now, "days").days < 7)
                      startLabel = `${start.toFormat("cccc")} at ${start.toFormat("h:mm a")}`;
                    else startLabel = start.toFormat("MMM d, yyyy 'at' h:mm a");
                    const endLabel = end.toFormat("h:mm a");
                    return (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {startLabel} — {endLabel}
                      </div>
                    );
                  } catch {
                    return (
                      <div className="mt-1 text-sm text-muted-foreground">
                        Starts {slotInfo.startTimeLabel} —{" "}
                        {slotInfo.endTimeLabel}
                      </div>
                    );
                  }
                })()
              : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={role === "teacher" ? "/admin" : "/account"}>
                Exit
              </Link>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <div className="font-semibold">Couldn’t join</div>
            <div className="mt-1 text-muted-foreground">
              {error === "outside join window"
                ? "The lobby opens 10 minutes before class. Please try again later."
                : error}
            </div>
          </div>
        ) : null}

        {phase !== "in_call" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Settle in</CardTitle>
                <CardDescription>
                  Prepare your camera, microphone, and speaker before you enter.
                  :)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {role === "teacher" && !isOpenMeeting ? (
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-sm text-muted-foreground">
                        Partner key
                      </span>
                      <Input
                        value={teacherKey}
                        onChange={(e) => setTeacherKey(e.target.value)}
                        placeholder="STREAM_TEACHER_KEY"
                      />
                    </label>
                    <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                      Session issuing is protected. The key is stored in your
                      browser only.
                    </div>
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
                      <Button
                        variant={waitingEnabled ? "primary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setWaitingEnabled((v) => !v);
                          addLog(
                            `Partner waiting: ${!waitingEnabled ? "enabled" : "disabled"}`,
                          );
                        }}
                        disabled={!teacherKey.trim()}
                        title={
                          !teacherKey.trim()
                            ? "Enter partner key first"
                            : "Toggle waiting status"
                        }
                      >
                        {waitingEnabled
                          ? "Waiting (sending every 5s)"
                          : "I'm waiting"}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        This keeps the door unlocked while you’re here.
                      </span>
                    </div>
                  </div>
                ) : null}

                {guestsAllowed && role === "student" && !session.state.user ? (
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="text-sm text-muted-foreground">
                        Your name
                      </span>
                      <Input
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="e.g. Minjae"
                      />
                    </label>
                    <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                      This name is visible to your partner. No login needed for
                      open meetings.
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-black p-2">
                    <video
                      ref={previewRef}
                      autoPlay
                      muted
                      playsInline
                      className="aspect-video w-full rounded-xl bg-black object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    {role === "student" && !isOpenMeeting ? (
                      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">Your partner is</div>
                          <div
                            className={
                              teacherWaiting
                                ? "text-primary"
                                : "text-muted-foreground"
                            }
                          >
                            {teacherWaiting ? "Ready" : "On the way"}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {teacherWaiting
                            ? "Your partner is waiting. You can enter when your camera and mic are ready."
                            : "Your partner isn’t here yet. Hang tight, we’ll open the door as soon as they arrive."}
                          {teacherLastSeenISO
                            ? ` (last seen ${new Date(teacherLastSeenISO).toLocaleTimeString()})`
                            : ""}
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void requestCamera()}
                          title="Allow camera"
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            hasCamera
                              ? "border-green-500 bg-green-500/20 text-green-600"
                              : cameraError
                                ? "border-red-500 bg-red-500/20 text-red-600"
                                : "border-muted-foreground/50 bg-muted/30 text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          <Video className="h-6 w-6" />
                        </button>
                        <div className="w-56 text-sm">
                          {hasCamera ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-4 w-4" /> Camera is on
                            </span>
                          ) : cameraError ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-4 w-4" /> Camera is blocked
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <AlertCircle className="h-4 w-4" /> Turn on
                              camera, please
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => void requestMic()}
                          title="Allow microphone"
                          className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            hasMic
                              ? "border-green-500 bg-green-500/20 text-green-600"
                              : micError
                                ? "border-red-500 bg-red-500/20 text-red-600"
                                : "border-muted-foreground/50 bg-muted/30 text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          <Mic className="h-6 w-6" />
                        </button>
                        <div className="w-56 text-sm">
                          {hasMic ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-4 w-4" /> Mic is on
                            </span>
                          ) : micError ? (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-4 w-4" /> Mic is blocked
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <AlertCircle className="h-4 w-4" /> Turn on mic,
                              please
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasBlocked ? (
                      <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-3 text-sm">
                        <div className="font-medium text-amber-800 dark:text-amber-200">
                          If permissions are blocked
                        </div>
                        <ul className="mt-2 list-inside list-disc space-y-1 text-amber-800/90 dark:text-amber-200/90">
                          <li>
                            Click the <strong>lock</strong> (or camera/mic icon)
                            in the address bar.
                          </li>
                          <li>
                            Set <strong>Camera</strong> and{" "}
                            <strong>Microphone</strong> permissions to{" "}
                            <strong>Allow</strong>, then <strong>reload</strong>{" "}
                            the page.
                          </li>
                          <li>
                            Chrome: Settings → Privacy and security → Site
                            Settings → Camera/Microphone.
                          </li>
                          <li>
                            If another app (Zoom/Meet/etc.) is using the device,
                            close it and try again.
                          </li>
                        </ul>
                      </div>
                    ) : null}

                    {preview ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={playSpeakerTest}
                          >
                            <Volume2 className="mr-2 h-4 w-4" />
                            <span className="max-w-[220px] truncate">
                              {speakerLine}
                            </span>
                          </Button>
                        </div>

                        <div className="rounded-lg border border-border p-3">
                          <div className="mb-2 text-sm font-medium">
                            Mic test
                          </div>
                          <p className="mb-2 text-xs text-muted-foreground">
                            Talk into your mic. The bar should move.
                          </p>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-75"
                              style={{ width: `${Math.min(100, micLevel)}%` }}
                            />
                          </div>
                        </div>

                        <label className="grid gap-1">
                          <span className="text-sm text-muted-foreground">
                            Camera
                          </span>
                          <select
                            className="h-11 rounded-full border border-border bg-white px-4 text-sm"
                            value={camId}
                            onChange={(e) => setCamId(e.target.value)}
                          >
                            {(devices?.cams ?? []).map((d) => (
                              <option key={d.deviceId} value={d.deviceId}>
                                {d.label || "Camera"}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-1">
                          <span className="text-sm text-muted-foreground">
                            Microphone
                          </span>
                          <select
                            className="h-11 rounded-full border border-border bg-white px-4 text-sm"
                            value={micId}
                            onChange={(e) => setMicId(e.target.value)}
                          >
                            {(devices?.mics ?? []).map((d) => (
                              <option key={d.deviceId} value={d.deviceId}>
                                {d.label || "Microphone"}
                              </option>
                            ))}
                          </select>
                        </label>
                      </>
                    ) : null}

                    <details className="rounded-lg border border-border">
                      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground">
                        Logs ({logs.length})
                      </summary>
                      <div className="max-h-32 overflow-y-auto border-t border-border bg-muted/20 px-3 py-2 font-mono text-[10px] leading-relaxed">
                        {logs.length === 0 ? (
                          <span className="text-muted-foreground">
                            No logs yet
                          </span>
                        ) : (
                          logs.map((line, i) => <div key={i}>{line}</div>)
                        )}
                      </div>
                    </details>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <div className="flex w-full items-center justify-between gap-3">
                  <div>
                    {loading
                      ? "Connecting…"
                      : joinBlockedByTeacher
                        ? "Your partner isn’t here yet."
                        : joinBlockedByMedia
                          ? "Allow camera and microphone to enter."
                          : "All set. See you inside."}
                  </div>
                  <Button onClick={() => void join()} disabled={joinDisabled}>
                    <span className="inline-flex items-center gap-2 font-serif">
                      {joinButtonLabel}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Last chat</CardTitle>
                  <CardDescription>
                    {lastChatSavedAt
                      ? `Saved on this device · ${relativeTimeAgo(lastChatSavedAt)}`
                      : "Saved on this device"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lastChat.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No previous messages yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lastChat.map((m, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                        >
                          <div className="text-xs text-muted-foreground">
                            {m.from === role ? "You" : "Partner"} ·{" "}
                            {relativeTimeAgo(m.at)}
                          </div>
                          <div className="mt-1 whitespace-pre-wrap">
                            {m.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-border bg-black/90 p-3">
              <div className="relative h-[60dvh] min-h-[420px] overflow-hidden rounded-xl bg-black">
                <video
                  ref={remoteRef}
                  autoPlay
                  playsInline
                  className="h-full w-full bg-black object-cover"
                />
                <div className="absolute bottom-3 right-3 h-[160px] w-[120px] overflow-hidden rounded-xl border border-white/15 bg-black shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                  <video
                    ref={localInCallRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full bg-black object-cover -scale-x-100"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => cleanup()}>
                  Hang up
                </Button>
                <Button
                  variant={micOn ? "primary" : "outline"}
                  size="sm"
                  onClick={() => {
                    setMicOn((v) => {
                      const next = !v;
                      for (const t of preview?.getAudioTracks() ?? [])
                        t.enabled = next;
                      return next;
                    });
                  }}
                >
                  Mic {micOn ? "on" : "off"}
                </Button>
                <Button
                  variant={camOn ? "primary" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCamOn((v) => {
                      const next = !v;
                      for (const t of preview?.getVideoTracks() ?? [])
                        t.enabled = next;
                      return next;
                    });
                  }}
                >
                  Camera {camOn ? "on" : "off"}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <div className="font-semibold">Chat</div>
                <div className="text-xs text-muted-foreground">
                  Saved on this device.
                </div>
              </div>
              <div className="flex h-[60dvh] min-h-[420px] flex-col">
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="space-y-2">
                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                          m.from === role
                            ? "ml-auto bg-primary text-primary-foreground"
                            : "bg-muted/40",
                        )}
                      >
                        {m.text}
                      </div>
                    ))}
                  </div>
                </div>
                <form
                  className="flex items-center gap-2 border-t border-border p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = chatText.trim();
                    if (!text) return;
                    setMessages((prev) => [
                      ...prev,
                      { from: role, text, at: Date.now() },
                    ]);
                    setChatText("");
                    sendChat(text);
                  }}
                >
                  <input
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    className="h-11 flex-1 rounded-full border border-border bg-white px-4 text-sm"
                    placeholder="Message…"
                  />
                  <Button type="submit" size="sm">
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
