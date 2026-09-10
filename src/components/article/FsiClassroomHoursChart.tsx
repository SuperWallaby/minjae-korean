type LangRow = {
  label: string;
  hours: number;
  note: string;
};

/** FSI Category I midpoint (~600) vs Category IV Korean (2,200) — state.gov. */
const ROWS: LangRow[] = [
  {
    label: "Spanish / French",
    hours: 600,
    note: "Category I · ~24–30 weeks",
  },
  {
    label: "Korean",
    hours: 2200,
    note: "Category IV · ~88 weeks",
  },
];

const MAX = 2200;

/**
 * Editorial bar chart for is-korean-hard — FSI classroom hours to ILR 3.
 * CSS only. Not a civilian self-study clock.
 */
export function FsiClassroomHoursChart() {
  return (
    <figure className="my-6 not-prose">
      <figcaption className="mb-2.5 font-serif text-[0.8125rem] font-medium tracking-[-0.01em] text-[#6b6b6b]">
        US Foreign Service Institute — classroom hours to professional working
        proficiency (ILR 3)
      </figcaption>

      <ul className="m-0 list-none space-y-4 rounded-md border border-[#e8e8e8] bg-[#fafafa] px-3.5 py-3.5">
        {ROWS.map((row) => {
          const pct = Math.round((row.hours / MAX) * 100);
          return (
            <li key={row.label} className="list-none">
              <div className="flex items-baseline justify-between gap-3">
                <p className="m-0 font-serif text-[1.02rem] font-semibold tracking-[-0.015em] text-[#242424]">
                  {row.label}
                </p>
                <p className="m-0 shrink-0 tabular-nums text-[0.9375rem] font-medium text-[#242424]">
                  ~{row.hours.toLocaleString("en-US")} hrs
                </p>
              </div>
              <span
                className="mt-1.5 block h-2 w-full overflow-hidden rounded-sm bg-[#ececec]"
                aria-hidden
              >
                <span
                  className="block h-full rounded-sm bg-[#1a8917]"
                  style={{ width: `${Math.max(pct, 6)}%` }}
                />
              </span>
              <p className="mt-1 mb-0 text-[0.75rem] leading-snug text-[#8a8a8a]">
                {row.note}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-2 text-[0.75rem] leading-relaxed text-[#8a8a8a]">
        Same job-level finish line for English speakers. Not café chat. Source:{" "}
        <a
          className="text-[#1a8917] underline decoration-[#1a8917]/40 underline-offset-2"
          href="https://www.state.gov/national-foreign-affairs-training-center/foreign-language-training"
          target="_blank"
          rel="noreferrer"
        >
          state.gov FSI language training
        </a>
        .
      </p>
    </figure>
  );
}
