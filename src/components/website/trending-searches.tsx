"use client";

import { TrendingUp } from "lucide-react";

const TRENDING = [
  "wireless headphones",
  "smart watch",
  "phone case",
  "men t-shirt",
  "women bag",
  "led light",
  "sneakers",
  "bluetooth speaker",
];

interface TrendingSearchesProps {
  onSelect: (query: string) => void;
  title?: string;
}

export function TrendingSearches({ onSelect, title = "Trending Searches" }: TrendingSearchesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {TRENDING.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSelect(s)}
            className="px-3 py-1.5 text-xs text-foreground/60 bg-muted/50 hover:bg-muted hover:text-foreground/80 rounded-full transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
