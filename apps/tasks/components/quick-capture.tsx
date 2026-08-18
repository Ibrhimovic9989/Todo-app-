"use client";

import { useState } from "react";
import { Plus, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseQuickCapture } from "@/lib/quick-capture";

export function QuickCapture({
  onSubmit,
  placeholder = "Add a task...",
}: {
  onSubmit: (text: string) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    onSubmit(value);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-border bg-card px-5 pl-12 pr-28 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      />
      <Plus className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      {text.length === 0 && (
        <div className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs text-muted-foreground">
          <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">C</kbd>
          <span>to add</span>
        </div>
      )}
    </form>
  );
}
