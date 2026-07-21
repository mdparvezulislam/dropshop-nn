"use client";

import { SearchX, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { TrendingSearches } from "@/shared/components/website/trending-searches";

interface EmptySearchProps {
  query: string;
}

export function EmptySearch({ query }: EmptySearchProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-5 mb-5">
        <SearchX className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">No Results Found</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-2">
        We couldn&apos;t find any products matching &ldquo;<span className="text-foreground font-medium">{query}</span>&rdquo;
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        Try adjusting your search terms or filters, or browse trending searches below.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/")}
        className="gap-1.5 mb-10"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Browse Homepage
      </Button>

      <div className="w-full max-w-lg text-left">
        <TrendingSearches onSelect={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)} />
      </div>
    </div>
  );
}
