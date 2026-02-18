export function BlockQuote({ text }: { text: string }) {
  return (
    <blockquote
      className="rounded-md bg-border/50 py-4 pl-5 pr-4 text-base leading-8 text-foreground italic"
    >
      {text}
    </blockquote>
  );
}
