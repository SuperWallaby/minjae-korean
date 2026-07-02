/**
 * Cloudflare Worker: booking reminders every 5 min + weekly quiz on Mon 09:00 KST.
 * Set secrets: REMINDER_API_URL, ADMIN_API_KEY
 */

function isWeeklyQuizSlot(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  const minute = Number(parts.find((p) => p.type === "minute")?.value);
  return weekday === "Mon" && hour === 9 && minute < 5;
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
        "Weekly quiz",
      );
    }
  },
};
