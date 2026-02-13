import fs from "fs";
import path from "path";

import type { WeeklyPattern } from "./slotPatterns";

export type AdminSettings = {
  businessTimeZone: string; // IANA, e.g. Asia/Seoul
  weeklyPattern: WeeklyPattern;
};

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SETTINGS_PATH)) {
    const seed: AdminSettings = {
      businessTimeZone: "Asia/Seoul",
      weeklyPattern: {},
    };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export function readAdminSettings(): AdminSettings {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
    const json = JSON.parse(raw) as Partial<AdminSettings>;
    return {
      businessTimeZone: typeof json.businessTimeZone === "string" ? json.businessTimeZone : "Asia/Seoul",
      weeklyPattern: (json.weeklyPattern ?? {}) as WeeklyPattern,
    };
  } catch {
    return { businessTimeZone: "Asia/Seoul", weeklyPattern: {} };
  }
}

export function writeAdminSettings(next: AdminSettings) {
  ensureDataDir();
  fs.writeFileSync(
    SETTINGS_PATH,
    JSON.stringify(
      {
        businessTimeZone: next.businessTimeZone,
        weeklyPattern: next.weeklyPattern ?? {},
      },
      null,
      2
    ),
    "utf-8"
  );
}

