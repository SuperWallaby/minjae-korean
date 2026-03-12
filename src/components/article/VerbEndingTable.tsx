"use client";

import * as React from "react";
import type { VerbEndingEntry } from "@/data/blogPosts/verbEndingTypes";
import { Describe } from "@/components/article/Describe";
import { SoundPlayButton } from "@/components/article/SoundPlayButton";
import { RenderIfVisible } from "@/components/article/RenderIfVisible";

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

function getTypeLabel(type: string): string {
  const t = type.trim();
  if (t === "연결") return "Connection";
  if (t === "보조") return "Auxiliary";
  if (t === "종결") return "Sentence-ending";
  return t;
}

function buildSearchKey(entry: VerbEndingEntry): string {
  const parts: string[] = [];
  if (entry.form) parts.push(entry.form);
  if (entry.phonetic) parts.push(entry.phonetic);
  if (entry.meaning) parts.push(entry.meaning);
  if (entry.type) parts.push(entry.type);
  if (entry.function) parts.push(entry.function);
  if (entry.des) parts.push(entry.des);

  // 예문 텍스트/뜻도 검색에 포함
  for (const ex of entry.examples ?? []) {
    if (ex.text) parts.push(ex.text);
    if (ex.meaning) parts.push(ex.meaning);
  }

  const raw = parts.join(" ").toLowerCase();
  // 검색용 정규화: 하이픈, 괄호, 슬래시, 물음표 등 제거/공백화
  return raw
    .replace(/[-–—_/·]/g, " ")
    .replace(/[()\\[\\]{}]/g, " ")
    .replace(/[?.,!…~]/g, " ")
    .replace(/\\s+/g, " ")
    .trim();
}

function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(/[-–—_/·]/g, " ")
    .replace(/[()\\[\\]{}]/g, " ")
    .replace(/[?.,!…~]/g, " ")
    .replace(/\\s+/g, " ")
    .trim();
}

export function VerbEndingTable({ data }: Props) {
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const typeOptions = React.useMemo(
    () =>
      Array.from(
        new Set(
          (data ?? [])
            .map((d) => d.type?.trim())
            .filter((t): t is string => Boolean(t)),
        ),
      ),
    [data],
  );

  const searchIndex = React.useMemo(() => {
    const index = new Map<string, string>();
    for (const entry of data) {
      const key = buildSearchKey(entry);
      index.set(entry.form, key || "");
    }
    return index;
  }, [data]);

  const filtered = React.useMemo(() => {
    const trimmed = query.trim();
    // 검색어가 완전히 비어 있거나 1글자일 때는 type 필터만 적용
    // (짧은 타이핑 단계에서 정규화/검색 비용 줄이기)
    if (!trimmed || trimmed.length < 2) {
      return data.filter(
        (entry) => typeFilter === "all" || entry.type?.trim() === typeFilter,
      );
    }

    const q = normalizeQuery(trimmed);
    const tokens = q ? q.split(" ") : [];
    if (!tokens.length) {
      return data.filter(
        (entry) => typeFilter === "all" || entry.type?.trim() === typeFilter,
      );
    }

    return data.filter((entry) => {
      if (typeFilter !== "all" && entry.type?.trim() !== typeFilter) {
        return false;
      }
      const key = searchIndex.get(entry.form) ?? "";
      if (!key) return false;
      // 모든 토큰이 검색 키 안에 포함되어야 통과
      return tokens.every((t) => key.includes(t));
    });
  }, [data, typeFilter, query, searchIndex]);

  return (
    <div className="my-6">
      <div className="mb-4 flex md:flex-row flex-col flex-wrap items-center gap-3">
        <div className="relative w-full flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="-아서, 아/어요, …"
            className="w-full rounded-full border border-border bg-background px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {typeOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`rounded-full border px-3 py-2 transition ${
                typeFilter === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/60"
              }`}
            >
              All
            </button>
            {typeOptions.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-full border px-3 py-2 transition ${
                  typeFilter === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {getTypeLabel(t)}
              </button>
            ))}
          </div>
        )}

        {/* Desktop: table */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-border">
          <table className="w-full max-w-full text-base border-collapse table-fixed">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="px-2 py-3 text-center font-semibold w-[5%]">
                  #
                </th>
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
              {filtered.map((entry, i) => {
                const freqLabel = getFrequencyLabel(entry.frequency);
                const desc = getDescription(entry);
                const isEven = i % 2 === 0;
                const rowBg = isEven ? "bg-background" : "bg-muted/15";
                return (
                  <React.Fragment key={`${entry.form}-${i}`}>
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
                      <td className="px-3 py-2.5 align-middle text-center min-w-0 text-sm wrap-break-word">
                        {entry.form_rule}
                      </td>
                      <td className="px-3 py-2.5 align-middle text-center min-w-0 text-muted-foreground text-sm wrap-break-word">
                        {entry.function}
                      </td>
                    </tr>
                    <RenderIfVisible
                      as="tr"
                      className={`border-b border-border ${rowBg}`}
                    >
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
                    </RenderIfVisible>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile: cards */}
        <div className="md:hidden space-y-4">
          {filtered.map((entry, i) => {
            const freqLabel = getFrequencyLabel(entry.frequency);
            const desc = getDescription(entry);
            return (
              <RenderIfVisible
                key={`${entry.form}-${i}`}
                className="rounded-xl border border-border bg-card overflow-hidden text-base"
              >
                <article>
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
              </RenderIfVisible>
            );
          })}
        </div>
      </div>
    </div>
  );
}
