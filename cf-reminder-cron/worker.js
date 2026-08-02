/**
 * Cloudflare Worker: booking reminders every 5 min +
 * Photo Quiz Mon 09:00 KST +
 * Grammar (photo trial) Quiz Wed 09:00 KST +
 * popular expressions Thu 09:00 KST.
 * Set secrets: REMINDER_API_URL, ADMIN_API_KEY
 */

function seoulParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  return {
    weekday: parts.find((p) => p.type === "weekday")?.value,
    hour: Number(parts.find((p) => p.type === "hour")?.value),
    minute: Number(parts.find((p) => p.type === "minute")?.value),
  };
}

function isWeeklyQuizSlot(now = new Date()) {
  const { weekday, hour, minute } = seoulParts(now);
  return weekday === "Mon" && hour === 9 && minute < 5;
}

function isGrammarQuizSlot(now = new Date()) {
  const { weekday, hour, minute } = seoulParts(now);
  return weekday === "Wed" && hour === 9 && minute < 5;
}

function isPopularExpressionsSlot(now = new Date()) {
  const { weekday, hour, minute } = seoulParts(now);
  return weekday === "Thu" && hour === 9 && minute < 5;
}

async function callAdminApi(base, key, path, label) {
  try {
    const res = await fetch(`${base}${path}`, {
      method: "GET",
      headers: { "x-admin-key": key },
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`${label} API ${res.status}: ${text}`);
      return;
    }
    console.log(`${label} cron ok:`, text.slice(0, 300));
  } catch (err) {
    console.error(`${label} cron fetch failed:`, err);
  }
}

export default {
  async scheduled(event, env, ctx) {
    const base = (env.REMINDER_API_URL || "").replace(/\/+$/, "");
    const key = env.ADMIN_API_KEY || "";
    if (!base || !key) {
      console.error("REMINDER_API_URL or ADMIN_API_KEY not set");
      return;
    }

    await callAdminApi(base, key, "/api/admin/reminders/run", "Reminder");

    if (isWeeklyQuizSlot()) {
      await callAdminApi(
        base,
        key,
        "/api/admin/newsletter/weekly-quiz/run",
        "Photo quiz",
      );
    }

    if (isGrammarQuizSlot()) {
      await callAdminApi(
        base,
        key,
        "/api/admin/newsletter/grammar-quiz/run",
        "Grammar quiz",
      );
    }

    if (isPopularExpressionsSlot()) {
      await callAdminApi(
        base,
        key,
        "/api/admin/newsletter/popular-expressions/run",
        "Popular expressions",
      );
    }
  },
};
