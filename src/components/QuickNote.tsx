"use client";

import * as React from "react";

export function QuickNote() {
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  React.useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-background/97 backdrop-blur-sm animate-in fade-in duration-200 overflow-auto">
      <div className="max-w-4xl mx-auto px-8 py-16 min-h-screen">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full min-h-[calc(100vh-8rem)] bg-transparent text-5xl font-medium !leading-[1.4] resize-none outline-none font-sans"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
