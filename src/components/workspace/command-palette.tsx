"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { Search, CornerDownLeft, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  placeholder = "Type a command or search products, orders, settings…",
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
      setTimeout(() => inputRef.current?.focus(), 10);
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
      <DialogContent className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 border border-border/80 bg-card/95 backdrop-blur-md shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">Command palette</DialogTitle>

        {/* Input Bar */}
        <div className="flex items-center gap-3 border-b border-border/80 px-4">
          <Search className="h-4 w-4 shrink-0 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="flex h-13 w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground/60 text-foreground"
            aria-label="Command search"
          />
          <kbd className="hidden rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="ws-scroll max-h-84 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-10 text-center text-xs font-medium text-muted-foreground">
              No matching commands, products, or pages found.
            </p>
          ) : (
            Array.from(groups.entries()).map(([group, items]) => (
              <div key={group} className="mb-2 last:mb-0">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {group}
                </div>
                <ul className="space-y-0.5">
                  {items.map((cmd) => {
                    flatIndex += 1;
                    const idx = flatIndex;
                    const Icon = cmd.icon;
                    const isSelected = idx === active;

                    return (
                      <li key={cmd.id}>
                        <button
                          type="button"
                          onClick={() => run(cmd.href)}
                          onMouseEnter={() => setActive(idx)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-150",
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-xs font-bold"
                              : "text-foreground hover:bg-muted/60",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isSelected ? "text-primary-foreground" : "text-primary",
                            )}
                          />
                          <span className="flex-1 text-left truncate">{cmd.label}</span>
                          <span
                            className={cn(
                              "hidden max-w-[140px] truncate text-[10px] font-mono sm:inline",
                              isSelected
                                ? "text-primary-foreground/90"
                                : "text-muted-foreground/60",
                            )}
                          >
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

        {/* Keyboard Shortcuts Footer */}
        <div className="flex items-center justify-between border-t border-border/80 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 font-medium">
              <kbd className="rounded bg-muted border border-border px-1 py-0.5 text-[10px]">
                <ArrowUp className="h-2.5 w-2.5 inline" />
                <ArrowDown className="h-2.5 w-2.5 inline" />
              </kbd>{" "}
              Navigate
            </span>
            <span className="inline-flex items-center gap-1 font-medium">
              <kbd className="rounded bg-muted border border-border px-1 py-0.5 text-[10px]">
                <CornerDownLeft className="h-2.5 w-2.5 inline" />
              </kbd>{" "}
              Select
            </span>
          </div>
          <span className="font-mono text-[10px] text-primary font-bold">Raycast Quick Search</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;
