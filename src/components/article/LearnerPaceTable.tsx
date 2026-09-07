type LearnerRow = {
  label: string;
  share: string;
  pct: number;
  time: string;
  habit: string;
};

const ROWS: LearnerRow[] = [
  {
    label: "Outlier",
    share: "3%",
    pct: 3,
    time: "3 months ~ 1–2 years",
    habit: "Heavy speaking every day",
  },
  {
    label: "Ordinary good",
    share: "20%",
    pct: 20,
    time: "~3 years",
    habit: "~1 hour a day",
  },
  {
    label: "Laid-back",
    share: "77%",
    pct: 77,
    time: "10+ years",
    habit: "Hobby / on and off",
  },
];

function ShareBar({ share, pct }: { share: string; pct: number }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="tabular-nums text-[0.9375rem] font-medium text-[#242424]">
        {share}
      </span>
      <span
        className="block h-1.5 w-full overflow-hidden rounded-sm bg-[#ececec]"
        aria-hidden
      >
        <span
          className="block h-full rounded-sm bg-[#1a8917]"
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </span>
    </div>
  );
}

/**
 * Editorial comparison for the how-long post — CSS cards/table, not AI art.
 * Mobile: stacked cards. md+: table.
 */
export function LearnerPaceTable() {
  return (
    <figure className="my-6 not-prose">
      <figcaption className="mb-2.5 font-serif text-[0.8125rem] font-medium tracking-[-0.01em] text-[#6b6b6b]">
        From ~1000 learners I&apos;ve met — rough mix, not a lab study
      </figcaption>

      {/* Mobile: stacked cards — no horizontal scroll */}
      <ul className="m-0 list-none space-y-2.5 p-0 md:hidden">
        {ROWS.map((row) => (
          <li
            key={row.label}
            className="rounded-md border border-[#e8e8e8] bg-[#fafafa] px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="m-0 font-serif text-[1.05rem] font-semibold tracking-[-0.015em] text-[#242424]">
                {row.label}
              </p>
              <div className="w-[4.75rem] shrink-0">
                <ShareBar share={row.share} pct={row.pct} />
              </div>
            </div>
            <dl className="mt-2.5 m-0 grid gap-1.5 text-[0.875rem] leading-snug">
              <div className="flex gap-2">
                <dt className="m-0 w-[5.5rem] shrink-0 text-[#8a8a8a]">
                  Daily talk
                </dt>
                <dd className="m-0 text-[#3a3a3a]">{row.time}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="m-0 w-[5.5rem] shrink-0 text-[#8a8a8a]">
                  Habit
                </dt>
                <dd className="m-0 text-[#3a3a3a]">{row.habit}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop / tablet: table */}
      <div className="hidden overflow-hidden rounded-md border border-[#e8e8e8] bg-[#fafafa] md:block">
        <table className="w-full border-collapse text-left text-[0.9375rem] leading-snug text-[#242424]">
          <thead>
            <tr className="border-b border-[#e8e8e8] bg-white text-[0.75rem] font-medium uppercase tracking-[0.04em] text-[#6b6b6b]">
              <th className="px-3 py-2.5 font-medium">Type</th>
              <th className="w-[6.5rem] px-3 py-2.5 font-medium">Share</th>
              <th className="px-3 py-2.5 font-medium">To daily talk</th>
              <th className="px-3 py-2.5 font-medium">Habit</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.label}
                className="border-b border-[#ececec] last:border-b-0"
              >
                <td className="px-3 py-3 font-serif text-[1.02rem] font-semibold tracking-[-0.015em]">
                  {row.label}
                </td>
                <td className="px-3 py-3 align-middle">
                  <ShareBar share={row.share} pct={row.pct} />
                </td>
                <td className="px-3 py-3 text-[#3a3a3a]">{row.time}</td>
                <td className="px-3 py-3 text-[#3a3a3a]">{row.habit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[0.75rem] leading-relaxed text-[#8a8a8a]">
        “Daily talk” = natural friendly conversation with me — not business, not
        an exam.
      </p>
    </figure>
  );
}
