/**
 * Cloudflare Worker: runs every 5 minutes and calls the reminder API.
 * Set secrets: REMINDER_API_URL, ADMIN_API_KEY
 */
export default {
  async scheduled(event, env, ctx) {
    const base = (env.REMINDER_API_URL || "").replace(/\/+$/, "");
    const key = env.ADMIN_API_KEY || "";
    if (!base || !key) {
      console.error("REMINDER_API_URL or ADMIN_API_KEY not set");
      return;
    }
    const url = `${base}/api/admin/reminders/run`;
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "x-admin-key": key },
      });
      const text = await res.text();
      if (!res.ok) {
        console.error(`Reminder API ${res.status}: ${text}`);
        return;
      }
      console.log("Reminder cron ok:", text.slice(0, 200));
    } catch (err) {
      console.error("Reminder cron fetch failed:", err);
    }
  },
};
