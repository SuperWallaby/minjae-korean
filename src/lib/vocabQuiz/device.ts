import { DEVICE_ID_KEY } from "./constants";

const SAFE_DEVICE_ID = /^web_[a-zA-Z0-9._:-]{8,120}$/;

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "web_server_placeholder";
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY)?.trim();
    if (existing && SAFE_DEVICE_ID.test(existing)) return existing;
    const id = `web_${crypto.randomUUID().replace(/-/g, "")}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return `web_${Date.now().toString(36)}`;
  }
}
