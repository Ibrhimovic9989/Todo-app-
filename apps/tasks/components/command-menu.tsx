"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  CheckCircle2,
  Circle,
  Command,
  Focus,
  Home,
  Inbox,
  Layers,
  LogOut,
  Plus,
  Search,
  Settings,
  Sun,
  Trash2,
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";

export type CommandMenuProps = {
  views: { id: string; name: string; href?: string }[];
  onCreateTask?: (text: string) => void;
  onToggleFocus?: () => void;
  onSignOut?: () => void;
};

export function CommandMenu({
  views,
  onCreateTask,
  onToggleFocus,
  onSignOut,
}: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setOpen((o) => !o);
  });

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const run = useCallback(
    (cb: () => void) => {
      setOpen(false);
      cb();
    },
    [setOpen]
  );

  const handleSelect = (value: string) => {
    if (value.startsWith("navigate:")) {
      const href = value.replace("navigate:", "");
      run(() => router.push(href));
    } else if (value === "action:create") {
      const text = search.trim();
      if (text && onCreateTask) {
        run(() => onCreateTask(text));
      } else {
        run(() => onCreateTask && onCreateTask(""));
      }
    } else if (value === "action:focus" && onToggleFocus) {
      run(onToggleFocus);
    } else if (value === "action:signout" && onSignOut) {
      run(onSignOut);
    }
  };

  const isMac =
    typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const kbd = isMac ? "⌘" : "Ctrl";

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or jump to a view..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>
          <span className="text-muted-foreground">
            No results. Press{" "}
            <kbd className="rounded border px-1 text-xs">Enter</kbd> to create a
            task.
          </span>
        </CommandEmpty>

        {views.length > 0 && (
          <CommandGroup heading="Views">
            <CommandItem value="navigate:/" onSelect={handleSelect}>
              <Home className="mr-2 h-4 w-4" />
              Today
            </CommandItem>
            <CommandItem value="navigate:/inbox" onSelect={handleSelect}>
              <Inbox className="mr-2 h-4 w-4" />
              Inbox
              <CommandShortcut>{kbd} I</CommandShortcut>
            </CommandItem>
            {views
              .filter((v) => v.href)
              .map((view) => (
                <CommandItem
                  key={view.id}
                  value={`navigate:${view.href}`}
                  onSelect={handleSelect}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  {view.name}
                </CommandItem>
              ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Actions">
          <CommandItem value="action:create" onSelect={handleSelect}>
            <Plus className="mr-2 h-4 w-4" />
            {search.trim() ? `Create "${search.trim()}"` : "Create new task"}
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
          <CommandItem value="action:focus" onSelect={handleSelect}>
            <Focus className="mr-2 h-4 w-4" />
            Toggle focus mode
            <CommandShortcut>F</CommandShortcut>
          </CommandItem>
          {onSignOut && (
            <CommandItem value="action:signout" onSelect={handleSelect}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Help">
          <CommandItem value="navigate:/shortcuts" onSelect={handleSelect}>
            <Command className="mr-2 h-4 w-4" />
            Keyboard shortcuts
            <CommandShortcut>?</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
