"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Loader2, Package, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PRODUCT_IMAGE_PLACEHOLDER } from "@/config/site";
import { searchAutocompleteAction } from "@/features/catalog/actions/public-actions";

const RECENT_STORAGE_KEY = "dropshopnn_recent_searches";
const MAX_RECENT = 5;

interface AutocompleteSuggestion {
  type: "product" | "category" | "brand" | "suggestion";
  label: string;
  href?: string;
  image?: string;
  /** BDT, only for product suggestions with a configured price. */
  price?: number;
}

const TYPE_LABELS: Record<AutocompleteSuggestion["type"], string> = {
  product: "প্রোডাক্ট",
  category: "ক্যাটাগরি",
  brand: "ব্র্যান্ড",
  suggestion: "সার্চ",
};

export interface SearchInputProps {
  open: boolean;
  onClose: () => void;
}

function readRecentSearches(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string): void {
  try {
    const recent = readRecentSearches().filter((s) => s !== query);
    recent.unshift(query);
    sessionStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // Storage unavailable (private mode etc.) — recents are best-effort only.
  }
}

function formatBdt(value: number): string {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;
}

export function SearchInput({ open, onClose }: SearchInputProps): ReactElement | null {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  // Initialized empty and read in an effect — sessionStorage must never be
  // touched during render (hydration mismatch risk).
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const requestSeqRef = useRef(0);

  const showRecent = query.trim().length < 2;

  // Open: remember the invoker, load recents, focus the input.
  // Close/unmount: restore focus to the invoker.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setRecentSearches(readRecentSearches());
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      clearTimeout(timer);
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSuggestions([]);
      setSelectedIndex(-1);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const fetchSuggestions = useCallback(async (q: string): Promise<void> => {
    const seq = ++requestSeqRef.current;
    if (q.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchAutocompleteAction(q);
      if (seq !== requestSeqRef.current) return;
      if (res.success) {
        const items: AutocompleteSuggestion[] = [];
        for (const p of res.data.products) {
          items.push({
            type: "product",
            label: p.name,
            href: `/product/${p.slug}`,
            image: p.image || undefined,
            price: p.price > 0 ? p.price : undefined,
          });
        }
        for (const c of res.data.categories) {
          items.push({ type: "category", label: c.name, href: `/category/${c.slug}` });
        }
        for (const b of res.data.brands) {
          items.push({ type: "brand", label: b.name, href: `/brands/${b.slug}` });
        }
        for (const s of res.data.suggestions) {
          if (!items.some((i) => i.label === s)) {
            items.push({ type: "suggestion", label: s });
          }
        }
        setSuggestions(items.slice(0, 10));
      } else {
        setSuggestions([]);
      }
    } catch {
      if (seq === requestSeqRef.current) setSuggestions([]);
    } finally {
      if (seq === requestSeqRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => void fetchSuggestions(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  const visibleItems: AutocompleteSuggestion[] = showRecent
    ? recentSearches.map((s) => ({ type: "suggestion", label: s }))
    : suggestions;

  const handleSubmit = useCallback(
    (q: string): void => {
      if (!q.trim()) return;
      addRecentSearch(q.trim());
      onClose();
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    },
    [onClose, router],
  );

  const handleKeyDown = (e: React.KeyboardEvent): void => {
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

  const optionId = (index: number): string => `${listboxId}-option-${index}`;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed left-1/2 top-[15%] z-[61] w-full max-w-lg -translate-x-1/2">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="প্রোডাক্ট সার্চ"
          className="mx-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 focus-within:ring-2 focus-within:ring-inset focus-within:ring-amber-500">
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" aria-hidden />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="প্রোডাক্ট, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন..."
              aria-label="প্রোডাক্ট, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন"
              className="flex-1 bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              role="combobox"
              aria-expanded={visibleItems.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={selectedIndex >= 0 ? optionId(selectedIndex) : undefined}
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="সার্চ টেক্সট মুছুন"
                className="rounded p-1 text-slate-400 transition-colors hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-amber-600"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
            <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-flex">
              ESC
            </kbd>
          </div>

          <div
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="সার্চ সাজেশন"
            className="max-h-80 overflow-y-auto p-2"
          >
            {showRecent && recentSearches.length > 0 && (
              <div className="space-y-1 p-2">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    সাম্প্রতিক সার্চ
                  </span>
                </div>
                {recentSearches.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    role="option"
                    id={optionId(i)}
                    aria-selected={selectedIndex === i}
                    data-index={i}
                    onClick={() => handleSubmit(s)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-amber-600",
                      selectedIndex === i
                        ? "bg-amber-50 text-amber-900"
                        : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                    <span className="truncate">{s}</span>
                    <ArrowRight
                      className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300"
                      aria-hidden
                    />
                  </button>
                ))}
              </div>
            )}

            {showRecent && recentSearches.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm text-slate-500">
                  টাইপ করে প্রোডাক্ট, ব্র্যান্ড বা ক্যাটাগরি খুঁজুন
                </p>
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
                        id={optionId(i)}
                        aria-selected={selectedIndex === i}
                        data-index={i}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-amber-600",
                          selectedIndex === i ? "bg-amber-50" : "hover:bg-slate-100",
                        )}
                      >
                        {item.type === "product" ? (
                          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                            <Image
                              src={item.image || PRODUCT_IMAGE_PLACEHOLDER}
                              alt=""
                              aria-hidden
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </span>
                        ) : (
                          <Package className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-slate-800">
                            {item.label}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">
                            {TYPE_LABELS[item.type]}
                            {item.price !== undefined && (
                              <span className="ml-1.5 font-bold text-amber-700 tabular-nums">
                                {formatBdt(item.price)}
                              </span>
                            )}
                          </span>
                        </span>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500"
                          aria-hidden
                        />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        role="option"
                        id={optionId(i)}
                        aria-selected={selectedIndex === i}
                        data-index={i}
                        onClick={() => handleSubmit(item.label)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-amber-600",
                          selectedIndex === i ? "bg-amber-50 text-amber-900" : "hover:bg-slate-100",
                        )}
                      >
                        <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
                        <span className="truncate text-slate-800">{item.label}</span>
                        <ArrowRight
                          className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-slate-500"
                          aria-hidden
                        />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!showRecent && visibleItems.length === 0 && query.trim().length >= 2 && !loading && (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">কোনো সাজেশন পাওয়া যায়নি</p>
                <p className="mt-1 text-xs text-slate-400">
                  &ldquo;{query}&rdquo; খুঁজতে Enter চাপুন
                </p>
              </div>
            )}

            {!showRecent && loading && visibleItems.length === 0 && (
              <div className="py-8 text-center" role="status">
                <p className="animate-pulse text-sm text-slate-500">খোঁজা হচ্ছে...</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2">
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span>
                <kbd className="mr-0.5 inline-flex rounded border border-slate-200 bg-slate-100 px-1 py-0.5 text-[10px] font-medium">
                  ↑↓
                </kbd>
                নেভিগেট
              </span>
              <span>
                <kbd className="mr-0.5 inline-flex rounded border border-slate-200 bg-slate-100 px-1 py-0.5 text-[10px] font-medium">
                  ↵
                </kbd>
                খুলুন
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit(query)}
              disabled={!query.trim()}
              className="rounded text-[10px] font-bold text-amber-700 transition-colors hover:text-amber-800 disabled:cursor-not-allowed disabled:text-slate-300 focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              সব ফলাফল দেখুন
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchInput;
