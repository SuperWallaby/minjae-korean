"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type ModalProps = {
  open: boolean;
  title?: string;
  description?: React.ReactNode;
  /** Merged with default title typography (e.g. larger heading). */
  titleClassName?: string;
  /** Merged with default description typography. */
  descriptionClassName?: string;
  /** Extra controls in the header row (e.g. crop actions); keep touch targets ≥44px on mobile. */
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  /** Widen the dialog panel (e.g. product galleries). */
  panelClassName?: string;
  /** Override default padding on the scrollable content area. */
  contentClassName?: string;
  /**
   * When true, shows a translucent overlay on the content area while keeping `children` mounted.
   * Use this for image crop / apply flows so the preview does not disappear (avoid conditional
   * `{busy ? <Spinner /> : <Cropper />}` which resets crop UI and confuses users).
   */
  contentBusy?: boolean;
  /** Shown on the busy overlay; keep short. */
  contentBusyText?: string;
};

export function Modal({
  open,
  title,
  description,
  titleClassName,
  descriptionClassName,
  headerActions,
  children,
  footer,
  onClose,
  panelClassName,
  contentClassName,
  contentBusy = false,
  contentBusyText,
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
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
            <div className="min-w-0 flex-1">
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
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {headerActions}
              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 min-h-11 min-w-11 shrink-0 rounded-md p-0 sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0"
                aria-label="Close modal"
                onClick={onClose}
              >
                <X className="size-5 sm:size-4" />
              </Button>
            </div>
          </div>
          <div
            className={cn(
              "relative min-h-0 flex-1 overflow-y-auto px-6 py-5",
              contentClassName
            )}
          >
            {children}
            {contentBusy ? (
              <div
                className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-card/65 px-6 backdrop-blur-[2px]"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2
                  className="size-9 shrink-0 animate-spin text-foreground/80"
                  aria-hidden
                />
                <p className="max-w-sm text-center text-sm leading-snug text-foreground/90">
                  {contentBusyText ??
                    "Processing your selection. The crop you chose is still what we use—this overlay only blocks taps while we finish."}
                </p>
              </div>
            ) : null}
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

