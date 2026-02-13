import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "gradient"
  | "light"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-95 active:brightness-90",
  gradient:
    "text-white bg-gradient-to-b from-[#111827] to-[#0b1220] shadow-(--shadow-cta) hover:brightness-95 active:brightness-90",
  light:
    "bg-white text-[#111827] border border-black/10 hover:bg-white/90 active:bg-white/85",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 active:bg-muted/70 border border-border",
  outline:
    "bg-transparent text-foreground hover:bg-muted/50 active:bg-muted/60 border border-border",
  ghost: "bg-transparent text-foreground hover:bg-muted/60 active:bg-muted/70",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-600",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 rounded-full px-4 text-sm",
  md: "h-11 rounded-full px-5 text-sm",
  lg: "h-12 rounded-full px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  type,
  children,
  ...props
}: ButtonProps) {
  const mergedClassName = cn(
    "inline-flex items-center cursor-pointer  justify-center gap-2 whitespace-nowrap font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    variantClass[variant],
    sizeClass[size],
    className
  );

  if (asChild) {
    type AsChildProps = {
      className?: string;
    } & React.AriaAttributes &
      Record<string, unknown>;

    const child = React.Children.only(children) as React.ReactElement<AsChildProps>;

    return React.cloneElement(child, {
      className: cn(mergedClassName, child.props.className),
      ...(props.disabled ? { "aria-disabled": true } : {}),
    });
  }

  return (
    <button
      type={type ?? "button"}
      className={mergedClassName}
      children={children}
      {...props}
    />
  );
}

