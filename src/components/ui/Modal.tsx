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
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
};

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
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
      <div className="absolute inset-0 overflow-y-auto p-4 sm:p-6">
        <div
          className={cn(
            "mx-auto w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-(--shadow-modal)"
          )}
          role="dialog"
          aria-modal="true"
          aria-label={title ?? "modal"}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              {title ? (
                <div className="font-serif text-lg font-semibold leading-tight">
                  {title}
                </div>
              ) : null}
              {description ? (
                <div className="mt-1 text-sm text-muted-foreground">
                  {description}
                </div>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-md p-0"
              aria-label="Close modal"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="px-6 py-5">{children}</div>
          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

