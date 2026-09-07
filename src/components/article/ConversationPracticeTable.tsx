type MethodRow = {
  method: string;
  getsYou: string;
  risk: string;
  verdict: string;
};

const ROWS: MethodRow[] = [
  {
    method: "Language exchange",
    getsYou: "Real partners, real timing",
    risk: "Flirting / soft chat / no correction",
    verdict: "Works if you hunt hard",
  },
  {
    method: "Shadowing / solo / AI",
    getsYou: "Listening + mouth practice",
    risk: "Nobody waits. Nobody repairs.",
    verdict: "Rehearsal — not conversation",
  },
  {
    method: "Paid tutor",
    getsYou: "Pushed output + feedback",
    risk: "Cheap smile, no redo",
    verdict: "Cleanest weekly slot",
  },
];

/**
 * Options comparison for korean-conversation-practice.
 * Mobile: stacked cards. md+: table.
 */
export function ConversationPracticeTable() {
  return (
    <figure className="my-6 not-prose">
      <figcaption className="mb-2.5 font-serif text-[0.8125rem] font-medium tracking-[-0.01em] text-[#6b6b6b]">
        How I sort the options — from experience, not a lab ranking
      </figcaption>

      <ul className="m-0 list-none space-y-2.5 p-0 md:hidden">
        {ROWS.map((row) => (
          <li
            key={row.method}
            className="rounded-md border border-[#e8e8e8] bg-[#fafafa] px-3.5 py-3"
          >
            <p className="m-0 font-serif text-[1.05rem] font-semibold tracking-[-0.015em] text-[#242424]">
              {row.method}
            </p>
            <dl className="mt-2.5 m-0 grid gap-1.5 text-[0.875rem] leading-snug">
              <div className="flex gap-2">
                <dt className="m-0 w-[5.25rem] shrink-0 text-[#8a8a8a]">
                  You get
                </dt>
                <dd className="m-0 text-[#3a3a3a]">{row.getsYou}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="m-0 w-[5.25rem] shrink-0 text-[#8a8a8a]">
                  Watch out
                </dt>
                <dd className="m-0 text-[#3a3a3a]">{row.risk}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="m-0 w-[5.25rem] shrink-0 text-[#8a8a8a]">
                  Take
                </dt>
                <dd className="m-0 font-medium text-[#242424]">
                  {row.verdict}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-md border border-[#e8e8e8] bg-[#fafafa] md:block">
        <table className="w-full border-collapse text-left text-[0.9375rem] leading-snug text-[#242424]">
          <thead>
            <tr className="border-b border-[#e8e8e8] bg-white text-[0.75rem] font-medium uppercase tracking-[0.04em] text-[#6b6b6b]">
              <th className="px-3 py-2.5 font-medium">Option</th>
              <th className="px-3 py-2.5 font-medium">You get</th>
              <th className="px-3 py-2.5 font-medium">Watch out</th>
              <th className="px-3 py-2.5 font-medium">My take</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.method}
                className="border-b border-[#ececec] last:border-b-0"
              >
                <td className="px-3 py-3 font-serif text-[1.02rem] font-semibold tracking-[-0.015em]">
                  {row.method}
                </td>
                <td className="px-3 py-3 text-[#3a3a3a]">{row.getsYou}</td>
                <td className="px-3 py-3 text-[#3a3a3a]">{row.risk}</td>
                <td className="px-3 py-3 font-medium text-[#242424]">
                  {row.verdict}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[0.75rem] leading-relaxed text-[#8a8a8a]">
        Conversation = someone waiting + repair. The rest is rehearsal or
        social.
      </p>
    </figure>
  );
}
