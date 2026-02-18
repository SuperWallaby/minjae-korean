type Props = { level: 1 | 2 | 3; text: string };

const classes: Record<1 | 2 | 3, string> = {
  1: "font-serif text-2xl font-semibold tracking-tight sm:text-3xl mt-12 first:mt-0",
  2: "font-serif text-2xl font-semibold tracking-tight sm:text-3xl mt-10",
  3: "font-serif text-lg font-semibold tracking-tight sm:text-xl mt-6",
};

export function BlockHeading({ level, text }: Props) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";
  return <Tag className={classes[level]}>{text}</Tag>;
}
