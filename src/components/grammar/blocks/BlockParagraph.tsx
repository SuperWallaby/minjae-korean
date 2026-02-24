import { DescribeKorean } from "../DescribeKorean";

export function BlockParagraph({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <p className="text-base leading-8 text-foreground">
      {lines.map((line, i) => (
        <span key={i}>
          <DescribeKorean text={line} />
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </p>
  );
}
