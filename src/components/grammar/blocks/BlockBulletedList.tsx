export function BlockBulletedList({ items }: { items: string[] }) {
  return (
    <div className="-mt-1 mb-1 pl-4">
      <ul className="list-disc space-y-1 pl-6 text-base leading-8 text-foreground">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
