"use client";

import * as React from "react";
import type { VerbEndingEntry } from "@/data/blogPosts/verbEndingTypes";
import { Describe } from "@/components/article/Describe";
import { SoundPlayButton } from "@/components/article/SoundPlayButton";

type Props = {
  data: VerbEndingEntry[];
};

function getFrequencyLabel(freq: number): { label: string; className: string } {
  switch (freq) {
    case 5:
      return {
        label: "Very often",
        className: "text-red-600 ",
      };
    case 4:
      return {
        label: "Often",
        className: "text-amber-600",
      };
    case 3:
      return {
        label: "Common",
        className: "text-emerald-600",
      };
    case 2:
      return {
        label: "Sometimes",
        className: "text-violet-600",
      };
    case 1:
      return { label: "Rare", className: "text-slate-600" };
    default:
      return { label: "—", className: "text-muted-foreground" };
  }
}

function getDescription(entry: VerbEndingEntry): string {
  if (entry.des?.trim()) return entry.des.trim();
  return [entry.subject_constraint, entry.tense_constraint, entry.nuance]
    .filter(Boolean)
    .join(" · ");
}

export function VerbEndingTable({ data }: Props) {
  return (
    <div className="my-6">
      {/* Desktop: table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border">
        <table className="w-full max-w-full text-base border-collapse table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th className="px-2 py-3 text-center font-semibold w-[5%]">#</th>
              <th className="px-2 py-3 text-center font-semibold w-[14%]">
                Form
              </th>
              <th className="px-2 py-3 text-center font-semibold w-[10%]">
                Freq
              </th>
              <th className="px-2 py-3 text-center font-semibold w-[12%]">
                Phonetic
              </th>
              <th className="px-2 py-3 text-center font-semibold w-[12%]">
                Meaning
              </th>
              <th className="px-2 py-3 text-center font-semibold w-[17%]">
                Form rule
              </th>
              <th className="px-2 py-3 text-center font-semibold w-[30%]">
                Function
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, i) => {
              const freqLabel = getFrequencyLabel(entry.frequency);
              const desc = getDescription(entry);
              const isEven = i % 2 === 0;
              const rowBg = isEven ? "bg-background" : "bg-muted/15";
              return (
                <React.Fragment key={i}>
                  <tr
                    className={`border-b border-border ${rowBg} hover:bg-muted/25 transition-colors`}
                  >
                    <td className="px-3 py-2.5 align-middle text-center font-medium  text-primary tabular-nums">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2.5 align-middle font-medium text-center text-primary">
                      {entry.form}
                    </td>
                    <td className="px-3 py-2.5 align-middle text-center">
                      <span
                        className={`text-xs font-medium leading-none ${freqLabel.className}`}
                      >
                        {freqLabel.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 align-middle text-center text-muted-foreground text-sm">
                      {entry.phonetic}
                    </td>
                    <td className="px-3 py-2.5 align-middle text-center min-w-0 text-sm">
                      {entry.meaning}
                    </td>
                    <td className="px-3 py-2.5 align-middle text-center min-w-0 text-sm break-words">
                      {entry.form_rule}
                    </td>
                    <td className="px-3 py-2.5 align-middle text-center min-w-0 text-muted-foreground text-sm break-words">
                      {entry.function}
                    </td>
                  </tr>
                  <tr className={`border-b border-border ${rowBg}`}>
                    <td colSpan={7} className="px-3 py-2.5">
                      <p className="text-sm text-foreground/90">{desc}</p>
                      {entry.examples.length > 0 && (
                        <ul className="mt-3 space-y-2 border-t border-border pt-3">
                          {entry.examples.map((ex, j) => (
                            <li key={j} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                {ex.sound ? (
                                  <SoundPlayButton
                                    src={ex.sound}
                                    size="sm"
                                    aria-label="예문 발음 재생"
                                  />
                                ) : null}
                                <span className="cursor-pointer rounded px-1 -mx-1 hover:bg-muted/50 hover:border-b hover:border-dotted border-transparent transition-colors inline self-start text-sm">
                                  <Describe>{ex.text}</Describe>
                                </span>
                              </div>
                              <span className="text-muted-foreground text-sm pl-1">
                                {ex.meaning}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden space-y-4">
        {data.map((entry, i) => {
          const freqLabel = getFrequencyLabel(entry.frequency);
          const desc = getDescription(entry);
          return (
            <article
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden text-base"
            >
              <div className="px-3 py-3 border-b border-border bg-muted/40 flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground text-sm tabular-nums w-6">
                  {i + 1}.
                </span>
                <span className="font-medium text-foreground">
                  <Describe>{entry.form}</Describe>
                </span>
                <span
                  className={`text-xs font-medium leading-none ${freqLabel.className}`}
                >
                  {freqLabel.label}
                </span>
              </div>
              <div className="px-3 py-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                <span className="text-muted-foreground">Phonetic</span>
                <span>{entry.phonetic}</span>
                <span className="text-muted-foreground">Meaning</span>
                <span>{entry.meaning}</span>
                <span className="text-muted-foreground">Function</span>
                <span className="col-span-1 min-w-0">{entry.function}</span>
              </div>
              <div className="px-3 py-2 border-t border-border text-sm">
                <span className="text-muted-foreground">Form rule: </span>
                <Describe>{entry.form_rule}</Describe>
              </div>
              <div className="px-3 py-2 border-t border-border">
                <p className="text-sm text-foreground/90">{desc}</p>
              </div>
              {entry.examples.length > 0 && (
                <div className="px-3 py-2.5 border-t border-border">
                  <ul className="space-y-2">
                    {entry.examples.map((ex, j) => (
                      <li key={j} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          {ex.sound ? (
                            <SoundPlayButton
                              src={ex.sound}
                              size="sm"
                              aria-label="예문 발음 재생"
                            />
                          ) : null}
                          <span className="cursor-pointer rounded px-1 -mx-1 hover:bg-muted/50 hover:border-b hover:border-dotted border-transparent inline self-start text-sm">
                            <Describe>{ex.text}</Describe>
                          </span>
                        </div>
                        <span className="text-muted-foreground text-sm pl-1">
                          {ex.meaning}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
