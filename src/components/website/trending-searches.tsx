"use client";

import type { ReactElement } from "react";
import { TrendingUp } from "lucide-react";

export interface TrendingSearchesProps {
  /** Real terms from live catalog data (e.g. top category names) — never hardcoded. */
  terms: string[];
  onSelect: (query: string) => void;
  title?: string;
}

export function TrendingSearches({
  terms,
  onSelect,
  title = "জনপ্রিয় ক্যাটাগরি",
}: TrendingSearchesProps): ReactElement | null {
  if (terms.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-amber-500" aria-hidden />
        <span className="text-sm font-extrabold text-slate-900">{title}</span>
      </div>
      <ul className="flex flex-wrap gap-2">
        {terms.map((term) => (
          <li key={term}>
            <button
              type="button"
              onClick={() => onSelect(term)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-2 focus-visible:outline-amber-600"
            >
              {term}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TrendingSearches;
