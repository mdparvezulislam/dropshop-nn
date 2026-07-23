"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  shortcut?: string;
  onFocus?: () => void;
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search…",
  className,
  shortcut,
  onFocus,
}: SearchBoxProps): React.ReactElement {
  return (
    <div className={cn("relative w-full group", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 pointer-events-none group-focus-within:text-primary transition-colors" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className={cn(
          "pl-9 bg-card/80 border-border/80 hover:border-border text-xs sm:text-sm transition-all",
          value ? "pr-8" : shortcut ? "pr-14" : "pr-3",
        )}
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground/70 hover:text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : shortcut ? (
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center rounded border border-border/80 bg-muted/60 px-1.5 font-mono text-[10px] text-muted-foreground">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
}

export default SearchBox;
