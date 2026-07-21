"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Dialog, DialogContent, DialogTitle } from "@/shared/components/ui/dialog";

export interface CommandItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  group: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands?: CommandItem[];
  placeholder?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  commands = [],
  placeholder = "Type a command or search…",
}: CommandPaletteProps): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.href.toLowerCase().includes(q),
    );
  }, [query, commands]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  React.useEffect(() => {
    setActive(0);
  }, [query]);

  const run = (href: string): void => {
    onOpenChange(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      e.preventDefault();
      run(filtered[active].href);
    }
  };

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const cmd of filtered) {
      const list = map.get(cmd.group) || [];
      list.push(cmd);
      map.set(cmd.group, list);
    }
    return map;
  }, [filtered]);

  let flatIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Command search"
          />
          <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ESC
          </kbd>
        </div>
        <div className="ws-scroll max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matching commands
            </p>
          ) : (
            Array.from(groups.entries()).map(([group, items]) => (
              <div key={group} className="mb-2">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </div>
                <ul>
                  {items.map((cmd) => {
                    flatIndex += 1;
                    const idx = flatIndex;
                    const Icon = cmd.icon;
                    return (
                      <li key={cmd.id}>
                        <button
                          type="button"
                          onClick={() => run(cmd.href)}
                          onMouseEnter={() => setActive(idx)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors",
                            idx === active
                              ? "bg-primary/10 text-foreground"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 text-left">{cmd.label}</span>
                          <span className="hidden max-w-[140px] truncate text-[10px] text-muted-foreground/70 sm:inline">
                            {cmd.href}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-3 border-t border-border px-3 py-2 text-[10px] text-muted-foreground">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
          <span className="ml-auto">⌘K</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;
