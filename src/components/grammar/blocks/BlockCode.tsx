type Props = { code: string; language?: string };

export function BlockCode({ code, language }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[var(--surface-gray)]">
      {language ? (
        <div className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
          {language}
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 font-mono text-base leading-6 text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}
