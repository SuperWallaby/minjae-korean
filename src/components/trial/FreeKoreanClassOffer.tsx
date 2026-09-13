import Image from "next/image";

import styles from "./FreeKoreanClassOffer.module.css";

const SURVEY_BOOT = `
(() => {
  const boot = () => {
  const KST = "Asia/Seoul";
  const FIRST = 10;
  const LAST = 19;
  const pad = (n) => String(n).padStart(2, "0");
  const localYmd = (d) =>
    d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const kstYmd = (d) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: KST,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  const addDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return localYmd(d);
  };
  const clock = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateEl = document.getElementById("trial-date");
  const timeEl = document.getElementById("trial-time");
  const emptyEl = document.getElementById("trial-empty");
  const form = document.getElementById("trial-form");
  const thanks = document.getElementById("trial-thanks");
  const send = document.getElementById("trial-send");
  if (!dateEl || !timeEl || !form || !thanks || !send) return;
  const OPEN = "2026-09-17";
  const soonest = addDays(2);
  dateEl.min = soonest > OPEN ? soonest : OPEN;
  const latest = addDays(21);
  dateEl.max = latest > dateEl.min ? latest : dateEl.min;
  if (!dateEl.value || dateEl.value < dateEl.min) dateEl.value = dateEl.min;

  const slotsFor = (localDate) => {
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(localDate)) return [];
    const [y, m, d] = localDate.split("-").map(Number);
    const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
    const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
    const kstDays = [...new Set([kstYmd(dayStart), kstYmd(dayEnd)])];
    const slots = [];
    for (const kstDay of kstDays) {
      for (let hour = FIRST; hour <= LAST; hour += 1) {
        const instant = new Date(kstDay + "T" + pad(hour) + ":00:00+09:00");
        if (Number.isNaN(instant.getTime())) continue;
        if (localYmd(instant) !== localDate) continue;
        slots.push({ value: instant.toISOString(), label: clock.format(instant) });
      }
    }
    slots.sort((a, b) => a.value.localeCompare(b.value));
    return slots;
  };

  const paintTimes = () => {
    const slots = slotsFor(dateEl.value);
    timeEl.innerHTML = '<option value="" disabled selected>Select a time</option>';
    for (const row of slots) {
      const opt = document.createElement("option");
      opt.value = row.value;
      opt.textContent = row.label;
      timeEl.appendChild(opt);
    }
    timeEl.classList.toggle("${styles.hidden}", slots.length === 0);
    if (emptyEl) emptyEl.classList.toggle("${styles.hidden}", slots.length !== 0);
    send.disabled = true;
  };

  const syncSend = () => {
    const email = form.email.value.trim();
    send.disabled = !(email && form.level.value && form.slot.value);
  };

  dateEl.addEventListener("change", () => {
    paintTimes();
    syncSend();
  });
  form.addEventListener("input", syncSend);
  const errEl = document.getElementById("trial-error");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (send.disabled) return;
    send.disabled = true;
    if (errEl) {
      errEl.textContent = "";
      errEl.classList.add("${styles.hidden}");
    }
    const payload = {
      email: form.email.value.trim(),
      level: form.level.value,
      date: form.date.value,
      slot: form.slot.value,
      website: form.website ? form.website.value : "",
    };
    fetch("/api/public/free-korean-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json().then((j) => ({ ok: r.ok && j && j.ok })))
      .then(({ ok }) => {
        if (!ok) throw new Error("send failed");
        form.classList.add("${styles.hidden}");
        thanks.classList.remove("${styles.hidden}");
      })
      .catch(() => {
        send.disabled = false;
        if (errEl) {
          errEl.textContent =
            "Could not send. Try again or email minjae@kajakorean.com.";
          errEl.classList.remove("${styles.hidden}");
        }
      });
  });
  paintTimes();
  };
  if (document.readyState === "complete") setTimeout(boot, 50);
  else window.addEventListener("load", () => setTimeout(boot, 50));
})();
`

export function FreeKoreanClassOffer() {
  return (
    <article className={styles.page}>
      <p className={styles.kicker}>30-minute free trial</p>
      <div className={styles.intro}>
        <div className={styles.profile}>
          <Image
            src="/placeholders/minjae-desk.jpg"
            alt="Minjae"
            fill
            className={styles.profileImg}
            sizes="108px"
            priority
          />
        </div>
        <h1 className={styles.title}>Learn Korean 1-on-1 with Minjae 🇰🇷</h1>
      </div>
      <p className={styles.body}>
        Try your first <strong>30-minute Korean lesson</strong> for free.
      </p>
      <p className={styles.body}>
        Whether you&apos;re starting from scratch or already know some Korean,
        we&apos;ll tailor the lesson to your level and goals.
      </p>
      <ul className={styles.perks}>
        <li>1-on-1 Korean lesson</li>
        <li>Textbook included</li>
        <li>Beginner-friendly</li>
        <li>30-minute free trial</li>
        <li>$5 per session after the trial</li>
      </ul>
      <p className={styles.body}>
        After the free trial, 1-on-1 tutoring is <strong>$5 per session</strong>.
      </p>
      <figure className={styles.figure}>
        <Image
          className={styles.art}
          src="/brand/jjibara-phone-lesson.png?v=3"
          alt="Jjibara on a phone call with a book, and the small blue-hat sidekick standing next to him"
          width={1024}
          height={1024}
        />
      </figure>
      <h2 className={styles.sectionTitle}>
        Let&apos;s find a time that works for you.
      </h2>
      <p className={styles.body}>
        I&apos;m available <strong>10 AM–8 PM KST</strong>, starting{" "}
        <strong>September 17</strong>.
      </p>
      <p className={styles.body}>
        Fill out the form below with your email, Korean level, and preferred
        date.
      </p>
      <p id="trial-thanks" className={`${styles.thanks} ${styles.hidden}`} role="status">
        Thanks. I&apos;ll write back soon.
      </p>
      <p id="trial-error" className={`${styles.error} ${styles.hidden}`} role="alert" />
      <form id="trial-form" className={styles.form}>
        <label className={styles.srOnly} htmlFor="trial-website">
          Website
        </label>
        <input
          id="trial-website"
          className={styles.srOnly}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
        <label className={styles.label} htmlFor="trial-email">
          Email
        </label>
        <input
          id="trial-email"
          className={styles.input}
          type="email"
          name="email"
          placeholder="you@email.com"
          autoComplete="email"
          inputMode="email"
          required
        />
        <label className={styles.label} htmlFor="trial-level">
          Current Korean level
        </label>
        <select
          id="trial-level"
          className={styles.input}
          name="level"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select your level
          </option>
          <option value="absolute-beginner">Absolute beginner</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <label className={styles.label} htmlFor="trial-date">
          Date you want
        </label>
        <input
          id="trial-date"
          className={styles.input}
          type="date"
          name="date"
          required
          suppressHydrationWarning
        />
        <label className={styles.label} htmlFor="trial-time">
          Time you want
        </label>
        <p id="trial-empty" className={`${styles.note} ${styles.hidden}`}>
          No times on this date in my hours. Try the day before or after.
        </p>
        <select
          id="trial-time"
          className={styles.input}
          name="slot"
          defaultValue=""
          required
          suppressHydrationWarning
        >
          <option value="" disabled>
            Select a time
          </option>
        </select>
        <button
          id="trial-send"
          className={styles.submit}
          type="submit"
          disabled
        >
          Send
        </button>
      </form>
      <script dangerouslySetInnerHTML={{ __html: SURVEY_BOOT }} />
    </article>
  );
}
