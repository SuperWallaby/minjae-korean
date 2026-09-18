"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  KAKAO_OPEN_CHAT,
  LESSON_COPY,
  type LessonSurface,
} from "@/data/lessonOffers";
import { koreanLessonsPath } from "@/lib/trial/localhostOnly";
import styles from "./FreeKoreanClassOffer.module.css";

const KST = "Asia/Seoul";
const FIRST_HOUR = 10;
const LAST_HOUR = 19;
const OPEN_YMD = "2026-09-17";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LEVELS = [
  { value: "absolute-beginner", label: "Absolute beginner" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function localYmd(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function kstYmd(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function addDaysYmd(n: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return localYmd(d);
}

function parseYmd(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function monthLabel(year: number, monthIndex: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthIndex, 1));
}

function slotsFor(localDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) return [];
  const [y, m, d] = localDate.split("-").map(Number);
  const dayStart = new Date(y, m - 1, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
  const kstDays = [...new Set([kstYmd(dayStart), kstYmd(dayEnd)])];
  const clock = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  const slots: { value: string; label: string }[] = [];
  for (const kstDay of kstDays) {
    for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour += 1) {
      const instant = new Date(`${kstDay}T${pad(hour)}:00:00+09:00`);
      if (Number.isNaN(instant.getTime())) continue;
      if (localYmd(instant) !== localDate) continue;
      slots.push({ value: instant.toISOString(), label: clock.format(instant) });
    }
  }
  slots.sort((a, b) => a.value.localeCompare(b.value));
  return slots;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };
  return {
    date: new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(d),
    time: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(d),
  };
}

function buildRange() {
  const soonest = addDaysYmd(2);
  const min = soonest > OPEN_YMD ? soonest : OPEN_YMD;
  const latest = addDaysYmd(21);
  const max = latest > min ? latest : min;
  return { min, max };
}

export function FreeKoreanClassOffer({
  surface = "kaja",
}: {
  surface?: LessonSurface;
}) {
  const [{ min, max }] = useState(buildRange);
  const minDate = parseYmd(min);
  const maxDate = parseYmd(max);

  const [viewYear, setViewYear] = useState(minDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(minDate.getMonth());
  const [date, setDate] = useState(min);
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [error, setError] = useState("");

  const slots = useMemo(() => slotsFor(date), [date]);

  useEffect(() => {
    setSlot("");
  }, [date]);

  const canPrev =
    viewYear > minDate.getFullYear() ||
    (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth());
  const canNext =
    viewYear < maxDate.getFullYear() ||
    (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out: Array<{ ymd: string | null; day: number | null }> = [];
    for (let i = 0; i < startPad; i += 1) out.push({ ymd: null, day: null });
    for (let day = 1; day <= daysInMonth; day += 1) {
      out.push({
        ymd: `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`,
        day,
      });
    }
    while (out.length % 7 !== 0) out.push({ ymd: null, day: null });
    return out;
  }, [viewMonth, viewYear]);

  const booked = useMemo(() => formatWhen(slot), [slot]);
  const levelLabel =
    LEVELS.find((row) => row.value === level)?.label || level;

  const canSend =
    Boolean(name.trim() && email.trim() && level && date && slot) && !sending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(
        "https://getpronounce.net/api/public/free-korean-class",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            level,
            date,
            slot,
            website,
            source:
              typeof location !== "undefined" ? location.host : "kajakorean.com",
          }),
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error("send failed");
      setThanks(true);
    } catch {
      setError("Could not send. Try again or email minjae@kajakorean.com.");
      setSending(false);
    }
  }

  const pricesHref = koreanLessonsPath(surface);

  return (
    <article className={styles.page}>
      <p className={styles.kicker}>{LESSON_COPY.kicker}</p>
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
        <h1 className={styles.title}>{LESSON_COPY.title}</h1>
      </div>
      <p className={styles.body}>{LESSON_COPY.lead}</p>
      <p className={styles.body}>{LESSON_COPY.saveTime}</p>
      <ul className={styles.perks}>
        {LESSON_COPY.perks.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className={styles.body}>
        {LESSON_COPY.trialLine}{" "}
        <Link className={styles.priceLink} href={pricesHref}>
          {LESSON_COPY.priceLinkLabel}
        </Link>
      </p>
      <a
        className={styles.kakao}
        href={KAKAO_OPEN_CHAT}
        target="_blank"
        rel="noopener noreferrer"
      >
        {LESSON_COPY.kakaoCta}
      </a>
      <figure className={styles.figure}>
        <Image
          className={styles.art}
          src="/brand/minjae-phone-lesson.jpg?v=1"
          alt="Minjae on a phone lesson"
          width={1024}
          height={682}
        />
      </figure>
      {thanks ? (
        <section className={styles.ticket} role="status">
          <p className={styles.ticketKicker}>Reservation confirmed</p>
          <h2 className={styles.ticketTitle}>You&apos;re booked</h2>
          <p className={styles.ticketLead}>
            30-minute free 1:1 Korean trial with Minjae.
          </p>
          <dl className={styles.ticketMeta}>
            <div>
              <dt>When</dt>
              <dd>
                {booked.date}
                <span>{booked.time}</span>
              </dd>
            </div>
            <div>
              <dt>Name</dt>
              <dd>{name.trim()}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{email.trim()}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>{levelLabel}</dd>
            </div>
          </dl>
          <p className={styles.ticketNote}>
            I&apos;ll email you shortly to confirm the call. Check your inbox
            (and spam) at <strong>{email.trim()}</strong>. Questions in the
            meantime?{" "}
            <a href={KAKAO_OPEN_CHAT} target="_blank" rel="noopener noreferrer">
              Message me on KakaoTalk
            </a>
            .
          </p>
        </section>
      ) : (
        <>
      <h2 className={styles.sectionTitle}>Reserve a time</h2>
        <form className={styles.form} onSubmit={onSubmit}>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
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
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <label className={styles.label} htmlFor="trial-name">
            Name
          </label>
          <input
            id="trial-name"
            className={styles.input}
            type="text"
            name="name"
            placeholder="Your name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className={styles.label} id="trial-level-label">
            Current Korean level
          </p>
          <div
            className={styles.levelGrid}
            role="radiogroup"
            aria-labelledby="trial-level-label"
          >
            {LEVELS.map((row) => {
              const selected = row.value === level;
              return (
                <button
                  key={row.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`${styles.levelTab} ${selected ? styles.levelTabOn : ""}`}
                  onClick={() => setLevel(row.value)}
                >
                  {row.label}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="level" value={level} />

          <p className={styles.label}>Date</p>
          <div className={styles.cal}>
            <div className={styles.calHead}>
              <button
                type="button"
                className={styles.calNav}
                disabled={!canPrev}
                aria-label="Previous month"
                onClick={() => {
                  const next = new Date(viewYear, viewMonth - 1, 1);
                  setViewYear(next.getFullYear());
                  setViewMonth(next.getMonth());
                }}
              >
                ‹
              </button>
              <p className={styles.calMonth}>{monthLabel(viewYear, viewMonth)}</p>
              <button
                type="button"
                className={styles.calNav}
                disabled={!canNext}
                aria-label="Next month"
                onClick={() => {
                  const next = new Date(viewYear, viewMonth + 1, 1);
                  setViewYear(next.getFullYear());
                  setViewMonth(next.getMonth());
                }}
              >
                ›
              </button>
            </div>
            <div className={styles.calWeek}>
              {WEEKDAYS.map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className={styles.calGrid}>
              {cells.map((cell, i) => {
                if (!cell.ymd || cell.day == null) {
                  return <span key={`empty-${i}`} className={styles.calEmpty} />;
                }
                const open = cell.ymd >= min && cell.ymd <= max;
                const selected = cell.ymd === date;
                return (
                  <button
                    key={cell.ymd}
                    type="button"
                    disabled={!open}
                    aria-pressed={selected}
                    className={`${styles.calDay} ${selected ? styles.calDayOn : ""}`}
                    onClick={() => setDate(cell.ymd!)}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
          <input type="hidden" name="date" value={date} />

          <p className={styles.label}>Time</p>
          {slots.length === 0 ? (
            <p className={styles.note}>
              No times on this date. Try another day.
            </p>
          ) : (
            <div className={styles.timeGrid} role="listbox" aria-label="Time">
              {slots.map((row) => {
                const selected = row.value === slot;
                return (
                  <button
                    key={row.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`${styles.timeSlot} ${selected ? styles.timeSlotOn : ""}`}
                    onClick={() => setSlot(row.value)}
                  >
                    {row.label}
                  </button>
                );
              })}
            </div>
          )}
          <input type="hidden" name="slot" value={slot} />
          <button className={styles.submit} type="submit" disabled={!canSend}>
            {sending ? "Reserving…" : "Reserve Trial"}
          </button>
        </form>
        </>
      )}
    </article>
  );
}
