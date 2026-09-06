"use client";

type Props<T extends string> = {
  label?: string;
  value: T;
  onChange: (id: T) => void;
  options: ReadonlyArray<{ id: T; label: string; hint: string }>;
  className?: string;
};

export function AccentChoiceBar<T extends string>({
  label = "Accent",
  value,
  onChange,
  options,
  className,
}: Props<T>) {
  return (
    <div
      className={className || "sound-accent"}
      role="group"
      aria-label={label}
    >
      <span className="sound-accent-label">{label}</span>
      {options.map((a) => (
        <button
          key={a.id}
          type="button"
          className={value === a.id ? "is-on" : undefined}
          aria-pressed={value === a.id}
          aria-label={a.hint}
          title={a.hint}
          onClick={() => onChange(a.id)}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
