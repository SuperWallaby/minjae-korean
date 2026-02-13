export type SupportTypingState = {
  member: boolean;
  support: boolean;
};

type Entry = {
  memberUntil: number;
  supportUntil: number;
};

const TTL_MS = 4500;
const store = new Map<string, Entry>();

function now() {
  return Date.now();
}

function getEntry(threadId: string): Entry {
  const existing = store.get(threadId);
  if (existing) return existing;
  const next: Entry = { memberUntil: 0, supportUntil: 0 };
  store.set(threadId, next);
  return next;
}

export function setTyping(threadId: string, who: "member" | "support", isTyping: boolean) {
  const e = getEntry(threadId);
  const until = isTyping ? now() + TTL_MS : 0;
  if (who === "member") e.memberUntil = until;
  else e.supportUntil = until;
}

export function getTyping(threadId: string): SupportTypingState {
  const e = store.get(threadId);
  if (!e) return { member: false, support: false };
  const t = now();
  const member = e.memberUntil > t;
  const support = e.supportUntil > t;
  if (!member && !support) store.delete(threadId);
  return { member, support };
}

