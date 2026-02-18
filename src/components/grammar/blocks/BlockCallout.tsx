type Props = { text: string; emoji?: string };

export function BlockCallout({ text, emoji }: Props) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
      {emoji ? (
        <span className="text-lg leading-7" aria-hidden>
          {emoji}
        </span>
      ) : null}
      <p className="text-base leading-8 text-foreground">{text}</p>
    </div>
  );
}
