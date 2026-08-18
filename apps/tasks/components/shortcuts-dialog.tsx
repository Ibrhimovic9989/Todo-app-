"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const shortcuts = [
    { key: "Cmd / Ctrl + K", action: "Open command palette" },
    { key: "C", action: "Create new task" },
    { key: "F", action: "Toggle focus mode" },
    { key: "J / K", action: "Navigate tasks" },
    { key: "Space", action: "Complete selected task" },
    { key: "E", action: "Edit selected task" },
    { key: "D", action: "Set due date" },
    { key: "#", action: "Add project/tag" },
    { key: "P1 - P4", action: "Set priority" },
    { key: "Esc", action: "Close modals" },
    { key: "?", action: "Show keyboard shortcuts" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            Tasks is built for speed. Here are the keys that matter.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid gap-2">
          {shortcuts.map(({ key, action }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span className="text-sm text-muted-foreground">{action}</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
