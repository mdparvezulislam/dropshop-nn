"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { searchAnalyticsAction } from "../actions/analytics-actions";
import type { SearchResultItem } from "@/lib/platform/platform-types";

export function AnalyticsSearch(): React.ReactElement {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const res = await searchAnalyticsAction({ query: q, limit: 10 });
    if (res.success && res.data) {
      setResults(res.data as SearchResultItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search analytics..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="h-9 w-full rounded-lg border border-border/60 bg-card pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />
        {loading && (
          <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {open && results.length > 0 && (
        <div
          ref={panelRef}
          className="absolute top-full mt-1 w-full rounded-lg border border-border/60 bg-card shadow-lg"
        >
          <div className="py-1">
            {results.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                type="button"
                onClick={() => navigate(item.href)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted/50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  {item.type === "report" ? (
                    <FileText className="h-3.5 w-3.5" />
                  ) : (
                    <BarChart3 className="h-3.5 w-3.5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsSearch;
