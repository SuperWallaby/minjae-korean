"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  /** Merged with default title typography (e.g. larger heading). */
  titleClassName?: string;
  /** Merged with default description typography. */
  descriptionClassName?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  /** Widen the dialog panel (e.g. product galleries). */
  panelClassName?: string;
  /** Override default padding on the scrollable content area. */
  contentClassName?: string;
};

export function Modal({
  open,
  title,
  description,
  titleClassName,
  descriptionClassName,
  children,
  footer,
  onClose,
  panelClassName,
  contentClassName,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onMouseDown={onClose}
      />
      <div className="relative flex min-h-dvh items-center justify-center overflow-y-auto p-4 sm:p-6">
        <div
          className={cn(
            "mx-auto flex w-full max-w-lg max-h-[min(92dvh,920px)] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-(--shadow-modal)",
            panelClassName
          )}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "modal"}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="min-w-0">
              {title ? (
                <div
                  className={cn(
                    "font-serif text-lg font-semibold leading-tight",
                    titleClassName,
                  )}
                >
                  {title}
                </div>
              ) : null}
              {description ? (
                <div
                  className={cn(
                    "mt-1 text-sm text-muted-foreground",
                    descriptionClassName,
                  )}
                >
                  {description}
                </div>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 shrink-0 rounded-md p-0"
              aria-label="Close modal"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-6 py-5",
              contentClassName
            )}
          >
            {children}
          </div>
          {footer ? (
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

