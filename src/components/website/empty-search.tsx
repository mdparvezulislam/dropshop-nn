"use client";

import { SearchX, RotateCcw, Flame, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptySearchProps {
  query: string;
}

const POPULAR_SEARCH_CHIPS = [
  "Power Bank 30000mAh",
  "TWS Earbuds",
  "Smart Watch",
  "WiFi Router",
  "Type-C Fast Charger",
  "Security Camera 1080P",
];

export function EmptySearch({ query }: EmptySearchProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-border/80 p-8 shadow-xs">
      <div className="rounded-full bg-amber-50 p-5 mb-4 text-amber-600 border border-amber-200">
        <SearchX className="h-10 w-10" />
      </div>
      <h3 className="text-xl font-black text-foreground mb-1">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-2 font-medium">
        &ldquo;<span className="text-amber-600 font-extrabold">{query}</span>&rdquo; এর সাথে মিল
        রেখে কোনো প্রোডাক্ট আমাদের তালিকায় পাওয়া যায়নি।
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        বানান পরীক্ষা করুন অথবা নিচের জনপ্রিয় সার্চ কি-ওয়ার্ডগুলো ট্রাই করুন।
      </p>

      <div className="flex items-center gap-3 mb-8">
        <Button
          size="sm"
          onClick={() => router.push("/products")}
          className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs h-9 px-4 shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          সকল প্রোডাক্ট দেখুন
        </Button>
      </div>

      {/* Popular Search Chips */}
      <div className="w-full max-w-md text-left pt-4 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground mb-3">
          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
          <span>জনপ্রিয় সার্চ কি-ওয়ার্ড সমূহ:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => router.push(`/search?q=${encodeURIComponent(chip)}`)}
              className="px-3 py-1.5 rounded-full bg-muted/60 hover:bg-amber-50 hover:text-amber-700 border border-border/60 text-xs font-bold text-foreground/80 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptySearch;
