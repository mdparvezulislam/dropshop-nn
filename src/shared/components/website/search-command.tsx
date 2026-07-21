"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const RECENT_SEARCHES = ["wireless headphones", "smart watch", "phone case"];
const POPULAR_SEARCHES = ["men t-shirt", "women bag", "led light", "sneakers"];

export interface SearchCommandProps {
  onClose: () => void;
}

export function SearchCommand({ onClose }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ label: string; href: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setResults([
        { label: `${query} - product 1`, href: `/product/demo-1` },
        { label: `${query} - product 2`, href: `/product/demo-2` },
      ]);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const suggestions = query.trim().length < 2;

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
            <Search className="h-4 w-4 text-foreground/40 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 py-3.5 bg-transparent text-sm text-foreground placeholder:text-foreground/30 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-foreground/30 hover:text-foreground/60"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex text-[10px] font-medium text-foreground/30 bg-muted/60 px-1.5 py-0.5 rounded border border-border/30">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {suggestions ? (
              <div className="space-y-3 p-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-3.5 w-3.5 text-foreground/40" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                      Recent
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {RECENT_SEARCHES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="px-2.5 py-1 text-xs text-foreground/60 bg-muted/50 hover:bg-muted rounded-full transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-foreground/40" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                      Popular
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCHES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="px-2.5 py-1 text-xs text-foreground/60 bg-muted/50 hover:bg-muted rounded-full transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-0.5">
                {results.map((r, i) => (
                  <Link
                    key={i}
                    href={r.href}
                    onClick={onClose}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="h-3.5 w-3.5 text-foreground/30 shrink-0" />
                      <span className="text-sm text-foreground/80">{r.label}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-foreground/40">No products found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
