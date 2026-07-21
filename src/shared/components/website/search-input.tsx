"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X, TrendingUp, Clock, ArrowRight, Package } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const RECENT_STORAGE_KEY = "dropshopnn_recent_searches";
const MAX_RECENT = 5;
const TRENDING_SEARCHES = ["wireless headphones", "smart watch", "phone case", "men t-shirt", "women bag", "led light", "sneakers", "bluetooth speaker"];

interface AutocompleteSuggestion {
  type: "product" | "category" | "brand" | "suggestion";
  label: string;
  href?: string;
  image?: string;
}

export interface SearchInputProps {
  open: boolean;
  onClose: () => void;
}

function getRecentSearches(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    sessionStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    console.info("Storage unavailable");
  }
}

export function SearchInput({ open, onClose }: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [recentSearches] = useState<string[]>(getRecentSearches);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allSuggestions = suggestions.length > 0 ? suggestions : [];
  const showRecent = query.trim().length < 2;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const { searchAutocompleteAction } = await import("@/features/catalog/actions/public-actions");
      const res = await searchAutocompleteAction(q);
      if (res.success && res.data) {
        const items: AutocompleteSuggestion[] = [];

        for (const p of res.data.products) {
          items.push({ type: "product", label: p.name, href: `/product/${p.slug}`, image: p.image });
        }

        for (const c of res.data.categories) {
          items.push({ type: "category", label: c.name, href: `/category/${c.slug}` });
        }

        for (const b of res.data.brands) {
          items.push({ type: "brand", label: b.name, href: `/brand/${b.slug}` });
        }

        for (const s of res.data.suggestions) {
          if (!items.some((i) => i.label === s)) {
            items.push({ type: "suggestion", label: s });
          }
        }

        setSuggestions(items.slice(0, 10));
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  const visibleItems: AutocompleteSuggestion[] = showRecent
    ? recentSearches.map((s) => ({ type: "suggestion", label: s }))
    : allSuggestions;

  const handleSubmit = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      addRecentSearch(q.trim());
      onClose();
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    },
    [onClose, router],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < visibleItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : visibleItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < visibleItems.length) {
        const item = visibleItems[selectedIndex];
        if (item.href) {
          onClose();
          router.push(item.href);
        } else {
          handleSubmit(item.label);
        }
      } else {
        handleSubmit(query);
      }
    }
  };

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll<HTMLElement>("[data-index]");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed left-1/2 top-[15%] z-[61] w-full max-w-lg -translate-x-1/2"
      >
        <div className="mx-4 rounded-xl border border-border/60 bg-card shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 border-b border-border/40">
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              >
                <Search className="h-4 w-4 text-foreground/40 shrink-0" />
              </motion.div>
            ) : (
              <Search className="h-4 w-4 text-foreground/40 shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, brands, categories..."
              className="flex-1 py-3.5 bg-transparent text-sm text-foreground placeholder:text-foreground/30 outline-none"
              role="combobox"
              aria-expanded={visibleItems.length > 0}
              aria-controls="search-suggestions"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-foreground/30 hover:text-foreground/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex text-[10px] font-medium text-foreground/30 bg-muted/60 px-1.5 py-0.5 rounded border border-border/30">
              ESC
            </kbd>
          </div>

          <div
            ref={listRef}
            id="search-suggestions"
            role="listbox"
            className="max-h-80 overflow-y-auto p-2"
          >
            {showRecent && recentSearches.length > 0 && (
              <div className="space-y-1 p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-3.5 w-3.5 text-foreground/40" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                    Recent
                  </span>
                </div>
                {recentSearches.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    aria-selected={selectedIndex === i}
                    data-index={i}
                    onClick={() => handleSubmit(s)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                      selectedIndex === i
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-muted/60",
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-foreground/30" />
                    <span className="truncate">{s}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0 text-foreground/20" />
                  </button>
                ))}
              </div>
            )}

            {showRecent && recentSearches.length === 0 && (
              <div className="space-y-1 p-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-foreground/40" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                    Trending
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCHES.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSubmit(s)}
                      className="px-2.5 py-1 text-xs text-foreground/60 bg-muted/50 hover:bg-muted rounded-full transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!showRecent && visibleItems.length > 0 && (
              <div className="space-y-0.5">
                {visibleItems.map((item, i) => (
                  <div key={`${item.type}-${item.label}`}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={onClose}
                        role="option"
                        aria-selected={selectedIndex === i}
                        data-index={i}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                          selectedIndex === i
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/60",
                        )}
                      >
                        <Package className="h-3.5 w-3.5 shrink-0 text-foreground/30" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground/80 truncate block">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-foreground/30 uppercase tracking-wider">
                            {item.type}
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedIndex === i}
                        data-index={i}
                        onClick={() => handleSubmit(item.label)}
                        className={cn(
                          "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors group",
                          selectedIndex === i
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/60",
                        )}
                      >
                        <Search className="h-3.5 w-3.5 shrink-0 text-foreground/30" />
                        <span className="truncate text-foreground/80">{item.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!showRecent && visibleItems.length === 0 && query.trim().length >= 2 && !loading && (
              <div className="py-8 text-center">
                <p className="text-sm text-foreground/40">No suggestions found</p>
                <p className="text-xs text-foreground/30 mt-1">
                  Press Enter to search for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}

            {!showRecent && loading && (
              <div className="py-8 text-center">
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-sm text-foreground/40"
                >
                  Searching...
                </motion.div>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-border/30 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-foreground/30">
              <span>
                <kbd className="inline-flex text-[10px] font-medium bg-muted/60 px-1 py-0.5 rounded border border-border/30 mr-0.5">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span>
                <kbd className="inline-flex text-[10px] font-medium bg-muted/60 px-1 py-0.5 rounded border border-border/30 mr-0.5">
                  ↵
                </kbd>
                Open
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit(query)}
              className="text-[10px] font-medium text-primary/70 hover:text-primary transition-colors"
            >
              View all results
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
