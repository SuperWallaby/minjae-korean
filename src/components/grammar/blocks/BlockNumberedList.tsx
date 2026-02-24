import { DescribeKorean } from "../DescribeKorean";

export function BlockNumberedList({ items }: { items: string[] }) {
  return (
    <div className="-mt-1 mb-1 pl-4">
      <ol className="list-decimal space-y-1 pl-6 text-base leading-8 text-foreground">
        {items.map((item, i) => (
          <li key={i}>
            <DescribeKorean text={item} />
          </li>
        ))}
      </ol>
    </div>
  );
}
