"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { SortOption } from "./product-listing-content";

interface ProductSortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  rating: "Highest Rated",
  featured: "Featured",
};

export function ProductSortSelect({ value, onChange }: ProductSortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
      <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <SelectItem key={key} value={key} className="text-sm">
              {SORT_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
