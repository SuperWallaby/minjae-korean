"use client";

import * as React from "react";

const DURATION_MS = 200;

export function QuickNote() {
  const [open, setOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [entered, setEntered] = React.useState(false);
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        if (open) {
          setClosing(true);
        } else {
          setOpen(true);
          setEntered(false);
        }
      }
      if (e.key === "Escape" && open && !closing) {
        setClosing(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closing]);

  React.useEffect(() => {
    if (open && !closing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open, closing]);

  // Enter: after mount, go from opacity 0 → 1
  React.useEffect(() => {
    if (!open || closing) return;
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(t);
  }, [open, closing]);

  // Exit: after fade-out, unmount
  React.useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setEntered(false);
    }, DURATION_MS);
    return () => clearTimeout(t);
  }, [closing]);

  const opacity = closing ? 0 : entered ? 1 : 0;

  if (!open && !closing) return null;

  return (
    <div
      className="fixed inset-0 z-9999 bg-background/95 backdrop-blur-sm invisible-scrollbar overflow-auto transition-opacity duration-200"
      style={{ opacity }}
      aria-hidden={!open}
    >
      <div
        style={{ fontSize: "0px" }}
        className="max-w-4xl mx-auto px-8 text-[0px] min-h-screen"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-screen bg-transparent text-5xl font-medium !leading-[1.4] resize-none outline-none font-sans"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
